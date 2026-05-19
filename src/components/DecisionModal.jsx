import './DecisionModal.css';

export default function DecisionModal({ event, onChoice }) {
  return (
    <div className="decision-overlay">
      <div className="decision-dialog">
        <div className="decision-titlebar">
          <span>{event.label}</span>
        </div>
        <div className="decision-body">
          <p className="decision-message">{event.message}</p>
          <div className="decision-choices">
            {event.choices.map(choice => (
              <button
                key={choice.id}
                className="decision-btn"
                onClick={() => onChoice(choice)}
              >
                <span className="decision-btn-label">{choice.label}</span>
                {choice.hint && (
                  <span className="decision-btn-hint">{choice.hint}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
