import { ListChecks } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** App mark + name. Used in the navbar and on the auth pages. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/sheet"
      className={cn("inline-flex items-center gap-2 text-sm font-semibold", className)}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ListChecks className="size-4" aria-hidden />
      </span>
      DSA Sheet
    </Link>
  );
}
