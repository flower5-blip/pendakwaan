"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
    LayoutDashboard,
    FolderOpen,
    Users,
    FileText,
    Settings,
    Shield,
    ClipboardList,
} from "lucide-react";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        href: "/cases",
        label: "Senarai Kes",
        icon: <FolderOpen className="h-5 w-5" />,
    },
    {
        href: "/cases/new",
        label: "Kes Baru",
        icon: <FileText className="h-5 w-5" />,
        roles: ["admin", "io"],
    },
    {
        href: "/employers",
        label: "Majikan",
        icon: <Users className="h-5 w-5" />,
    },
    {
        href: "/audit",
        label: "Audit Trail",
        icon: <ClipboardList className="h-5 w-5" />,
        roles: ["admin", "po", "uip"],
    },
    {
        href: "/admin/users",
        label: "Pengguna",
        icon: <Shield className="h-5 w-5" />,
        roles: ["admin"],
    },
    {
        href: "/settings",
        label: "Tetapan",
        icon: <Settings className="h-5 w-5" />,
    },
];

export function NavLinks() {
    const pathname = usePathname();
    const { profile } = useAuth();

    const filteredItems = navItems.filter((item) => {
        if (!item.roles) return true;
        if (!profile) return false;
        return item.roles.includes(profile.role);
    });

    return (
        <nav className="space-y-1">
            {filteredItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
