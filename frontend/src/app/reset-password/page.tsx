"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/utils";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError("Invalid reset link. Please request a new password reset.");
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    email,
                    newPassword: password
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to reset password");
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Password Reset Successful
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Your password has been updated. You can now log in with your new password.
                        </p>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                        <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-2">
                        Reset Your Password
                    </h1>
                    <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
                        Enter a new password for {email}
                    </p>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token || !email}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-slate-500">Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
