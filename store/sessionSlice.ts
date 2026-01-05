import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiDelete, apiGet, apiPatch, apiPost } from "../services/api";

export type Player = {
  id: string;
  name: string;
  totalScore: number;
  rank?: number;
};

export type GameSession = {
  id: string;
  userId: string;
  targetScore: number;
  isFinished: boolean;
  players: Player[];
};

export type GameSessionSummary = {
  id: string;
  createdAt: string;
  playerCount: number;
  targetScore: number;
  isFinished: boolean;
};

export type GameRoundHistory = {
  id: string;
  type: "ALL" | "NGANDANG" | string;
  createdAt: string;
  winnerPlayerId: string | null;
  isVoided: boolean;
  voidedAt: string | null;
  roundPlayers: Array<{ playerId: string; playerName: string; score: number }>;
};

type SessionState = {
  mySessions: GameSessionSummary[];
  currentSession: GameSession | null;
  rounds: GameRoundHistory[];
  isLoading: boolean;
  error: string | null;
};

const initialState: SessionState = {
  mySessions: [],
  currentSession: null,
  rounds: [],
  isLoading: false,
  error: null,
};

export const fetchMySessions = createAsyncThunk<GameSessionSummary[]>(
  "session/fetchMySessions",
  async () => {
    return apiGet<GameSessionSummary[]>("/game-sessions");
  },
);

export const fetchSession = createAsyncThunk<GameSession, { sessionId: string }>(
  "session/fetchSession",
  async ({ sessionId }) => {
    return apiGet<GameSession>(`/game-sessions/${sessionId}`);
  },
);

export const fetchRounds = createAsyncThunk<
  GameRoundHistory[],
  { sessionId: string }
>("session/fetchRounds", async ({ sessionId }) => {
  return apiGet<GameRoundHistory[]>(`/game-sessions/${sessionId}/rounds`);
});

export const createSession = createAsyncThunk<
  { sessionId: string },
  { targetScore?: number }
>("session/createSession", async ({ targetScore }) => {
  const created = await apiPost<GameSession>("/game-sessions", {
    ...(typeof targetScore === "number" ? { targetScore } : {}),
  });
  return { sessionId: created.id };
});

export const addPlayer = createAsyncThunk<
  void,
  { sessionId: string; name: string }
>("session/addPlayer", async ({ sessionId, name }, { dispatch }) => {
  await apiPost(`/game-sessions/${sessionId}/players`, { name });
  await dispatch(fetchSession({ sessionId }));
});

export const editPlayer = createAsyncThunk<
  void,
  { sessionId: string; playerId: string; name: string }
>("session/editPlayer", async ({ sessionId, playerId, name }, { dispatch }) => {
  await apiPatch(`/game-sessions/${sessionId}/players/${playerId}`, { name });
  await dispatch(fetchSession({ sessionId }));
});

export const deletePlayer = createAsyncThunk<
  void,
  { sessionId: string; playerId: string }
>(
  "session/deletePlayer",
  async ({ sessionId, playerId }, { dispatch }) => {
    await apiDelete(`/game-sessions/${sessionId}/players/${playerId}`);
    await dispatch(fetchSession({ sessionId }));
  },
);

export const createRoundAll = createAsyncThunk<
  void,
  { sessionId: string; scores: Array<{ playerId: string; score: number }> }
>("session/createRoundAll", async ({ sessionId, scores }, { dispatch }) => {
  await apiPost(`/game-sessions/${sessionId}/rounds/all`, { scores });
  await dispatch(fetchSession({ sessionId }));
  await dispatch(fetchRounds({ sessionId }));
});

export const createRoundNgandang = createAsyncThunk<
  void,
  { sessionId: string; winnerPlayerId: string }
>(
  "session/createRoundNgandang",
  async ({ sessionId, winnerPlayerId }, { dispatch }) => {
    await apiPost(`/game-sessions/${sessionId}/rounds/ngandang`, {
      winnerPlayerId,
    });
    await dispatch(fetchSession({ sessionId }));
    await dispatch(fetchRounds({ sessionId }));
  },
);

export const rollbackLast = createAsyncThunk<void, { sessionId: string }>(
  "session/rollbackLast",
  async ({ sessionId }, { dispatch }) => {
    await apiPost(`/game-sessions/${sessionId}/rounds/rollback-last`, {});
    await dispatch(fetchSession({ sessionId }));
    await dispatch(fetchRounds({ sessionId }));
  },
);

export const rollbackToRound = createAsyncThunk<
  void,
  { sessionId: string; roundId: string }
>("session/rollbackToRound", async ({ sessionId, roundId }, { dispatch }) => {
  await apiPost(`/game-sessions/${sessionId}/rounds/${roundId}/rollback`, {});
  await dispatch(fetchSession({ sessionId }));
  await dispatch(fetchRounds({ sessionId }));
});

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSessionError(state) {
      state.error = null;
    },
    resetSessionState(state) {
      state.mySessions = [];
      state.currentSession = null;
      state.rounds = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySessions = action.payload;
      })
      .addCase(fetchMySessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Gagal ambil sessions";
      })
      .addCase(fetchSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Gagal ambil session";
      })
      .addCase(fetchRounds.fulfilled, (state, action) => {
        state.rounds = action.payload;
      })
      .addCase(fetchRounds.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal ambil history";
      })
      .addCase(createSession.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal buat session";
      })
      .addCase(createSession.fulfilled, (state) => {
        // optional: list refresh handled by page
        state.error = null;
      })
      .addCase(addPlayer.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal tambah player";
      })
      .addCase(editPlayer.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal edit player";
      })
      .addCase(deletePlayer.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal hapus player";
      })
      .addCase(createRoundAll.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal buat ronde";
      })
      .addCase(createRoundNgandang.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal buat ronde";
      })
      .addCase(rollbackLast.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal rollback";
      })
      .addCase(rollbackToRound.rejected, (state, action) => {
        state.error = action.error.message ?? "Gagal rollback";
      });
  },
});

export const { clearSessionError, resetSessionState } = sessionSlice.actions;
export default sessionSlice.reducer;
