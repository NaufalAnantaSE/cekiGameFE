import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiPost } from "../services/api";

type AuthState = {
  token: string | null;
  user: { username: string } | null;
  isLoading: boolean;
  error: string | null;
};

const TOKEN_STORAGE_KEY = "ceki.token";

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<
  { access_token: string },
  { username: string; password: string }
>("auth/login", async (body) => {
  return apiPost<{ access_token: string }>("/auth/login", body, {
    auth: false,
  });
});

export const register = createAsyncThunk<
  { id: string; username: string },
  { username: string; password: string }
>("auth/register", async (body) => {
  return apiPost<{ id: string; username: string }>("/auth/register", body, {
    auth: false,
  });
});

export const loadTokenFromStorage = createAsyncThunk<string | null>(
  "auth/loadTokenFromStorage",
  async () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setToken(state, action: { payload: string | null }) {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, action.payload);
        } else {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTokenFromStorage.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Register gagal";
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.access_token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Login gagal";
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearAuthError, setToken } = authSlice.actions;
export default authSlice.reducer;
