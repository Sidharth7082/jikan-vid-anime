
import { useState, useEffect } from "react";

const TOKEN_KEY = "waifu_api_token";

export function useWaifuApiToken() {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    setTokenState(stored);
  }, []);

  const setToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  return { token, setToken, clearToken };
}
