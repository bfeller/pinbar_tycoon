import React, { useEffect } from 'react';
import './EventNotification.css';

export default function EventNotification({ notification, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [notification, onDismiss]);

  return (
    <div className={`event-notification event-notification--${notification.severity}`}>
      <span className="event-notification__label">{notification.label}</span>
      <span className="event-notification__message">{notification.message}</span>
    </div>
  );
}
