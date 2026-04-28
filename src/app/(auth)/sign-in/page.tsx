"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Cookies from 'js-cookie';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { token } = await authApi.login(form);
            Cookies.set('token', token)
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Login failed");
            setForm({ email: '', password: '' })
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">

            <Card className='p-4 bg-transparent '>
                <CardContent className="min-w-100">
                    <div className="flex-1 flex items-center justify-center ">
                        <div className="w-full max-w-sm animate-fade-up">
                            <div className="flex items-center gap-2 mb-10 lg:hidden">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(28 95% 58%)" }}>
                                    <Zap className="w-4 h-4 text-black" />
                                </div>
                                <span className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>TaskFlow</span>
                            </div>

                            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Sign in</h2>
                            <p className="text-sm mb-8" style={{ color: "hsl(40 10% 55%)" }}>Enter your credentials to continue</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : "password"}
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required
                                            className="h-11"
                                        />
                                        <Button variant={'ghost'} type='button' className='absolute right-0 h-11' onClick={() => setShowPassword(prev => !prev)} >

                                            {showPassword ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 font-semibold"
                                    style={{ background: "hsl(28 95% 58%)", color: "hsl(20 14% 4%)" }}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                </Button>
                            </form>

                            <p className="text-sm text-center mt-6" style={{ color: "hsl(40 10% 55%)" }}>
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up" className="font-medium hover:underline" style={{ color: "hsl(28 95% 58%)" }}>
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
