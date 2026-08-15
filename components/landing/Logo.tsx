import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-1.5", className)}>
      <Heart
        className={cn("h-6 w-6", light ? "text-white" : "text-primary")}
        fill="currentColor"
      />
      <span
        className={cn(
          "font-heading text-xl lg:text-2xl italic tracking-tight",
          light ? "text-white" : "text-primary"
        )}
      >
        UcapanPacar
      </span>
    </Link>
  );
}
