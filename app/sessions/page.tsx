"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loadTokenFromStorage, logout } from "../../store/authSlice";
import { createSession, fetchMySessions } from "../../store/sessionSlice";

export default function SessionsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.auth.token);
    const mySessions = useAppSelector((s) => s.session.mySessions);
    const globalLoading = useAppSelector((s) => s.ui.globalLoading);
    const globalError = useAppSelector((s) => s.ui.globalError);

    const [targetScore, setTargetScore] = useState("1000");

    useEffect(() => {
        dispatch(loadTokenFromStorage());
    }, [dispatch]);

    useEffect(() => {
        if (!token) router.replace("/login");
    }, [router, token]);

    useEffect(() => {
        if (!token) return;
        dispatch(fetchMySessions());
    }, [dispatch, token]);

    const parsedTargetScore = useMemo(() => {
        const num = Number.parseInt(targetScore, 10);
        return Number.isFinite(num) ? num : undefined;
    }, [targetScore]);

    return (
        <div className="min-h-dvh p-4">
            <div className="mx-auto max-w-md space-y-4">
                <header className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-zinc-400">SESSIONS</div>
                            <div className="mt-1 text-lg font-semibold tracking-tight text-zinc-50">
                                cekinan Leaderbord
                            </div>
                        </div>
                        <button
                            type="button"
                            className="h-10 rounded-xl border border-zinc-800 px-3 text-xs font-semibold"
                            onClick={async () => {
                                await dispatch(logout());
                                router.replace("/login");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">List session milik akun kamu.</p>
                </header>

                {globalError && (
                    <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                        {globalError}
                    </div>
                )}

                <section className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <h2 className="text-sm font-semibold">Create session</h2>
                    <div className="mt-3 flex gap-2">
                        <input
                            value={targetScore}
                            onChange={(e) => setTargetScore(e.target.value)}
                            inputMode="numeric"
                            className="h-12 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="Target score (default 1000)"
                        />
                        <button
                            type="button"
                            disabled={globalLoading}
                            className={
                                globalLoading
                                    ? "h-12 rounded-2xl bg-zinc-800 px-4 text-sm font-semibold text-zinc-300"
                                    : "h-12 rounded-2xl bg-fuchsia-600 px-4 text-sm font-semibold text-white"
                            }
                            onClick={async () => {
                                const res = await dispatch(
                                    createSession({
                                        targetScore:
                                            typeof parsedTargetScore === "number"
                                                ? parsedTargetScore
                                                : undefined,
                                    }),
                                );
                                if (createSession.fulfilled.match(res)) {
                                    const id = res.payload.sessionId;
                                    router.push(`/sessions/${id}`);
                                }
                            }}
                        >
                            Buat
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-zinc-400">
                        Target score
                    </div>
                </section>

                <section className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Session kamu</h2>
                        <button
                            type="button"
                            className="h-10 rounded-xl border border-zinc-800 px-3 text-xs font-semibold"
                            onClick={() => dispatch(fetchMySessions())}
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="mt-3 space-y-2">
                        {mySessions.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-left"
                                onClick={() => router.push(`/sessions/${s.id}`)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-zinc-100">
                                            {s.id}
                                        </div>
                                        <div className="mt-1 text-xs text-zinc-400">
                                            {new Date(s.createdAt).toLocaleString()} · {s.playerCount} player · Target {s.targetScore}
                                        </div>
                                    </div>
                                    {s.isFinished ? (
                                        <span className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                                            Selesai
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        ))}

                        {mySessions.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
                                Belum ada session.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
