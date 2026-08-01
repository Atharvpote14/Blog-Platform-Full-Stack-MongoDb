import Image from "next/image";
import { getInitials } from "@/utils/format";
import { resolveImageUrl } from "@/lib/images";
import { cn } from "@/utils/cn";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function UserAvatar({
  name,
  avatar,
  size = "md",
  className,
}: UserAvatarProps) {
  const src = resolveImageUrl(avatar);
  const isLocalPreview = /^(blob|data):/i.test(src);

  if (src) {
    const imgClass = cn(
      "shrink-0 rounded-full object-cover ring-2 ring-primary/30",
      sizes[size],
      className
    );

    if (isLocalPreview) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={`${name}'s avatar`} className={imgClass} />;
    }

    return (
      <Image
        src={src}
        alt={`${name}'s avatar`}
        width={96}
        height={96}
        className={imgClass}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full gradient-bg font-bold text-white ring-2 ring-primary/30",
        sizes[size],
        className
      )}
      aria-label={`${name}'s avatar`}
    >
      {getInitials(name)}
    </div>
  );
}
