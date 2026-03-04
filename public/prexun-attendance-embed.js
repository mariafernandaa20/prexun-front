"use strict";
(() => {
  const spinAnimationStyles = "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
  const loadingStyles = "position: absolute; top: 50%; left: 50%; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 30px; height: 30px; animation: spin 2s linear infinite; margin-left: -15px; margin-top: -15px;";

  const popupStyles = `
  ${spinAnimationStyles}
  .prexun-attendance-popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, .7); display: flex; justify-content: center; align-items: center; z-index: 1000000; opacity: 0; transition: opacity .25s ease; backdrop-filter: blur(4px); }
  .prexun-attendance-iframe-container { position: relative; background: white; border-radius: 12px; width: 90%; max-width: 560px; height: 80vh; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: scale(0.9); transition: transform .25s ease; }
  .prexun-attendance-popup-overlay.active { opacity: 1; }
  .prexun-attendance-popup-overlay.active .prexun-attendance-iframe-container { transform: scale(1); }
  .prexun-attendance-close-icon { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; background: #171717; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; font-family: Arial; z-index: 10; font-weight: bold; }
  @media(max-width: 480px) { .prexun-attendance-iframe-container { width: 100%; height: 100%; border-radius: 0; } }
  `;

  if (typeof window === "undefined") return;

  const getLuminance = (hex) => {
    let r;
    let g;
    let b;
    if (/^#/.test(hex)) {
      const bigint = parseInt(hex.slice(1), 16);
      r = (bigint >> 16) & 255;
      g = (bigint >> 8) & 255;
      b = bigint & 255;
    } else {
      [r, g, b] = [59, 130, 246];
    }
    const channels = [r, g, b].map((value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };

  const getScriptOrigin = () => {
    const script = document.currentScript;
    if (script && script.src) {
      try {
        return new URL(script.src).origin;
      } catch {
        return window.location.origin;
      }
    }
    return window.location.origin;
  };

  const getAttendanceWindow = () => {
    const minute = new Date().getMinutes();

    if (minute < 15) {
      return {
        mode: "check_in",
        canOpen: true,
        label: "Ventana de entrada activa (00-14)",
      };
    }

    if (minute >= 45) {
      return {
        mode: "check_out",
        canOpen: true,
        label: "Ventana de salida activa (45-59)",
      };
    }

    return {
      mode: "locked",
      canOpen: false,
      label: "Registro bloqueado (15-44)",
    };
  };

  const initPrexunAttendanceEmbed = () => {
    const targets = document.querySelectorAll(
      "[data-prexun-attendance], [data-prexun-id]"
    );

    if (targets.length > 0 && !window.__prexunAttendanceStylesInjected) {
      const styleTag = document.createElement("style");
      styleTag.innerHTML = popupStyles;
      document.head.appendChild(styleTag);
      window.__prexunAttendanceStylesInjected = true;
    }

    targets.forEach((target) => {
      if (target.dataset.prexunAttendanceInitialized) return;

      const scriptOrigin = getScriptOrigin();
      const attendanceBaseUrl =
        target.dataset.prexunAttendanceUrl || `${scriptOrigin}/asistencia-publica`;
      const apiUrl = target.dataset.prexunApiUrl || "";

      const btnText =
        target.dataset.prexunText || "Registrar asistencia";
      const btnColor = target.dataset.prexunColor || "#2563eb";
      const btnFloat = target.dataset.prexunFloat || "none";
      const textColor = getLuminance(btnColor) > 0.5 ? "black" : "white";
      const enforceWindow = (target.dataset.prexunWindowControl || "true") !== "false";

      const button = document.createElement("button");
      button.innerText = btnText;
      Object.assign(button.style, {
        cursor: "pointer",
        padding: "12px 24px",
        fontSize: "16px",
        borderRadius: "30px",
        backgroundColor: btnColor,
        color: textColor,
        border: "none",
        fontWeight: "bold",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        transition: "transform 0.2s",
      });

      if (btnFloat !== "none") {
        button.style.position = "fixed";
        button.style.bottom = "32px";
        button.style.zIndex = "999999";
        if (btnFloat === "bottom-right") button.style.right = "32px";
        else button.style.left = "32px";
      }

      const statusText = document.createElement("div");
      Object.assign(statusText.style, {
        marginTop: "8px",
        fontSize: "12px",
        color: "#374151",
        fontFamily: "Arial, sans-serif",
      });

      const updateButtonState = () => {
        if (!enforceWindow) {
          button.disabled = false;
          button.style.opacity = "1";
          button.style.cursor = "pointer";
          statusText.textContent = "";
          return;
        }

        const windowState = getAttendanceWindow();
        button.disabled = !windowState.canOpen;
        button.style.opacity = windowState.canOpen ? "1" : "0.7";
        button.style.cursor = windowState.canOpen ? "pointer" : "not-allowed";
        statusText.textContent = windowState.label;
      };

      updateButtonState();
      window.setInterval(updateButtonState, 30000);

      const openPopup = () => {
        const windowState = getAttendanceWindow();
        if (enforceWindow && !windowState.canOpen) {
          statusText.textContent = windowState.label;
          return;
        }

        const overlay = document.createElement("div");
        overlay.className = "prexun-attendance-popup-overlay";

        const container = document.createElement("div");
        container.className = "prexun-attendance-iframe-container";

        const loading = document.createElement("div");
        loading.style.cssText = loadingStyles;

        const close = document.createElement("div");
        close.className = "prexun-attendance-close-icon";
        close.innerHTML = "&times;";

        const iframe = document.createElement("iframe");

        const iframeUrl = new URL(attendanceBaseUrl, window.location.origin);
        if (apiUrl) iframeUrl.searchParams.set("apiUrl", apiUrl);
        iframeUrl.searchParams.set("mode", windowState.mode);

        iframe.src = iframeUrl.toString();
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        container.appendChild(loading);
        container.appendChild(close);
        container.appendChild(iframe);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add("active"), 10);
        document.body.style.overflow = "hidden";

        const closeAction = () => {
          overlay.classList.remove("active");
          setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = "";
          }, 250);
        };

        close.onclick = closeAction;
        overlay.onclick = (event) => {
          if (event.target === overlay) closeAction();
        };
        iframe.onload = () => {
          loading.style.display = "none";
        };
      };

      button.onclick = openPopup;
      target.appendChild(button);
      target.appendChild(statusText);
      target.dataset.prexunAttendanceInitialized = "true";
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPrexunAttendanceEmbed);
  } else {
    initPrexunAttendanceEmbed();
  }
})();
