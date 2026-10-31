"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const STATION = {
  title: "Lofi Chill",
  artist: "ilovemusic",
  artistUrl: "https://ilovemusic.de",
  streamUrl: "https://play.ilovemusic.de/ilm_ilovechillhop",
} as const;

type PlaybackState = "idle" | "loading" | "playing" | "error";

interface MusicValue {
  state: PlaybackState;
  isPlaying: boolean;
  volume: number;
  toggle: () => void;
  setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicValue | null>(null);

/**
 * One <audio> element for the whole OS so playback survives closing the
 * Music window. The element lives at the root and is never unmounted.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlaybackState>("idle");
  const [volume, setVolumeState] = useState(0.6);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state === "playing" || state === "loading") {
      audio.pause();
      // A live stream must reload on resume; dropping the src frees the connection.
      audio.removeAttribute("src");
      audio.load();
      setState("idle");
      return;
    }
    setState("loading");
    audio.src = STATION.streamUrl;
    audio
      .play()
      .then(() => setState("playing"))
      .catch(() => setState("error"));
  }, [state]);

  const setVolume = useCallback((next: number) => {
    setVolumeState(Math.min(1, Math.max(0, next)));
  }, []);

  const value = useMemo<MusicValue>(
    () => ({ state, isPlaying: state === "playing", volume, toggle, setVolume }),
    [state, volume, toggle, setVolume]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => setState("playing")}
        onPause={() => setState((s) => (s === "error" ? s : "idle"))}
        onError={() => setState("error")}
        aria-hidden="true"
      />
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
}
