import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  cacheKey?: string;
  size?: "sm" | "default";
};

// Only one player audible at a time.
let activeStop: (() => void) | null = null;

const SPEEDS: { label: string; value: number }[] = [
  { label: "0.9×", value: 0.9 },
  { label: "1×", value: 1 },
  { label: "1.1×", value: 1.1 },
];

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayAudioButton({ text, cacheKey, size = "sm" }: Props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setProgress(0);
    setDuration(0);
    setCurrent(0);
  }, []);

  useEffect(() => {
    cleanup();
    setState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, text]);

  useEffect(() => () => cleanup(), [cleanup]);

  function stopThis() {
    if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
  }

  function tick() {
    const a = audioRef.current;
    if (!a) return;
    setCurrent(a.currentTime);
    setProgress(a.duration ? a.currentTime / a.duration : 0);
    rafRef.current = requestAnimationFrame(tick);
  }

  function fadeIn(a: HTMLAudioElement, ms = 220) {
    a.volume = 0;
    const start = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / ms);
      a.volume = k;
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }

  async function load(): Promise<HTMLAudioElement | null> {
    setState("loading");
    try {
      const lang = i18n.language?.startsWith("zh") ? "zh" : "en";
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error(t("voice.errTts"));
        setState("idle");
        return null;
      }
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, language: lang }),
      });
      if (!res.ok) {
        toast.error(t("voice.errTts"));
        setState("idle");
        return null;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audio.playbackRate = speed;
      audio.preload = "auto";
      audioRef.current = audio;
      audio.onloadedmetadata = () => setDuration(audio.duration || 0);
      audio.onended = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setState("idle");
        setProgress(0);
        setCurrent(0);
      };
      audio.onpause = () => {
        if (!audio.ended) setState((s) => (s === "playing" ? "paused" : s));
      };
      return audio;
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error(t("voice.errTts"));
      setState("idle");
      return null;
    }
  }

  async function onPlay() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (activeStop && activeStop !== stopThis) activeStop();
    activeStop = stopThis;

    let a = audioRef.current;
    if (!a) {
      a = await load();
      if (!a) return;
    }
    a.playbackRate = speed;
    fadeIn(a);
    await a.play();
    setState("playing");
    rafRef.current = requestAnimationFrame(tick);
  }

  function onRestart() {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    setProgress(0);
    setCurrent(0);
    if (state !== "playing") void onPlay();
  }

  function onSpeed(v: number) {
    setSpeed(v);
    if (audioRef.current) audioRef.current.playbackRate = v;
  }

  const hasAudio = !!audioRef.current;
  const loading = state === "loading";
  const playing = state === "playing";

  return (
    <div className="inline-flex w-full max-w-md flex-col gap-2 rounded-lg border border-border/60 bg-muted/40 p-2.5">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="default"
          size={size}
          onClick={onPlay}
          disabled={loading || !text.trim()}
          className="gap-1.5"
          aria-label={playing ? t("voice.pause") : t("voice.listen")}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : playing ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {loading
            ? t("voice.loading")
            : playing
              ? t("voice.pause")
              : state === "paused"
                ? t("voice.resume")
                : t("voice.listen")}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size={size}
          onClick={onRestart}
          disabled={!hasAudio || loading}
          aria-label={t("voice.restart")}
          className="px-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Volume2 className="h-3 w-3" />
          {hasAudio ? (
            <span className="tabular-nums">
              {fmt(current)} / {fmt(duration)}
            </span>
          ) : (
            <span>{t("voice.ready")}</span>
          )}
        </div>
      </div>

      {/* Progress bar (also shimmer while loading) */}
      <div
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full bg-border/70",
          loading && "animate-pulse",
        )}
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-[width] duration-150 ease-linear"
          style={{ width: `${Math.max(loading ? 12 : 0, progress * 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span>{t("voice.speed")}</span>
        <div className="ml-1 inline-flex overflow-hidden rounded-full border border-border/60">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSpeed(s.value)}
              className={cn(
                "px-2 py-0.5 transition-colors",
                speed === s.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
              aria-pressed={speed === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
