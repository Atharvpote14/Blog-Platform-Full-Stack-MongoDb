const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  'http://localhost:3000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

const oauthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const googleAuth = (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');

  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000,
  });

  const authUrl = oauthClient.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'profile', 'email'],
    state,
    prompt: 'select_account',
  });

  res.redirect(authUrl);
};

const googleCallback = async (req, res, next) => {
  const { code, state } = req.query;

  try {
    const savedState = req.cookies.oauth_state;
    if (!code || !state || !savedState || state !== savedState) {
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    res.clearCookie('oauth_state');

    const { tokens } = await oauthClient.getToken(code);

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.redirect(`${FRONTEND_URL}/login?error=email_not_verified`);
    }

    let user = await User.findOne({ googleId: sub }).select('+googleId');

    if (!user) {
      user = await User.findOne({ email }).select('+password +googleId');

      if (user) {
        user.googleId = sub;
        user.avatar = user.avatar || picture;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar: picture,
        googleId: sub,
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    res.clearCookie('oauth_state');
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
};

module.exports = { googleAuth, googleCallback };
