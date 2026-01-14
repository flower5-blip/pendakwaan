"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setProfile(profile);
            }

            setLoading(false);
        };

        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();
                setProfile(profile);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const hasRole = (roles: string | string[]): boolean => {
        if (!profile) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(profile.role);
    };

    const isAdmin = () => hasRole("admin");
    const isIO = () => hasRole(["admin", "io"]);
    const isPO = () => hasRole(["admin", "po"]);
    const isUIP = () => hasRole(["admin", "uip"]);
    const canEdit = () => hasRole(["admin", "io"]);
    const canReview = () => hasRole(["admin", "po", "uip"]);

    return {
        user,
        profile,
        loading,
        signOut,
        hasRole,
        isAdmin,
        isIO,
        isPO,
        isUIP,
        canEdit,
        canReview,
    };
}
