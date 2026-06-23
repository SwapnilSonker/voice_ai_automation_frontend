import { useRef, useState, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws/conversation";

export function useVoiceAgent() {
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);

  const [phase, setPhase] = useState("idle");
  // idle | connecting | ready | recording | processing | speaking | ended

  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("");
  const [statusText, setStatusText] = useState("");
  const [toolEvents, setToolEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── expose analyser so Avatar can read volume ─────────────────────────────
  const getAnalyser = useCallback(() => analyserRef.current, []);

  // ── play raw WAV bytes via Web Audio API ──────────────────────────────────
  const playAudioBytes = useCallback(async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();

    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    setIsSpeaking(true);
    source.start(0);
    source.onended = () => {
      setIsSpeaking(false);
      analyserRef.current = null;
      setPhase("ready");
    };
  }, []);

  // ── handle incoming WebSocket messages ────────────────────────────────────
  const handleMessage = useCallback(
    async (event) => {
      if (event.data instanceof Blob) {
        setPhase("speaking");
        await playAudioBytes(event.data);
        return;
      }

      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "transcript":
          setTranscript(msg.text);
          setPhase("processing");
          break;

        case "ai_text":
          setAiText(msg.text);
          break;

        case "status":
          setStatusText(msg.text);
          break;

        case "tool_calling":
          setToolEvents((prev) => [
            ...prev,
            {
              id: Date.now(),
              name: msg.tool,
              args: msg.args,
              status: "calling",
              ts: new Date().toLocaleTimeString(),
            },
          ]);
          break;

        case "tool_done":
          setToolEvents((prev) =>
            prev.map((e) =>
              e.name === msg.tool && e.status === "calling"
                ? { ...e, status: "done", result: msg.result }
                : e
            )
          );
          break;

        case "summary":
          setSummary(msg.data);
          setPhase("ended");
          break;

        case "error":
          console.error("Backend error:", msg.message);
          setStatusText(`Error: ${msg.message}`);
          setPhase("ready");
          break;

        case "tts_error":
          // TTS failed — show text response already rendered, reset to ready
          console.warn("TTS unavailable:", msg.message);
          setStatusText("Voice unavailable — please continue typing or speaking");
          setPhase("ready");
          break;

        default:
          break;
      }
    },
    [playAudioBytes]
  );

  // ── connect WebSocket ─────────────────────────────────────────────────────
  const connect = useCallback(() => {
    setPhase("connecting");
    setToolEvents([]);
    setSummary(null);
    setTranscript("");
    setAiText("");

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setPhase("processing"); // wait for greeting audio
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      setStatusText("Connection error — is the backend running?");
      setPhase("idle");
    };

    ws.onclose = () => {
      if (phase !== "ended") setPhase("idle");
    };
  }, [handleMessage]);

  // ── start push-to-talk recording ─────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (phase !== "ready") return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size > 1000 && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(blob);
        setPhase("processing");
      } else {
        setPhase("ready");
      }
    };

    recorder.start(100); // collect in 100ms chunks
    setPhase("recording");
  }, [phase]);

  // ── stop recording ────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    setPhase("idle");
  }, []);

  return {
    phase,
    transcript,
    aiText,
    statusText,
    toolEvents,
    summary,
    isSpeaking,
    getAnalyser,
    connect,
    startRecording,
    stopRecording,
    disconnect,
  };
}
