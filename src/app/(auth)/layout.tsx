import { Logo } from "@/components/Logo";

/** Centred card on a faint dot background (made from the border token, so it works in both themes). */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-size-[20px_20px]"
      />
      <Logo className="relative" />
      <div className="relative w-full max-w-sm">{children}</div>
    </main>
  );
}
