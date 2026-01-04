"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearAuthError,
  loadTokenFromStorage,
  login,
  register,
} from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, isLoading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadTokenFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (token) router.replace("/sessions");
  }, [router, token]);

  const validationError = useMemo(() => {
    const u = username.trim();
    if (u.length === 0) return "Username wajib";
    if (u.length < 3) return "Username minimal 3 karakter";
    if (password.length === 0) return "Password wajib";
    if (password.length < 6) return "Password minimal 6 karakter";
    if (confirmPassword.length === 0) return "Konfirmasi password";
    if (password !== confirmPassword) return "Konfirmasi password tidak sama";
    return null;
  }, [username, password, confirmPassword]);

  return (
    <div className="min-h-dvh p-4">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="text-xs font-semibold text-zinc-400">REGISTER</div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">
          cekinan Leaderbord
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Buat akun baru.</p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLocalError(null);
            dispatch(clearAuthError());

            if (validationError) {
              setLocalError(validationError);
              return;
            }

            const u = username.trim();
            const regRes = await dispatch(register({ username: u, password }));
            if (!register.fulfilled.match(regRes)) return;

            const loginRes = await dispatch(login({ username: u, password }));
            if (login.fulfilled.match(loginRes)) {
              router.replace("/sessions");
            }
          }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (min 3)"
            className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
            autoComplete="username"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6)"
            type="password"
            className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
            autoComplete="new-password"
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
            type="password"
            className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-fuchsia-500"
            autoComplete="new-password"
          />

          {(localError || error) && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {localError ?? error}
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
            {isLoading ? "Memproses…" : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-fuchsia-300 underline decoration-fuchsia-500/40"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
