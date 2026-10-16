import { FileText, PlayCircle, SquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Problem } from "@/types/api";

function practiceLabel(url: string) {
  const host = new URL(url).hostname;
  if (host.includes("leetcode")) return "Practice on LeetCode";
  if (host.includes("codeforces")) return "Practice on Codeforces";
  return "Practice";
}

/** Video / practice / article icon links. Links that are null are not shown. */
export function ResourceLinks({ problem }: { problem: Problem }) {
  const links = [
    problem.youtubeUrl && { href: problem.youtubeUrl, label: "Watch the video", Icon: PlayCircle },
    problem.practiceUrl && {
      href: problem.practiceUrl,
      label: practiceLabel(problem.practiceUrl),
      Icon: SquareCode,
    },
    problem.articleUrl && { href: problem.articleUrl, label: "Read the article", Icon: FileText },
  ].filter((link) => !!link);

  return (
    <div className="flex shrink-0 items-center">
      {links.map(({ href, label, Icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
