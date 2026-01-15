"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { LogOut, User, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
    const { profile, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/login";
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900">
                    Prosecution Paper Builder
                </h1>
            </div>

            <div className="flex items-center gap-4">

                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">
                            {profile?.full_name || "Pengguna"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {profile ? USER_ROLE_LABELS[profile.role] : "Memuatkan..."}
                        </p>
                    </div>
                </div>

                {/* Sign Out */}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Keluar
                </Button>
            </div>
        </header>
    );
}
