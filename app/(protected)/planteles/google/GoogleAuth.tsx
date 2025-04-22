"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store/AuthStore";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const SCOPES = "https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/userinfo.email";

export default function GoogleAuth() {
  const tokenClientRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const handleAuth = (token: string) => {
    console.log("Token recibido:", token);
    setAccessToken(token);
    localStorage.setItem("google_access_token", token);
    setSuccessMessage("Inicio de sesión exitoso ✅");
  };

  const handleLogout = () => {
    localStorage.removeItem("google_access_token");
    setAccessToken("");
    setSuccessMessage("");
  };

  useEffect(() => {
    const token = localStorage.getItem("google_access_token");
    if (token) {
      handleAuth(token);
    }

    const loadGoogleLibs = async () => {
      const loadScript = (src: string) =>
        new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });

      await loadScript("https://accounts.google.com/gsi/client");
      await loadScript("https://apis.google.com/js/api.js");

      await new Promise((resolve) => {
        (window as any).gapi.load("client", resolve);
      });

      await (window as any).gapi.client.init({
        discoveryDocs: ["https://people.googleapis.com/$discovery/rest?version=v1"],
      });

      tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            (window as any).gapi.client.setToken(response);
            handleAuth(response.access_token);
          }
        },
      });

      setIsReady(true);
    };

    loadGoogleLibs();
  }, []);

  const handleLogin = () => {
    tokenClientRef.current?.requestAccessToken();
  };

  if (!isReady) return null;

  return (
    <>
      {!successMessage && (
        <button
          onClick={handleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#fff",
            border: "1px solid #dcdcdc",
            borderRadius: "5px",
            padding: "10px 15px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#3c4043",
            fontFamily: "'Roboto', sans-serif",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            style={{ width: "18px", height: "18px" }}
          />
          <span>Iniciar sesión con Google</span>
        </button>
      )}

      {successMessage && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <p style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>
            {successMessage}
          </p>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "5px 10px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </>
  );
}
