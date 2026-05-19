import React, { useEffect } from 'react';
import './EventNotification.css';

function effectBadge(effect, effectValue) {
  if (effectValue == null) return null;
  if (effect === 'income_delta') {
    const sign = effectValue >= 0 ? '+' : '';
    return { text: `${sign}$${Math.abs(effectValue).toLocaleString()}`, positive: effectValue >= 0 };
  }
  if (effect === 'popularity_delta') {
    const sign = effectValue >= 0 ? '+' : '';
    return { text: `${sign}${effectValue} pop`, positive: effectValue >= 0 };
  }
  return null;
}

export default function EventNotification({ notification, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [notification, onDismiss]);

  const badge = effectBadge(notification.effect, notification.effectValue);

  return (
    <div className={`event-notification event-notification--${notification.severity}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <span className="event-notification__label">
          {notification.severity === 'bad' ? '⚠️ ' : notification.severity === 'good' ? '✅ ' : 'ℹ️ '}
          {notification.label}
        </span>
        {badge && (
          <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: badge.positive ? '#006400' : '#cc0000', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {badge.text}
          </span>
        )}
      </div>
      <span className="event-notification__message">{notification.message}</span>
    </div>
  );
}
