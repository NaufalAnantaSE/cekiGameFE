import { createSlice } from "@reduxjs/toolkit";

type UiState = {
  globalLoading: boolean;
  globalError: string | null;
};

const initialState: UiState = {
  globalLoading: false,
  globalError: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading(state, action: { payload: boolean }) {
      state.globalLoading = action.payload;
    },
    setGlobalError(state, action: { payload: string | null }) {
      state.globalError = action.payload;
    },
    clearGlobalError(state) {
      state.globalError = null;
    },
  },
});

export const { setGlobalLoading, setGlobalError, clearGlobalError } =
  uiSlice.actions;
export default uiSlice.reducer;
