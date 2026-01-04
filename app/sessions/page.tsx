"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loadTokenFromStorage, logout } from "../../store/authSlice";
import { createSession } from "../../store/sessionSlice";

const RECENT_SESSIONS_KEY = "ceki.recentSessions";

function readRecentSessions(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(RECENT_SESSIONS_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw) as unknown;
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === "string");
    } catch {
        return [];
    }
}

function writeRecentSessions(ids: string[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RECENT_SESSIONS_KEY, JSON.stringify(ids));
}

function addRecentSession(id: string) {
    const current = readRecentSessions();
    const next = [id, ...current.filter((x) => x !== id)].slice(0, 10);
    writeRecentSessions(next);
    return next;
}

export default function SessionsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.auth.token);
    const globalLoading = useAppSelector((s) => s.ui.globalLoading);
    const globalError = useAppSelector((s) => s.ui.globalError);

    const [targetScore, setTargetScore] = useState("1000");
    const [sessionIdInput, setSessionIdInput] = useState("");
    const [recent, setRecent] = useState<string[]>(() => readRecentSessions());

    useEffect(() => {
        dispatch(loadTokenFromStorage());
    }, [dispatch]);

    useEffect(() => {
        if (!token) router.replace("/login");
    }, [router, token]);

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
                                cekinan Waren League
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
                    <p className="mt-2 text-xs text-zinc-400">
                        List di bawah adalah riwayat session ID di perangkat ini.
                    </p>
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
                                    setRecent(addRecentSession(id));
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
                    <h2 className="text-sm font-semibold">Masuk via ID</h2>
                    <div className="mt-3 flex gap-2">
                        <input
                            value={sessionIdInput}
                            onChange={(e) => setSessionIdInput(e.target.value)}
                            className="h-12 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-cyan-400"
                            placeholder="Session ID (UUID)"
                        />
                        <button
                            type="button"
                            className="h-12 rounded-2xl bg-cyan-400 px-4 text-sm font-semibold text-black"
                            onClick={() => {
                                const id = sessionIdInput.trim();
                                if (!id) return;
                                setRecent(addRecentSession(id));
                                router.push(`/sessions/${id}`);
                            }}
                        >
                            Masuk
                        </button>
                    </div>
                </section>

                <section className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <h2 className="text-sm font-semibold">Recent sessions</h2>
                    <div className="mt-3 space-y-2">
                        {recent.map((id) => (
                            <button
                                key={id}
                                type="button"
                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-left"
                                onClick={() => router.push(`/sessions/${id}`)}
                            >
                                <div className="truncate text-sm font-semibold text-zinc-100">
                                    {id}
                                </div>
                                <div className="mt-1 text-xs text-zinc-400">Tap untuk buka</div>
                            </button>
                        ))}
                        {recent.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
                                Belum ada riwayat.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
