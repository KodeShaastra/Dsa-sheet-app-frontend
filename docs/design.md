# Design system

**shadcn/ui** (Radix, "Nova" preset) on **Tailwind CSS v4**. Clean, minimal, made for students:
the content (problems, dates, progress) is the hero, not the chrome. Live reference: **`/styleguide`** (dev only).

The feel is modelled on LeetCode's problem list (measured, not guessed): a 4-step text hierarchy,
filled surfaces instead of lines, 14px / 12px text, 44px rows, 8px corners, calm coloured difficulty text.

## The rules (keep the app consistent)

1. **Build from `components/ui` only.** Screens combine these parts; they don't restyle them.
   Need something new? Add it with `npx shadcn@latest add <name>` so it follows the same tokens.
2. **Colours come from tokens only.** No `bg-red-500`, `text-[#333]`, `oklch(...)` in app code. ESLint blocks it.
3. **Colour means something.** Greys for structure and text, indigo for actions and progress,
   teal/amber/red only for difficulty. Nothing else gets colour.
4. **Filled surfaces, few lines.** Group things with `bg-surface` (cards, chapter headers, filter chips) and
   hover fills, not borders. Rows all look the same (no zebra stripes). Borders only on inputs and dashed empty states. Shadows only on floating
   layers (dialog, menu, popover, toast).
5. **One radius: 8px** (`rounded-lg`) for cards, rows, inputs, buttons. `rounded-full` only for chips, dots, avatars.
6. **Same thing, same component.** Difficulty is always `<DifficultyLabel>` or `<DifficultyDot>`
   (`components/sheet/Difficulty.tsx`, the only place difficulty colours live). Filters are always `<FilterChips>`.

## Text: four shades

Pick by importance, not by taste. Each step is clearly lighter than the one above.

| Token                    | Use                                            | Light       | Dark      |
| ------------------------ | ---------------------------------------------- | ----------- | --------- |
| `text-foreground`        | Titles, problem names, key numbers             | `#262626`   | `#f5f5f5` |
| `text-subtle-foreground` | Body and secondary text, filter labels         | neutral-600 | 85%       |
| `text-muted-foreground`  | Meta, captions, counts, group labels           | neutral-500 | 71%       |
| `text-faint-foreground`  | Decoration only (never text someone must read) | neutral-400 | 52%       |

All but `faint` pass WCAG AA (4.5:1) for small text in both themes.

## Surfaces and colour tokens

| Token                            | Use                                                                 |
| -------------------------------- | ------------------------------------------------------------------- |
| `background`                     | Page. White in light; charcoal `#1a1a1a` in dark (not pure black)   |
| `surface` / `surface-hover`      | Filled layer: cards, chapter headers, chips; rows on hover          |
| `card` / `popover`               | Auth card, dialogs, menus                                           |
| `border` / `input`               | Input borders, dashed empty states                                  |
| `primary` / `primary-foreground` | **Indigo.** Main buttons, ticked checkboxes, progress, links, focus |
| `ring`                           | Focus ring (indigo)                                                 |
| `destructive`                    | Delete actions, "missed" warnings, error toasts                     |
| `success`                        | Success toasts only (green-600; green-400 in dark)                  |
| `easy` · `medium` · `hard`       | Difficulty only (teal-700 / amber-700 / red-600; -400s in dark)     |

## Typography

Geist Sans everywhere. **Numbers use the same font** with `tabular-nums` so digits line up (no monospace).
Only these sizes: 20 / 16 / 14 / 12 px.

| Role          | Classes                                                        |
| ------------- | -------------------------------------------------------------- |
| Page title    | `text-xl font-semibold tracking-tight text-foreground`         |
| Section title | `text-base font-semibold text-foreground` (chapter names)      |
| Row title     | `text-sm font-medium text-foreground` (problem names)          |
| Body          | `text-sm text-subtle-foreground`                               |
| Group label   | `text-xs font-medium text-muted-foreground` (topic names)      |
| Meta, caption | `text-xs text-muted-foreground`                                |
| Numbers       | `tabular-nums`; the key number `font-semibold text-foreground` |

The auth card heading (`BlurInText`) is the one 24px exception: it's the hero of that page.

## Layout and spacing

- 4px grid (Tailwind's default scale). Between sections `space-y-6`; inside a section `gap-3`; inside a row `gap-3`.
- Page container: `mx-auto w-full max-w-4xl px-4 py-8 sm:px-6`. Calendar may use `max-w-6xl`.
- **Rows:** `min-h-11` (44px), `px-4`, `rounded-lg`, `hover:bg-surface`. No stripes, no divider lines.
- **Cards:** `rounded-lg bg-surface p-4` (or `px-4 py-3` for compact tiles). No border.
- **Chips:** `h-8 rounded-full bg-surface px-3.5`; selected = `bg-foreground text-background`.
- Progress tracks are `bg-foreground/10` so they show on both the page and on surfaces.
- Works at 375px wide. Rows stack, never scroll sideways.

## Icons and motion

- lucide-react, default `size-4`. Icon-only buttons need `aria-label` and a `Tooltip`.
- No brand logos (lucide has none): video = `PlayCircle`, practice = `SquareCode`, article = `FileText`.
- Motion is quiet: `transition-colors` (~150ms) and shadcn's built-in dialog/menu animations. Respect reduced motion.

## States

| State                 | Look                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| Loading               | `Skeleton` in the shape of the real content (no spinners for lists)   |
| Empty                 | One muted sentence + one action, dashed border                        |
| Error                 | Short message + "Try again" button; toasts for failed actions         |
| Solved problem        | Checked indigo checkbox, title `text-muted-foreground`                |
| In progress           | `ring-1 ring-primary/40` on the row + "In progress" in `text-primary` |
| Scheduled: `PENDING`  | Default text                                                          |
| Scheduled: `DONE`     | Check icon, `text-muted-foreground line-through`                      |
| Scheduled: `SKIPPED`  | `text-muted-foreground`, "Skipped" meta                               |
| Missed (past PENDING) | `destructive` accent on the day + "Move to today"                     |

## Eldora UI

Used sparingly, only on the login/signup pages: the `BlurInText` heading (adapted to our tokens and reduced motion).
The faint dot background is our own (made from the `border` token). Never inside the sheet or calendar.
Lives in `components/eldoraui/`.
