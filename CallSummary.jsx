export function CallSummary({ summary, onNewCall }) {
  if (!summary) return null;

  return (
    <div className="summary-overlay">
      <div className="summary-card">
        <div className="summary-header">
          <span className="summary-icon">📋</span>
          <h2>Call Summary</h2>
          <span className="summary-ts">
            {summary.timestamp
              ? new Date(summary.timestamp).toLocaleString()
              : new Date().toLocaleString()}
          </span>
        </div>

        <div className="summary-body">
          {/* Main summary */}
          <div className="summary-section">
            <h4>Summary</h4>
            <p>{summary.summary}</p>
          </div>

          {/* Intent */}
          {summary.user_intent && (
            <div className="summary-section">
              <h4>Patient Intent</h4>
              <span className="intent-badge">{summary.user_intent}</span>
            </div>
          )}

          {/* Appointments booked */}
          {summary.appointments_booked?.length > 0 && (
            <div className="summary-section">
              <h4>Appointments Booked</h4>
              <ul className="appt-list">
                {summary.appointments_booked.map((id) => (
                  <li key={id}>Appointment #{id}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversation log */}
          {summary.full_history?.length > 0 && (
            <div className="summary-section">
              <h4>Conversation Log</h4>
              <div className="convo-log">
                {summary.full_history.map((m, i) => (
                  <div key={i} className={`log-msg ${m.role}`}>
                    <span className="log-role">{m.role === "user" ? "Patient" : "Mia"}</span>
                    <span className="log-text">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="summary-footer">
          <button className="btn-new-call" onClick={onNewCall}>
            Start New Call
          </button>
        </div>
      </div>
    </div>
  );
}
