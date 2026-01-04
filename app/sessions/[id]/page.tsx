"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import HistoryList from "../../../components/HistoryList";
import NgandangModal from "../../../components/NgandangModal";
import PlayerList from "../../../components/PlayerList";
import ScoreAllModal from "../../../components/ScoreAllModal";
import { loadTokenFromStorage, logout } from "../../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addPlayer,
  createRoundAll,
  createRoundNgandang,
  deletePlayer,
  editPlayer,
  fetchRounds,
  fetchSession,
  rollbackLast,
  rollbackToRound,
} from "../../../store/sessionSlice";

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const { currentSession, rounds } = useAppSelector((s) => s.session);
  const globalLoading = useAppSelector((s) => s.ui.globalLoading);
  const globalError = useAppSelector((s) => s.ui.globalError);

  const [openAll, setOpenAll] = useState(false);
  const [openNgandang, setOpenNgandang] = useState(false);

  useEffect(() => {
    dispatch(loadTokenFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [router, token]);

  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchSession({ sessionId }));
    dispatch(fetchRounds({ sessionId }));
  }, [dispatch, sessionId]);

  const players = useMemo(() => currentSession?.players ?? [], [currentSession]);

  return (
    <div className="min-h-dvh p-4">
      <div className="mx-auto max-w-md space-y-4">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-400">
                SESSION DETAIL
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-zinc-100">
                {sessionId}
              </div>
              {currentSession && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-1 font-semibold text-fuchsia-200">
                    Target: {currentSession.targetScore}
                  </span>
                  <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 font-semibold text-cyan-200">
                    {currentSession.isFinished ? "Finished" : "Running"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <Link
                href="/sessions"
                className="h-10 rounded-xl border border-zinc-800 px-3 text-center text-xs font-semibold leading-10"
              >
                Back
              </Link>
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
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="h-12 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-semibold"
              onClick={() => {
                dispatch(fetchSession({ sessionId }));
                dispatch(fetchRounds({ sessionId }));
              }}
            >
              Refresh
            </button>
            <button
              type="button"
              disabled={players.length === 0}
              className={
                players.length === 0
                  ? "h-12 flex-1 rounded-2xl bg-zinc-800 text-sm font-semibold text-zinc-300"
                  : "h-12 flex-1 rounded-2xl bg-fuchsia-600 text-sm font-semibold text-white"
              }
              onClick={() => setOpenAll(true)}
            >
              Mulai hitung
            </button>
            <button
              type="button"
              disabled={players.length === 0}
              className={
                players.length === 0
                  ? "h-12 flex-1 rounded-2xl bg-zinc-800 text-sm font-semibold text-zinc-300"
                  : "h-12 flex-1 rounded-2xl bg-cyan-400 text-sm font-semibold text-black"
              }
              onClick={() => setOpenNgandang(true)}
            >
              NGANDANG
            </button>
          </div>
        </header>

        {globalError && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {globalError}
          </div>
        )}

        <PlayerList
          players={players}
          onAddPlayer={(name) => {
            dispatch(addPlayer({ sessionId, name }));
          }}
          onEditPlayer={(playerId, name) => {
            dispatch(editPlayer({ sessionId, playerId, name }));
          }}
          onDeletePlayer={(playerId) => {
            dispatch(deletePlayer({ sessionId, playerId }));
          }}
        />

        <HistoryList
          rounds={rounds}
          onRollbackLast={() => {
            dispatch(rollbackLast({ sessionId }));
          }}
          onRollbackTo={(roundId) => {
            dispatch(rollbackToRound({ sessionId, roundId }));
          }}
        />

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400">
          {globalLoading ? "Memproses…" : "Refreshed"}
        </div>
      </div>

      {openAll ? (
        <ScoreAllModal
          open
          players={players}
          onClose={() => setOpenAll(false)}
          onSubmit={(scores) => {
            dispatch(createRoundAll({ sessionId, scores }));
            setOpenAll(false);
          }}
        />
      ) : null}

      {openNgandang ? (
        <NgandangModal
          open
          players={players}
          onClose={() => setOpenNgandang(false)}
          onSubmit={(winnerPlayerId) => {
            dispatch(createRoundNgandang({ sessionId, winnerPlayerId }));
            setOpenNgandang(false);
          }}
        />
      ) : null}
    </div>
  );
}
