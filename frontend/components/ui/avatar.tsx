import * as React from "react";
import { Compass, User } from "lucide-react";
import { cn } from "../../lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "model" | "system";
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ className, role, imageUrl, size = "md", ...props }: AvatarProps) {
  const isAssistant = role === "model" || role === "system";

  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full overflow-hidden border",
        {
          "h-8 w-8": size === "sm",
          "h-10 w-10": size === "md",
          "h-12 w-12": size === "lg",
        },
        {
          "border-primary bg-secondary/80 text-primary": !isAssistant,
          "border-accent bg-card text-accent": isAssistant,
        },
        className
      )}
      {...props}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`${role} avatar`} className="h-full w-full object-cover" />
      ) : isAssistant ? (
        <Compass className={cn("animate-pulse", {
          "h-4 w-4": size === "sm",
          "h-5 w-5": size === "md",
          "h-6 w-6": size === "lg",
        })} />
      ) : (
        <User className={cn({
          "h-4 w-4": size === "sm",
          "h-5 w-5": size === "md",
          "h-6 w-6": size === "lg",
        })} />
      )}
    </div>
  );
}

export default Avatar;
