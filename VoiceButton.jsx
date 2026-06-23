import { useEffect } from "react";

export function VoiceButton({ phase, onStart, onStop }) {
  const isRecording = phase === "recording";
  const canRecord = phase === "ready";

  // ── spacebar shortcut ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat && canRecord) {
        e.preventDefault();
        onStart();
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space" && isRecording) {
        e.preventDefault();
        onStop();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [canRecord, isRecording, onStart, onStop]);

  return (
    <div className="voice-btn-wrap">
      <button
        className={`voice-btn ${isRecording ? "recording" : ""} ${!canRecord && !isRecording ? "disabled" : ""}`}
        onMouseDown={() => canRecord && onStart()}
        onMouseUp={() => isRecording && onStop()}
        onTouchStart={(e) => { e.preventDefault(); canRecord && onStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); isRecording && onStop(); }}
        disabled={!canRecord && !isRecording}
        aria-label={isRecording ? "Release to send" : "Hold to speak"}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
        <span>{isRecording ? "Release to send" : "Hold to speak"}</span>
      </button>
      <p className="voice-hint">or hold Spacebar</p>
    </div>
  );
}
