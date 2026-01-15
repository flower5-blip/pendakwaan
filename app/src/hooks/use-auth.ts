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
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data: existingProfile, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    if (existingProfile) {
                        setProfile(existingProfile);
                    } else if (error?.code === 'PGRST116') {
                        // Profile doesn't exist - create one with 'viewer' role (most restrictive)
                        // Admin must manually assign proper role via admin interface
                        const { data: newProfile } = await supabase
                            .from("profiles")
                            .insert({
                                id: user.id,
                                full_name: user.email?.split('@')[0] || 'Pengguna',
                                role: 'viewer', // SECURITY FIX: Default to viewer, not 'io'
                            })
                            .select()
                            .single();

                        if (newProfile) {
                            setProfile(newProfile);
                        } else {
                            // Still set a default profile so UI doesn't hang
                            setProfile({
                                id: user.id,
                                full_name: user.email?.split('@')[0] || 'Pengguna',
                                role: 'viewer', // SECURITY FIX: Default to viewer
                                department: undefined,
                                phone: undefined,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            } as Profile);
                        }
                    }
                }
            } catch (err) {
                console.error('Auth error:', err);
            } finally {
                setLoading(false);
            }
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

                if (profile) {
                    setProfile(profile);
                } else {
                    // Create default profile for UI with viewer role (most restrictive)
                    setProfile({
                        id: session.user.id,
                        full_name: session.user.email?.split('@')[0] || 'Pengguna',
                        role: 'viewer', // SECURITY FIX: Default to viewer, not 'io'
                        department: undefined,
                        phone: undefined,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    } as Profile);
                }
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
