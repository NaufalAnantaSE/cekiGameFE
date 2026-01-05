import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import sessionReducer from "./sessionSlice";
import uiReducer from "./uiSlice";
import { setGlobalError, setGlobalLoading } from "./uiSlice";
import { resetSessionState } from "./sessionSlice";

const globalUiMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const actionType = (action as { type?: string })?.type;
  if (typeof actionType === "string" && !actionType.startsWith("ui/")) {
    if (actionType === "auth/logout/fulfilled") {
      storeApi.dispatch(resetSessionState());
    }

    if (actionType.endsWith("/pending")) {
      storeApi.dispatch(setGlobalLoading(true));
      storeApi.dispatch(setGlobalError(null));
    }
    if (actionType.endsWith("/fulfilled")) {
      storeApi.dispatch(setGlobalLoading(false));
    }
    if (actionType.endsWith("/rejected")) {
      storeApi.dispatch(setGlobalLoading(false));
      const message = (action as { error?: { message?: string } })?.error?.message;
      storeApi.dispatch(setGlobalError(message ?? "Request gagal"));
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(globalUiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
