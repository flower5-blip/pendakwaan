"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Case } from "@/types";

export function useCases() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("cases")
            .select(`
        *,
        employer:employers(*),
        io:profiles!cases_io_id_fkey(*)
      `)
            .order("created_at", { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setCases(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

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
        io:profiles!cases_io_id_fkey(*),
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
