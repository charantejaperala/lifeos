import React from 'react';

interface LifeOSLogoProps {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LifeOSLogo: React.FC<LifeOSLogoProps> = ({
  size = 28,
  showText = true,
  showSubtitle = false,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`lifeos-logo-container ${className}`}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
    >
      <div
        className="logo-icon-wrapper"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
          flexShrink: 0,
        }}
      >
        <svg width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            className="lifeos-logo-text"
            style={{
              fontSize: size >= 32 ? 18 : size >= 26 ? 15 : 13.5,
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '0.5px',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LIFEOS
          </span>
          {showSubtitle && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.2px',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Your Money. Your Wealth. Your Future.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
