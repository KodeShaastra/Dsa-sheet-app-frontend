import { ExternalLink, Play, Plus } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilterChips } from "@/components/app/FilterChips";
import { DifficultyDot, DifficultyLabel } from "@/components/sheet/Difficulty";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export const metadata: Metadata = { title: "Style guide" };

// Classes are written out in full so Tailwind can see them.
const surfaces = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "surface-hover", className: "bg-surface-hover" },
  { name: "border", className: "bg-border" },
  { name: "primary", className: "bg-primary" },
  { name: "destructive", className: "bg-destructive" },
  { name: "easy", className: "bg-easy" },
  { name: "medium", className: "bg-medium" },
  { name: "hard", className: "bg-hard" },
];

const textShades = [
  { name: "foreground", use: "Titles, problem names", className: "text-foreground" },
  {
    name: "subtle-foreground",
    use: "Body and secondary text",
    className: "text-subtle-foreground",
  },
  { name: "muted-foreground", use: "Meta, captions, counts", className: "text-muted-foreground" },
  { name: "faint-foreground", use: "Decoration only", className: "text-faint-foreground" },
];

const demoChips = [
  { value: "ALL", label: "All" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/** Dev-only living reference for docs/design.md. */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-10 px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Style guide</h1>
          <p className="text-sm text-muted-foreground">
            Tokens and components every screen is built from. See docs/design.md.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Text shades">
        <div className="space-y-2 rounded-lg bg-surface p-4">
          {textShades.map((t) => (
            <div key={t.name} className="flex items-baseline justify-between gap-4">
              <span className={`text-sm font-medium ${t.className}`}>{t.use}</span>
              <span className="text-xs text-muted-foreground">{t.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-2">
          <p className="text-xl font-semibold tracking-tight text-foreground">
            Page title (20 / 600)
          </p>
          <p className="text-base font-semibold text-foreground">
            Section title: Arrays (16 / 600)
          </p>
          <p className="text-sm font-medium text-foreground">Row title: Two Sum (14 / 500)</p>
          <p className="text-sm text-subtle-foreground">
            Body: Work through each chapter (14 / 400)
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            Group label: Two Pointers (12 / 500)
          </p>
          <p className="text-xs text-muted-foreground">Meta: Scheduled for tomorrow (12 / 400)</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            Numbers: <span className="font-semibold text-foreground">12</span> / 30 · 2026-10-20
          </p>
        </div>
      </Section>

      <Section title="Surfaces">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-9">
          {surfaces.map((s) => (
            <div key={s.name} className="space-y-1.5">
              <div className={`h-10 rounded-lg ring-1 ring-border ${s.className}`} />
              <p className="text-xs text-muted-foreground">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button>
            <Plus /> Schedule
          </Button>
          <Button variant="outline">Today</Button>
          <Button variant="secondary">Skip</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Forgot password?</Button>
          <Button disabled>Saving…</Button>
          <Button variant="ghost" size="icon" aria-label="Watch the video">
            <Play />
          </Button>
        </div>
      </Section>

      <Section title="Difficulty and status">
        <div className="flex flex-wrap items-center gap-4">
          <DifficultyLabel difficulty="EASY" />
          <DifficultyLabel difficulty="MEDIUM" />
          <DifficultyLabel difficulty="HARD" />
          <span className="flex items-center gap-2">
            <DifficultyDot difficulty="EASY" />
            <DifficultyDot difficulty="MEDIUM" />
            <DifficultyDot difficulty="HARD" />
          </span>
          <Badge variant="secondary">Skipped</Badge>
          <Badge variant="destructive">Missed</Badge>
        </div>
      </Section>

      <Section title="Filters">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterChips label="Difficulty" value="ALL" options={demoChips} onChange={() => {}} />
          <label className="flex items-center gap-2 text-sm text-subtle-foreground">
            <Switch defaultChecked /> Hide solved
          </label>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid gap-4 sm:max-w-sm">
          <Field>
            <FieldLabel htmlFor="sg-email">Email</FieldLabel>
            <Input id="sg-email" type="email" placeholder="you@example.com" />
            <FieldDescription>We&apos;ll never share it.</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="sg-password">Password</FieldLabel>
            <Input id="sg-password" type="password" aria-invalid defaultValue="short" />
            <FieldError>Use at least 8 characters</FieldError>
          </Field>
          <Button className="w-full">Log in</Button>
        </div>
      </Section>

      <Section title="Chapter and problem rows">
        <div className="space-y-4">
          <div className="space-y-2.5 rounded-lg bg-surface px-4 py-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-foreground">Arrays</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className="font-medium text-subtle-foreground">2</span> / 14
              </span>
            </div>
            <Progress value={14} className="h-1" />
          </div>
          <ul>
            {(
              [
                { title: "Two Sum", difficulty: "EASY", done: true },
                { title: "3Sum", difficulty: "MEDIUM", done: false },
                { title: "Trapping Rain Water", difficulty: "HARD", done: false },
              ] as const
            ).map((p) => (
              <li
                key={p.title}
                className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-2 hover:bg-surface"
              >
                <Checkbox defaultChecked={p.done} aria-label={`Mark ${p.title} solved`} />
                <span
                  className={`flex-1 text-sm font-medium ${p.done ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {p.title}
                </span>
                <DifficultyLabel difficulty={p.difficulty} className="w-16" />
                <Button variant="ghost" size="icon-sm" aria-label={`Practice ${p.title}`}>
                  <ExternalLink />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Loading">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </Section>
    </main>
  );
}
