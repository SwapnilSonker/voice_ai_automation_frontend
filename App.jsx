import { useVoiceAgent } from "./useVoiceAgent";
import { Avatar } from "./Avatar";
import { VoiceButton } from "./VoiceButton";
import { ToolStatus } from "./ToolStatus";
import { CallSummary } from "./CallSummary";

export default function App() {
  const {
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
  } = useVoiceAgent();

  const isCallActive = phase !== "idle";

  const handleNewCall = () => {
    disconnect();
    setTimeout(connect, 300);
  };

  return (
    <div className="app">
      {/* ── header ──────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">Mykare Voice AI</span>
        </div>
        {isCallActive && phase !== "ended" && (
          <button className="btn-end-call" onClick={disconnect}>
            End Call
          </button>
        )}
      </header>

      {/* ── main layout ─────────────────────────────────────────────────── */}
      <main className="app-main">
        {/* LEFT: Avatar + voice interaction */}
        <div className="left-panel">
          {/* Model Inspector Card */}
          <Avatar
            isSpeaking={isSpeaking}
            getAnalyser={getAnalyser}
            phase={phase}
          />

          {/* Transcript bubble */}
          {transcript && (
            <div className="transcript-bubble">
              <span className="transcript-label">You said</span>
              <p>{transcript}</p>
            </div>
          )}

          {/* AI response bubble */}
          {aiText && (
            <div className="ai-bubble">
              <span className="ai-label">Mia</span>
              <p>{aiText}</p>
            </div>
          )}

          {/* Status */}
          {statusText && phase !== "ready" && (
            <div className="status-bar">{statusText}</div>
          )}

          {/* Controls */}
          <div className="controls">
            {phase === "idle" && (
              <button className="btn-start-call" onClick={connect}>
                🎙 Start Call
              </button>
            )}

            {(phase === "ready" || phase === "recording") && (
              <VoiceButton
                phase={phase}
                onStart={startRecording}
                onStop={stopRecording}
              />
            )}

            {(phase === "processing" || phase === "connecting" || phase === "speaking") && (
              <div className="processing-indicator">
                <span className="dot-pulse" />
                <span>{phase === "speaking" ? "Mia is speaking..." : "Processing..."}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Tool status feed */}
        <div className="right-panel">
          <ToolStatus events={toolEvents} />
        </div>
      </main>

      {/* ── call summary overlay ─────────────────────────────────────────── */}
      {summary && (
        <CallSummary summary={summary} onNewCall={handleNewCall} />
      )}
    </div>
  );
}
