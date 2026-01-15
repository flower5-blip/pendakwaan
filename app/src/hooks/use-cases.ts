"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Case } from "@/types";

export function useCases() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Memoize supabase client to prevent infinite loops in dependency arrays
    const supabase = useMemo(() => createClient(), []);

    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            console.warn("Fetch cases timed out - forcing loading false");
            setLoading(false);
        }, 5000);

        try {
            const { data, error: fetchError } = await supabase
                .from("cases")
                .select(`
                    *,
                    employer:employers(*)
                `)
                .order("created_at", { ascending: false });

            if (fetchError) {
                console.error("Error fetching cases:", fetchError);
                setError(fetchError.message);
                setCases([]);
            } else {
                setCases(data || []);
            }
        } catch (err) {
            console.error("Unexpected error fetching cases:", err);
            setError("Ralat tidak dijangka");
            setCases([]);
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchCases();
    }, []);

    const createCase = async (caseData: Partial<Case>) => {
        const { data, error } = await supabase
            .from("cases")
            .insert(caseData)
            .select()
            .single();

        if (error) throw error;
        await fetchCases();
        return data;
    };

    const updateCase = async (id: string, caseData: Partial<Case>) => {
        const { data, error } = await supabase
            .from("cases")
            .update({ ...caseData, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        await fetchCases();
        return data;
    };

    const deleteCase = async (id: string) => {
        const { error } = await supabase.from("cases").delete().eq("id", id);

        if (error) throw error;
        await fetchCases();
    };

    const getCase = async (id: string) => {
        const { data, error } = await supabase
            .from("cases")
            .select(`
        *,
        employer:employers(*),
        persons(*)
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    };

    return {
        cases,
        loading,
        error,
        fetchCases,
        createCase,
        updateCase,
        deleteCase,
        getCase,
    };
}
