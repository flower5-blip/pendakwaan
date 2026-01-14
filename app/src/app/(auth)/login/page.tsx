"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Scale, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message === "Invalid login credentials"
                ? "E-mel atau kata laluan tidak sah"
                : error.message
            );
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg mb-4">
                        <Scale className="h-9 w-9 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">PERKESO</h1>
                    <p className="text-sm text-gray-600">Prosecution Paper Builder</p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Log Masuk</CardTitle>
                        <CardDescription className="text-center">
                            Sila masukkan e-mel dan kata laluan anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="E-mel"
                                type="email"
                                placeholder="nama@perkeso.gov.my"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />

                            <Input
                                label="Kata Laluan"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuatkan...
                                    </>
                                ) : (
                                    "Log Masuk"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <div className="text-center text-sm text-gray-600">
                            Belum ada akaun?{" "}
                            <Link href="/register" className="text-blue-600 hover:underline font-medium">
                                Daftar
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Sistem Dalaman PERKESO © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
