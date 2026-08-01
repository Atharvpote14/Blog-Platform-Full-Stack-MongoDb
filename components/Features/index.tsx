import {
  BookOpen,
  Heart,
  MessageCircle,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Blazing-fast page loads and instant interactions powered by modern web technology.",
  },
  {
    icon: Search,
    title: "Powerful Search",
    description:
      "Find exactly what you're looking for with full-text search, filters, and smart sorting.",
  },
  {
    icon: Heart,
    title: "Engage & Connect",
    description:
      "Likes and comments bring your writing to life with a thriving reader community.",
  },
  {
    icon: BookOpen,
    title: "Immersive Reading",
    description:
      "Clean typography and distraction-free layouts keep readers focused on your words.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Your account is protected with industry-standard authentication and encryption.",
  },
  {
    icon: MessageCircle,
    title: "Join Discussions",
    description:
      "Meaningful conversations happen here — reply, discuss, and share perspectives.",
  },
];

export function Features() {
  return (
    <section className="py-20" aria-label="Features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Why BlogSphere
          </p>
          <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">write brilliantly</span>
          </h2>
          <p className="text-muted">
            A thoughtfully crafted platform that gets out of your way and lets
            your ideas take center stage.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass card-hover group rounded-2xl p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-bg shadow-glow transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-5.5 w-5.5 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
