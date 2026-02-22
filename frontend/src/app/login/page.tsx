"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

type ViewMode = "login" | "forgot-password" | "reset-sent";

export default function LoginPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>("login");

    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await res.json();

            // Store token and user info
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to dashboard
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError(null);
        setForgotLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to send reset email");
            }

            setViewMode("reset-sent");
        } catch (err) {
            setForgotError(err instanceof Error ? err.message : "Failed to send reset email");
        } finally {
            setForgotLoading(false);
        }
    };

    // Reset sent confirmation view
    if (viewMode === "reset-sent") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Check Your Email
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            If an account exists for <span className="font-medium text-slate-700 dark:text-slate-300">{forgotEmail}</span>,
                            we&apos;ve sent a password reset link.
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                            The link will expire in 24 hours.
                        </p>
                        <button
                            onClick={() => {
                                setViewMode("login");
                                setForgotEmail("");
                            }}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Forgot password view
    if (viewMode === "forgot-password") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
                        {/* Back button */}
                        <button
                            onClick={() => setViewMode("login")}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </button>

                        <div className="text-center mb-8">
                            <div className="mx-auto w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                Forgot Password?
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                Enter your email and we&apos;ll send you a reset link
                            </p>
                        </div>

                        {forgotError && (
                            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {forgotError}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {forgotLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Login view
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
                    {/* Logo and title */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                            <Music className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Kanata Music Academy
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Sign in to your account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setViewMode("forgot-password")}
                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Need an account? Contact your administrator.
                </p>
            </div>
        </div>
    );
}
