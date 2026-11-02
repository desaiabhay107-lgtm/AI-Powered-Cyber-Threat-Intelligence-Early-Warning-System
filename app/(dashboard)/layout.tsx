import React from "react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  const serializedUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Sidebar user={serializedUser} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar role={serializedUser.role} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
