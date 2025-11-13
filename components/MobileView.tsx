"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

import { APP_CONFIG, AppConfig } from "../config/apps";
// Removed Wifi, Signal import

// --- App Icon Component ---
const AppIcon: React.FC<{
  id: string;
  config: AppConfig;
  onClick: (id: string) => void;
}> = ({ id, config, onClick }) => (
  <motion.div
    layoutId={`app-icon-${id}`}
    onClick={() => onClick(id)}
    className="flex flex-col items-center gap-2 cursor-pointer"
    role="button"
    aria-label={`Öffne ${config.title}`}
    tabIndex={0}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(id)}
  >
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary bg-background">
      {config.icon}
    </div>
    <span className="text-xs text-primary font-medium" aria-hidden="true">
      {config.title}
    </span>
  </motion.div>
);

// --- Main Mobile View Component ---

// --- Login Splash for Mobile ---
const MobileLoginSplash: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -1000, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-primary"
    >
      <div className="flex flex-col items-center gap-6 w-full text-center">
        <h1 className="text-xl font-medium tracking-tight select-none">
          portfoliOS
        </h1>
        <span className="select-none">
          a web portfolio by Kevin Tamme
        </span>
        <a
          href="/safe-mode.html"
          className="px-3 py-1 bg-primary text-secondary rounded hover:bg-muted hover:text-secondary transition"
          tabIndex={0}
        >
          Click here for Safe Mode
        </a>
      </div>
      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        style={{ touchAction: "pan-y" }}
        onDragEnd={(_e, info) => {
          if (info.offset.y < -60) {
            // swipe up threshold
            onLogin();
          }
        }}
        className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3"
      >
        <motion.div
          className="w-24 h-2 bg-foreground rounded-full"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-0 w-full flex flex-col items-center gap-3 text-center"
      >
        <span className="block mt-2">
          © {new Date().getFullYear()} Kevin Tamme – portfoliOS
        </span>
      </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function MobileView() {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Prevent pull-to-refresh (overscroll) but allow normal scrolling
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverscroll = html.style.overscrollBehaviorY;
    const prevBodyOverscroll = body.style.overscrollBehaviorY;
    const prevBodyTouchAction = body.style.touchAction;
    html.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";
    body.style.touchAction = "pan-y";
    const updateClock = () =>
      setTime(
        new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => {
      clearInterval(timer);
      html.style.overscrollBehaviorY = prevHtmlOverscroll;
      body.style.overscrollBehaviorY = prevBodyOverscroll;
      body.style.touchAction = prevBodyTouchAction;
    };
  }, []);

  const activeAppConfig = openApp ? APP_CONFIG[openApp] : null;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative">
      <AnimatePresence>
        {!loggedIn && (
          <MobileLoginSplash
            key="mobile-login"
            onLogin={() => setLoggedIn(true)}
          />
        )}
      </AnimatePresence>
      {/* Only load DotPattern after splash screen is gone */}
      <>
        {/* Large Centered Time Widget */}
        {!openApp && (
          <>
            <div className="w-full flex flex-col items-center mb-8 mt-8">
              <span className="text-9xl font-medium text-primary tracking-tight drop-shadow-sm">
                {time}
              </span>
            </div>
            <div className="flex-grow flex items-center justify-center p-8 z-10 w-full">
              <div className="grid grid-cols-3 gap-8 w-full max-w-xl mx-auto">
                {Object.entries(APP_CONFIG).map(([id, config]) => (
                  <AppIcon
                    key={id}
                    id={id}
                    config={config}
                    onClick={setOpenApp}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Opened App */}
        <AnimatePresence>
          {openApp && activeAppConfig && (
            <motion.div
              layoutId={`app-icon-${openApp}`}
              initial={{ borderRadius: "1.5rem", scale: 0.5, opacity: 0 }}
              animate={{ borderRadius: 0, scale: 1, opacity: 1 }}
              exit={{ borderRadius: "1.5rem", scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-30 flex flex-col bg-background/25 backdrop-blur-xl rounded-xl shadow-2xl py-12"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              aria-label={activeAppConfig.title}
            >
              <div className="flex-grow pt-10 pb-14 overflow-y-auto">
                {activeAppConfig.content}
              </div>
              {/* Home Button with swipe-to-close, always visible at bottom */}
              <motion.div
                className="fixed left-0 right-0 bottom-0 h-14 flex items-center justify-center z-50"
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0, bottom: 0 }}
                style={{ touchAction: "pan-y" }}
                onDragEnd={(_e, info) => {
                  if (info.offset.y < -60) {
                    // swipe up threshold
                    setOpenApp(null);
                  }
                }}
              >
                <button
                  onClick={() => setOpenApp(null)}
                  className="w-32 h-1.5 bg-foreground rounded-full"
                  aria-label="Zum Home-Bildschirm zurückkehren"
                  tabIndex={0}
                ></button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </div>
  );
}
