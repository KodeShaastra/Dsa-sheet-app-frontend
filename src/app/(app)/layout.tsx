import { NavLinks } from "@/components/app/NavLinks";
import { UserMenu } from "@/components/app/UserMenu";
import { Logo } from "@/components/Logo";

/** Every logged-in page: sticky top bar (logo, Sheet / Calendar, account menu) + content. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo className="hidden sm:inline-flex" />
          <NavLinks />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
