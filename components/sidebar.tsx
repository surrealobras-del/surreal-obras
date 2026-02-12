"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Obras",
    href: "/obras",
  },
  {
    title: "Configurações",
    href: "/configuracoes",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user, loading: authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex flex-col w-64 border-r bg-background h-screen fixed left-0 top-0">
      <div className="flex items-center justify-start h-16 border-b px-4">
        <img
          src="https://gukpisxmjvmfukxhkmrt.supabase.co/storage/v1/object/public/project/logo_black.png"
          alt="Surreal Construções e Reformas"
          className="h-10 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        {user && (
          <div className="px-2 py-1">
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        )}
        <Separator />
        <Button
          onClick={handleLogout}
          disabled={loggingOut || authLoading}
          variant="outline"
          className="w-full"
        >
          {loggingOut ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </aside>
  );
}
