"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearAuthError, loadTokenFromStorage, login } from "../../store/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, isLoading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(loadTokenFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (token) router.replace("/sessions");
  }, [router, token]);

  return (
    <div className="min-h-dvh p-4">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="text-xs font-semibold text-zinc-400">LOGIN</div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">
          cekinan Leaderbord
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Masuk untuk mulai buat session.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            dispatch(clearAuthError());
            const res = await dispatch(login({ username, password }));
            if (login.fulfilled.match(res)) {
              router.replace("/sessions");
            }
          }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
            autoComplete="username"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
            autoComplete="current-password"
          />

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={
              isLoading
                ? "h-12 w-full rounded-2xl bg-zinc-800 text-sm font-semibold text-zinc-300"
                : "h-12 w-full rounded-2xl bg-fuchsia-600 text-sm font-semibold text-white"
            }
          >
            {isLoading ? "Masuk…" : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-fuchsia-300 underline decoration-fuchsia-500/40"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
