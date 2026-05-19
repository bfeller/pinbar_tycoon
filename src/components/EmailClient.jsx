import React, { useState, useEffect } from 'react';
import './EmailClient.css';

export default function EmailClient({ emails, onChoice, onRead, onClose, characterName }) {
  const toAddress = characterName
    ? `${characterName.toLowerCase().replace(/\s+/g, '.')}@pinbartycoon.com`
    : 'you@pinbartycoon.com';
  const firstUnread = emails.find(e => !e.read);
  const [selectedId, setSelectedId] = useState((firstUnread ?? emails[0])?.id ?? null);

  const selected = emails.find(e => e.id === selectedId);
  const unread = new Set(emails.filter(e => !e.read).map(e => e.id));

  useEffect(() => {
    if (selectedId) {
      const email = emails.find(e => e.id === selectedId);
      if (email && !email.read) onRead?.(selectedId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectEmail = (id) => {
    setSelectedId(id);
    const email = emails.find(e => e.id === id);
    if (email && !email.read) onRead?.(id);
  };

  return (
    <div className="email-window">
      <div className="win95-titlebar">
        <div className="title">📧 Outlook Express</div>
        <button className="win95-close" onClick={onClose}>X</button>
      </div>

      {/* toolbar strip */}
      <div className="email-toolbar">
        <span className="email-toolbar-btn">← Reply</span>
        <span className="email-toolbar-btn">→ Forward</span>
        <span className="email-toolbar-sep">|</span>
        <span className="email-toolbar-btn">🗑 Delete</span>
      </div>

      <div className="email-panes">
        {/* left pane: message list */}
        <div className="email-list-pane">
          <div className="email-list-header">
            <span>From</span><span>Subject</span>
          </div>
          {emails.length === 0 && (
            <div className="email-empty">No messages</div>
          )}
          {[...emails].reverse().map(email => (
            <div
              key={email.id}
              className={`email-list-row ${selectedId === email.id ? 'selected' : ''} ${unread.has(email.id) ? 'unread' : ''}`}
              onClick={() => selectEmail(email.id)}
            >
              <span className="email-list-from">{email.from}</span>
              <span className="email-list-subject">{email.subject}</span>
            </div>
          ))}
        </div>

        {/* right pane: message content */}
        <div className="email-content-pane">
          {selected ? (
            <>
              <div className="email-header-block">
                <div><span className="email-header-label">From:</span> {selected.from} &lt;{selected.address}&gt;</div>
                <div><span className="email-header-label">To:</span> {toAddress}</div>
                <div><span className="email-header-label">Subject:</span> {selected.subject}</div>
              </div>
              <hr className="email-divider" />
              <pre className="email-body">{selected.body}</pre>
              {selected.choices && !selected.choiceMade && !selected.choicesExpired && (
                <div className="email-choices">
                  {selected.choices.map((c, i) => (
                    <button
                      key={i}
                      className="win95-btn email-choice-btn"
                      onClick={() => onChoice(selected.id, c.effectId)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
              {selected.choiceMade && (
                <div className="email-choice-done">— Response sent —</div>
              )}
              {selected.choicesExpired && !selected.choiceMade && (
                <div className="email-choice-done" style={{ color: '#8b0000' }}>— Offer has expired —</div>
              )}
            </>
          ) : (
            <div className="email-empty">Select a message to read it.</div>
          )}
        </div>
      </div>

      {/* status bar */}
      <div className="email-statusbar">
        {emails.length} message{emails.length !== 1 ? 's' : ''} · {unread.size} unread
      </div>
    </div>
  );
}
