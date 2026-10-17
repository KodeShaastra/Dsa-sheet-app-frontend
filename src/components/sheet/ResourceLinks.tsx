import { FileText, PlayCircle, SquareCode, type LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/api";

function practiceLabel(url: string) {
  const host = new URL(url).hostname;
  if (host.includes("leetcode")) return "Practice on LeetCode";
  if (host.includes("codeforces")) return "Practice on Codeforces";
  return "Practice";
}

interface Slot {
  href: string | null;
  label: string;
  missing: string;
  Icon: LucideIcon;
}

/**
 * Video / practice / article icons, always in that order so every row lines up.
 * A missing link shows a faded icon that can't be clicked, with a "No … yet" tooltip.
 */
export function ResourceLinks({ problem }: { problem: Problem }) {
  const slots: Slot[] = [
    {
      href: problem.youtubeUrl,
      label: "Watch the video",
      missing: "No video yet",
      Icon: PlayCircle,
    },
    {
      href: problem.practiceUrl,
      label: problem.practiceUrl ? practiceLabel(problem.practiceUrl) : "Practice",
      missing: "No practice link yet",
      Icon: SquareCode,
    },
    {
      href: problem.articleUrl,
      label: "Read the article",
      missing: "No article yet",
      Icon: FileText,
    },
  ];

  return (
    <div className="flex shrink-0 items-center">
      {slots.map(({ href, label, missing, Icon }) => (
        <Tooltip key={missing}>
          <TooltipTrigger asChild>
            {href ? (
              <Button variant="ghost" size="icon-sm" asChild>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label}: ${problem.title} (opens in a new tab)`}
                >
                  <Icon />
                </a>
              </Button>
            ) : (
              // Not a button and not in the Tab order (nothing to click); screen readers read the label.
              <span
                role="img"
                aria-label={`${missing} for ${problem.title}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "cursor-default text-faint-foreground opacity-50 hover:bg-transparent hover:text-faint-foreground",
                )}
              >
                <Icon />
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent>{href ? label : missing}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
