import { useEffect, useRef, useState } from "react";

export function Avatar({ isSpeaking, getAnalyser, phase }) {
  const [mouthH, setMouthH] = useState(4);
  const [blink, setBlink] = useState(false);
  const rafRef = useRef(null);

  // ── lip sync via Web Audio analyser ───────────────────────────────────────
  useEffect(() => {
    if (!isSpeaking) {
      setMouthH(4);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const animate = () => {
      const analyser = getAnalyser();
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        // Use low-frequency bins (speech range)
        const avg = data.slice(1, 8).reduce((a, b) => a + b, 0) / 7;
        setMouthH(4 + Math.min(avg / 6, 22));
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isSpeaking, getAnalyser]);

  // ── blinking ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const blink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    };
    blink();
    const id = setInterval(blink, 3500 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  const isActive = phase === "speaking" || phase === "processing" || phase === "recording";
  const eyeRy = blink ? 1 : 10;

  return (
    <div className={`avatar-container ${isActive ? "active" : ""} ${isSpeaking ? "speaking" : ""}`}>
      {/* Outer ring pulse */}
      <div className="avatar-ring" />

      <svg
        viewBox="0 0 160 160"
        width="160"
        height="160"
        className="avatar-svg"
        aria-label="AI voice avatar"
      >
        {/* Face base */}
        <circle cx="80" cy="80" r="72" fill="#1e2433" stroke="#3b4a6b" strokeWidth="2" />

        {/* Ear left */}
        <ellipse cx="12" cy="84" rx="7" ry="11" fill="#1e2433" stroke="#3b4a6b" strokeWidth="1.5" />
        {/* Ear right */}
        <ellipse cx="148" cy="84" rx="7" ry="11" fill="#1e2433" stroke="#3b4a6b" strokeWidth="1.5" />

        {/* Inner face glow */}
        <circle cx="80" cy="80" r="68" fill="#242b3e" />

        {/* Eyebrows */}
        <path d="M52 58 Q62 53 72 58" fill="none" stroke="#7b8ec8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M88 58 Q98 53 108 58" fill="none" stroke="#7b8ec8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes */}
        <ellipse cx="62" cy="72" rx="10" ry={eyeRy} fill="#4f7bf7" />
        <ellipse cx="98" cy="72" rx="10" ry={eyeRy} fill="#4f7bf7" />
        {/* Pupils */}
        {!blink && (
          <>
            <circle cx="64" cy="72" r="4" fill="#1a2340" />
            <circle cx="100" cy="72" r="4" fill="#1a2340" />
            {/* Eye shine */}
            <circle cx="66" cy="70" r="2" fill="white" opacity="0.8" />
            <circle cx="102" cy="70" r="2" fill="white" opacity="0.8" />
          </>
        )}

        {/* Nose */}
        <path d="M78 88 Q80 94 82 88" fill="none" stroke="#7b8ec8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Mouth */}
        <ellipse
          cx="80"
          cy="112"
          rx="18"
          ry={mouthH}
          fill={isSpeaking ? "#4f7bf7" : "#3b4a6b"}
          style={{ transition: "ry 0.05s ease-out" }}
        />
        {/* Teeth hint when talking */}
        {mouthH > 10 && (
          <ellipse cx="80" cy="110" rx="14" ry={mouthH * 0.45} fill="#e8ecff" opacity="0.85" />
        )}

        {/* Sound waves when speaking */}
        {isSpeaking && (
          <>
            <path
              d="M8 80 Q14 68 8 56"
              fill="none"
              stroke="#4f7bf7"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
              className="wave"
            />
            <path
              d="M152 80 Q146 68 152 56"
              fill="none"
              stroke="#4f7bf7"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
              className="wave"
            />
          </>
        )}
      </svg>

      {/* Status label */}
      <div className="avatar-label">
        {phase === "recording" && "🔴 Listening..."}
        {phase === "processing" && "⚙️ Processing..."}
        {phase === "speaking" && "🗣 Speaking..."}
        {phase === "ready" && "💬 Ready"}
        {phase === "connecting" && "🔗 Connecting..."}
        {phase === "idle" && "Mia — Voice AI"}
        {phase === "ended" && "✅ Call ended"}
      </div>
    </div>
  );
}
