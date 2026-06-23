const TOOL_META = {
  identify_user:        { icon: "👤", label: "Identifying patient",     doneLabel: "Patient identified ✅" },
  fetch_slots:          { icon: "📅", label: "Fetching available slots", doneLabel: "Slots loaded ✅" },
  book_appointment:     { icon: "📝", label: "Booking appointment...",   doneLabel: "Booking confirmed ✅" },
  retrieve_appointments:{ icon: "📋", label: "Fetching appointments...", doneLabel: "Appointments loaded ✅" },
  cancel_appointment:   { icon: "❌", label: "Cancelling appointment...",doneLabel: "Cancelled ✅" },
  modify_appointment:   { icon: "🔄", label: "Rescheduling...",          doneLabel: "Rescheduled ✅" },
  end_conversation:     { icon: "👋", label: "Wrapping up...",           doneLabel: "Call ended ✅" },
};

function ToolEvent({ event }) {
  const meta = TOOL_META[event.name] || { icon: "⚙️", label: event.name, doneLabel: `${event.name} done ✅` };
  const isDone = event.status === "done";
  const failed = isDone && event.result?.success === false;

  return (
    <div className={`tool-event ${isDone ? (failed ? "failed" : "done") : "calling"}`}>
      <span className="tool-icon">{failed ? "⚠️" : meta.icon}</span>
      <div className="tool-info">
        <span className="tool-name">
          {isDone
            ? failed
              ? `${meta.icon} ${event.result?.error || "Failed"}`
              : meta.doneLabel
            : meta.label}
        </span>
        {isDone && event.result?.message && (
          <span className="tool-message">{event.result.message}</span>
        )}
        {isDone && event.result?.date && (
          <span className="tool-detail">
            {event.result.date} · {event.result.time}
          </span>
        )}
      </div>
      <span className="tool-ts">{event.ts}</span>
    </div>
  );
}

export function ToolStatus({ events }) {
  if (!events.length) {
    return (
      <div className="tool-feed empty">
        <p>Tool calls will appear here during the conversation.</p>
      </div>
    );
  }

  return (
    <div className="tool-feed">
      <h3 className="tool-feed-title">Live Actions</h3>
      <div className="tool-list">
        {events.map((e) => (
          <ToolEvent key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
