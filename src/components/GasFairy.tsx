import React from 'react';

interface GasFairyProps {
  mood: 'happy' | 'cold' | 'hot' | 'squeezed' | 'normal' | 'celebrate';
  size?: 'sm' | 'md' | 'lg';
  speech?: string;
}

export const GasFairy: React.FC<GasFairyProps> = ({
  mood,
  size = 'md',
  speech,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  // Color theme according to mood
  const getFairyColors = () => {
    switch (mood) {
      case 'hot':
        return {
          body: '#FF7675',
          cheeks: '#FF4757',
          glow: 'rgba(255, 107, 129, 0.4)',
          aura: '🔥',
        };
      case 'cold':
        return {
          body: '#74B9FF',
          cheeks: '#0984E3',
          glow: 'rgba(116, 185, 255, 0.4)',
          aura: '❄️',
        };
      case 'squeezed':
        return {
          body: '#FDCB6E',
          cheeks: '#E17055',
          glow: 'rgba(253, 203, 110, 0.4)',
          aura: '💫',
        };
      case 'celebrate':
        return {
          body: '#A29BFE',
          cheeks: '#FD79A8',
          glow: 'rgba(162, 155, 254, 0.5)',
          aura: '✨',
        };
      default:
        return {
          body: '#81ECEC',
          cheeks: '#00CEC9',
          glow: 'rgba(129, 236, 236, 0.4)',
          aura: '💨',
        };
    }
  };

  const colors = getFairyColors();

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${sizeClasses} transition-all duration-500 ease-out`}
        style={{
          filter: `drop-shadow(0 0 12px ${colors.glow})`,
        }}
      >
        {/* Fairy Character SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-cute-bounce"
        >
          {/* Fairy Wings */}
          <path
            d="M 20,40 C 5,20 5,60 25,55 Z"
            fill="#FFFFFF"
            fillOpacity="0.7"
          />
          <path
            d="M 80,40 C 95,20 95,60 75,55 Z"
            fill="#FFFFFF"
            fillOpacity="0.7"
          />

          {/* Cute Cloud/Bubble Body */}
          <circle cx="50" cy="50" r="32" fill={colors.body} />
          <circle cx="34" cy="46" r="16" fill={colors.body} />
          <circle cx="66" cy="46" r="16" fill={colors.body} />
          <circle cx="50" cy="34" r="18" fill={colors.body} />
          <circle cx="50" cy="62" r="18" fill={colors.body} />

          {/* Eyes */}
          {mood === 'squeezed' ? (
            // Squeezed eyes > <
            <g stroke="#2D3436" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 37,47 L 45,51 L 37,55" />
              <path d="M 63,47 L 55,51 L 63,55" />
            </g>
          ) : mood === 'cold' ? (
            // Cold shivering eyes
            <g fill="#2D3436">
              <ellipse cx="40" cy="50" rx="3.5" ry="3" />
              <ellipse cx="60" cy="50" rx="3.5" ry="3" />
              <circle cx="41" cy="49" r="1" fill="#FFFFFF" />
              <circle cx="61" cy="49" r="1" fill="#FFFFFF" />
            </g>
          ) : mood === 'celebrate' || mood === 'happy' ? (
            // Happy curved smiling eyes ^ ^
            <g stroke="#2D3436" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 36,52 Q 41,45 46,52" />
              <path d="M 54,52 Q 59,45 64,52" />
            </g>
          ) : (
            // Wide curious big eyes
            <g fill="#2D3436">
              <circle cx="41" cy="49" r="4.5" />
              <circle cx="59" cy="49" r="4.5" />
              <circle cx="39.5" cy="47.5" r="1.8" fill="#FFFFFF" />
              <circle cx="57.5" cy="47.5" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <circle cx="33" cy="56" r="5" fill={colors.cheeks} fillOpacity="0.6" />
          <circle cx="67" cy="56" r="5" fill={colors.cheeks} fillOpacity="0.6" />

          {/* Mouth */}
          {mood === 'hot' ? (
            // Panting open mouth
            <ellipse cx="50" cy="58" rx="5" ry="6" fill="#D63031" />
          ) : mood === 'cold' ? (
            // Shivering wavy mouth
            <path
              d="M 44,60 Q 47,58 50,60 T 56,60"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === 'squeezed' ? (
            // Tight wavy mouth
            <path
              d="M 45,61 Q 50,57 55,61"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Cheerful smile
            <path
              d="M 43,57 Q 50,65 57,57"
              stroke="#2D3436"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Little Crown or Floating Particle */}
          <text x="70" y="26" fontSize="16" textAnchor="middle">
            {colors.aura}
          </text>
        </svg>
      </div>

      {speech && (
        <div className="relative bg-white/95 backdrop-blur-xs border-2 border-indigo-200 px-4 py-2.5 rounded-2xl shadow-md max-w-xs md:max-w-md text-sm md:text-base font-medium text-slate-800">
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-indigo-200 border-b-8 border-b-transparent"></div>
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-6 border-r-white border-b-6 border-b-transparent"></div>
          <div className="font-bold text-indigo-600 text-xs mb-0.5">기체 요정 퐁퐁이의 말:</div>
          <div>{speech}</div>
        </div>
      )}
    </div>
  );
};
