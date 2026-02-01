import React, { createContext, useContext, useMemo, useState } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(!!getAccessToken());

  async function login(username, password) {
    const res = await api.post("token/", { username, password }); // note: ../token from /api/
    setTokens(res.data);
    setIsAuthed(true);
  }

  async function signup(username, password) {
    await api.post("auth/register/", { username, password });
    // auto-login after signup:
    await login(username, password);
  }

  function logout() {
    clearTokens();
    setIsAuthed(false);
  }

  const value = useMemo(
    () => ({ isAuthed, login, signup, logout }),
    [isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
