import React, { useState, useEffect } from "react";
import { CircuitBoard, Clock, Globe2, Monitor, Moon, Sun } from "lucide-react";

/**
 * SysteminfoContent displays system and environment info, theme toggle, and some fun stats.
 */
const SysteminfoContent = () => {
  const [date, setDate] = useState<string>("");
  const [windowSize, setWindowSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("isDarkMode");
      return storedTheme === "true";
    }
    return false;
  });

  useEffect(() => {
    const update = () => {
      setDate(new Date().toLocaleString());
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    const interval = setInterval(update, 2000);
    return () => {
      window.removeEventListener("resize", update);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("isDarkMode", isDarkMode.toString());
  }, [isDarkMode]);

  return (
    <div className="relative p-6 md:p-8 font-sans min-h-0 h-full w-full flex flex-col items-center justify-center shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary rounded-full p-3 shadow">
          <CircuitBoard size={40} className="text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">PortfoliOS 2510.22</h2>
          <p className="text-xs text-muted">© 2025 Kevin Tamme</p>
        </div>
      </div>
      <div className="flex gap-3 items-center mb-4">
        <span className="text-xs bg-success text-secondary px-2 py-1 rounded">
          Online
        </span>
        <span className="text-xs text-muted">Last Update: 22.10.2025</span>
      </div>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background hover:bg-background/25"
      >
        {isDarkMode ? (
          <Sun size={20} className="text-primary" />
        ) : (
          <Moon size={20} className="text-primary" />
        )}
        <span className="text-primary">
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
      <div className="mt-4 w-full space-y-3">
        <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-background hover:bg-background/25">
          <span className="">
            <Clock size={20} className="text-primary" />
          </span>
          <span className="text-primary">Time:</span>
          <span className="ml-auto font-semibold text-muted">{date}</span>
        </div>
        <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-background hover:bg-background/25">
          <span className="text-primary">
            <Globe2 size={20} />
          </span>
          <span className="text-primary">Browser:</span>
          <span className="ml-auto font-semibold text-muted">
            {typeof navigator !== "undefined" ? navigator.userAgent : "-"}
          </span>
        </div>
        <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-background hover:bg-background/25">
          <span className="text-primary">
            <Monitor size={20} />
          </span>
          <span className="text-primary">OS:</span>
          <span className="ml-auto font-semibold text-muted">
            {typeof navigator !== "undefined" ? navigator.platform : "-"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SysteminfoContent;
