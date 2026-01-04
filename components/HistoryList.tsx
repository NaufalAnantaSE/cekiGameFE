"use client";

import type { GameRoundHistory } from "../store/sessionSlice";

type Props = {
  rounds: GameRoundHistory[];
  onRollbackLast: () => void;
  onRollbackTo: (roundId: string) => void;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function HistoryList({
  rounds,
  onRollbackLast,
  onRollbackTo,
}: Props) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">History</h2>
        <button
          type="button"
          className="h-10 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 text-xs font-semibold text-amber-200"
          onClick={onRollbackLast}
        >
          Rollback last
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {rounds.map((r, idx) => (
          <div
            key={r.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {idx + 1}. {r.type}{" "}
                  {r.isVoided ? (
                    <span className="ml-2 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      VOID
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {formatDate(r.createdAt)}
                </div>
              </div>

              <button
                type="button"
                disabled={r.isVoided}
                className={
                  r.isVoided
                    ? "h-10 rounded-xl border border-zinc-800 px-3 text-xs font-semibold text-zinc-500"
                    : "h-10 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 text-xs font-semibold text-amber-200"
                }
                onClick={() => onRollbackTo(r.id)}
              >
                Rollback ke sini
              </button>
            </div>

            <div className="mt-3 space-y-1">
              {r.roundPlayers.map((rp) => (
                <div
                  key={rp.playerId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate pr-3 text-zinc-300">
                    {rp.playerName}
                  </span>
                  <span className="font-semibold text-zinc-100">{rp.score}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {rounds.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            Belum ada ronde.
          </div>
        )}
      </div>
    </section>
  );
}
