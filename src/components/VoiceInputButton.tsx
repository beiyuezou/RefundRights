import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  onTranscript: (text: string) => void;
  language?: string; // ISO 639-3 e.g. "eng", "cmn". Omit for auto-detect.
  disabled?: boolean;
};

export function VoiceInputButton({ onTranscript, language, disabled }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function start() {
    if (state !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => void handleStop(mime);
      rec.start();
      recorderRef.current = rec;
      setState("recording");
    } catch (err) {
      console.error(err);
      toast.error(t("voice.errMic"));
    }
  }

  function stop() {
    if (state !== "recording") return;
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    setState("processing");
  }

  async function handleStop(mime: string) {
    try {
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 1000) {
        toast.error(t("voice.errTooShort"));
        setState("idle");
        return;
      }
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      if (language) fd.append("language", language);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error(t("voice.errTranscribe"));
        setState("idle");
        return;
      }
      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      });
      if (!res.ok) {
        toast.error(t("voice.errTranscribe"));
        setState("idle");
        return;
      }
      const data = (await res.json()) as { text?: string };
      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
        toast.success(t("voice.added"));
      } else {
        toast.error(t("voice.errEmpty"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("voice.errTranscribe"));
    } finally {
      setState("idle");
    }
  }

  return (
    <Button
      type="button"
      variant={state === "recording" ? "destructive" : "outline"}
      size="sm"
      onClick={state === "recording" ? stop : start}
      disabled={disabled || state === "processing"}
      className="gap-1.5"
    >
      {state === "processing" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("voice.transcribing")}
        </>
      ) : state === "recording" ? (
        <>
          <Square className="h-3.5 w-3.5 fill-current" />
          {t("voice.stop")}
        </>
      ) : (
        <>
          <Mic className="h-3.5 w-3.5" />
          {t("voice.record")}
        </>
      )}
    </Button>
  );
}
