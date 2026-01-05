"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import { store } from "../store/store";
import { setToken } from "../store/authSlice";
import { resetSessionState } from "../store/sessionSlice";
import { setApiUnauthorizedHandler } from "../services/api";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      store.dispatch(setToken(null));
      store.dispatch(resetSessionState());

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    });

    return () => {
      setApiUnauthorizedHandler(null);
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
