"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Scale, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Kata laluan tidak sepadan");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Kata laluan mesti sekurang-kurangnya 6 aksara");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Create profile
        if (data.user) {
            const { error: profileError } = await supabase.from("profiles").insert({
                id: data.user.id,
                full_name: fullName,
                role: "viewer", // Default role, admin will upgrade later
            });

            if (profileError) {
                console.error("Profile creation error:", profileError);
            }
        }

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-xl border-0 animate-slide-up">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Scale className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Pendaftaran Berjaya!</CardTitle>
                        <CardDescription>
                            Akaun anda telah didaftarkan. Sila hubungi pentadbir untuk mengaktifkan akaun anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                            <Button className="w-full">Kembali ke Log Masuk</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                        <CardTitle className="text-2xl text-center">Daftar Akaun</CardTitle>
                        <CardDescription className="text-center">
                            Sila isi maklumat untuk mendaftar akaun baru
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Nama Penuh"
                                type="text"
                                placeholder="Nama penuh anda"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                disabled={loading}
                            />

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
                                placeholder="Minimum 6 aksara"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />

                            <Input
                                label="Sahkan Kata Laluan"
                                type="password"
                                placeholder="Masukkan semula kata laluan"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    "Daftar"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <div className="text-center text-sm text-gray-600">
                            Sudah ada akaun?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                Log Masuk
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
