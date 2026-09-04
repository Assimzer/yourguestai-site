import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import SidebarNav from "./SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-night-950">
      <aside className="hidden w-60 flex-col border-r border-night-800 px-4 py-6 sm:flex">
        <Link href="/" className="mb-8 px-2 font-display text-lg italic text-white">
          YOURGUESTAI
        </Link>
        <SidebarNav />
        <div className="mt-auto border-t border-night-800 pt-4 px-2">
          <p className="truncate text-xs text-mist-500">{user.email}</p>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-night-800 px-6 py-4 sm:hidden">
          <Link href="/" className="font-display text-lg italic text-white">
            YOURGUESTAI
          </Link>
          <LogoutButton />
        </header>
        <main className="px-6 py-10 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
