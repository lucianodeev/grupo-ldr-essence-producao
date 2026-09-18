import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "ldr_academy_ambient_audio";
const AUDIO_SRC = "/audio/ldr-academy-ambient.mp3";
const DEFAULT_VOLUME = 0.07;

function isAcademyHost() {
  return typeof window !== "undefined" && /(^|\.)ldracademy\.online$/i.test(window.location.hostname);
}

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!isAcademyHost()) return;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const shouldPlay = stored !== "off";
    setEnabled(shouldPlay);

    const markAvailable = () => setAvailable(true);
    const markUnavailable = () => setAvailable(false);
    audio.addEventListener("canplay", markAvailable);
    audio.addEventListener("error", markUnavailable);

    const startOnInteraction = () => {
      if (!shouldPlay) return;
      void audio.play().catch(() => undefined);
    };

    window.addEventListener("pointerdown", startOnInteraction, { once: true, passive: true });
    window.addEventListener("keydown", startOnInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      audio.removeEventListener("canplay", markAvailable);
      audio.removeEventListener("error", markUnavailable);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio.pause();
      window.localStorage.setItem(STORAGE_KEY, "off");
      setEnabled(false);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, "on");
    setEnabled(true);
    void audio.play().catch(() => undefined);
  };

  if (!isAcademyHost() || !available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Desativar música ambiente" : "Ativar música ambiente"}
      aria-pressed={enabled}
      title={enabled ? "Desativar música ambiente" : "Ativar música ambiente"}
      className="fixed bottom-4 left-4 z-[79] inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/95 text-primary shadow-lg backdrop-blur transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
