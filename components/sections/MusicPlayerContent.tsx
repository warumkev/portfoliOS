import React, { useState, useRef, ChangeEvent } from "react";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";

/**
 * MusicPlayerContent displays a simple music player UI with play/pause and volume control.
 */
const MusicPlayerContent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col justify-center items-center min-w-[220px] min-h-0 w-full">
      <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl bg-background hover:bg-background/25 shadow-lg mb-6 flex items-center justify-center">
        <Music size={64} className="text-primary" />
      </div>
      <div className="flex flex-col items-start gap-6 mb-6">
        <div className="flex-1 text-left">
          <a className="font-medium mb-1">Lofi Chill.</a>
          <p className="text-muted">by <a href="https://ilovemusic.de" target="_blank" rel="noopener noreferrer">ilovemusic.</a></p>
        </div>
      </div>
      <button
        onClick={togglePlayPause}
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white hover:bg-background hover:text-primary transition"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
      </button>
      <div className="w-full max-w-xs mt-6 flex justify-center items-center gap-3 hidden md:flex">
        <VolumeX size={20} className="text-muted" aria-hidden="true" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
          aria-label="Lautstärkeregler"
          style={{ touchAction: "pan-y" }}
        />
        <Volume2 size={20} className="text-muted" aria-hidden="true" />
      </div>
      <audio
        ref={audioRef}
        src="https://play.ilovemusic.de/ilm_ilovechillhop"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      ></audio>
    </div>
  );
};

export default MusicPlayerContent;
