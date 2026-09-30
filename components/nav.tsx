import Link from "next/link";
import {
  BarChart3,
  BookMarked,
  Home,
  LibraryBig,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/dal";
import { APP_NAME } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: LibraryBig },
  { href: "/search", label: "Search", icon: Search },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <BookMarked className="h-5 w-5 text-indigo-500" />
          <span>{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/settings"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{user.displayName}</span>
              </Link>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ size: "sm" })}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function NavFallback() {
  return <div className="h-14" />;
}