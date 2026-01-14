"use client";

import Link from "next/link";
import { NavLinks } from "./nav-links";
import { APP_NAME } from "@/lib/constants";
import { Scale } from "lucide-react";

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                        <Scale className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">PERKESO</span>
                        <span className="text-xs text-gray-500">Prosecution Builder</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                    <NavLinks />
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                    <p className="text-xs text-gray-500 text-center">
                        Sistem Dalaman PERKESO
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        v1.0.0 - Phase A
                    </p>
                </div>
            </div>
        </aside>
    );
}
