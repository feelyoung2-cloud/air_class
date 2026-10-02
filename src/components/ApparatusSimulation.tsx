import React, { useEffect, useRef } from 'react';
import { ApparatusMode } from '../types/experiment';
import { soundEffects } from '../utils/audio';
import { MIN_TEMP, MAX_TEMP, MIN_PRESSURE, MAX_PRESSURE } from '../utils/physics';
import { Minus, Plus, Thermometer, Gauge, Sparkles } from 'lucide-react';

interface ApparatusSimulationProps {
  mode: ApparatusMode;
  onModeChange: (mode: ApparatusMode) => void;
  temperature: number;
  pressure: number;
  volume: number;
  onTemperatureChange: (temp: number) => void;
  onPressureChange: (press: number) => void;
  disabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const ApparatusSimulation: React.FC<ApparatusSimulationProps> = ({
  mode,
  onModeChange,
  temperature,
  pressure,
  volume,
  onTemperatureChange,
  onPressureChange,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles once
  useEffect(() => {
    const particles: Particle[] = [];
    const count = 24;
    const colors = ['#81ECEC', '#74B9FF', '#A29BFE', '#FFEAA7', '#FAB1A0'];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: 40 + Math.random() * 120,
        y: 40 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 6 + Math.random() * 3,
        color: colors[i % colors.length],
      });
    }
    particlesRef.current = particles;
  }, []);

  // Animate particles based on Temperature & Container Bounds (Volume)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Speed factor: proportional to temperature (higher temp -> faster)
    // T ranges from -30 to 90. speedMultiplier from 0.4 to 3.2
    const speedMultiplier = Math.max(0.3, (temperature + 40) / 45);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Define bounding area based on apparatus mode & current volume
      // volume ranges 10 to 100
      let minX = 30;
      let maxX = canvas.width - 30;
      let minY = 30;
      let maxY = canvas.height - 30;

      if (mode === 'syringe') {
        // In syringe: fixed width, height varies with volume
        minX = 45;
        maxX = canvas.width - 45;
        const totalHeight = canvas.height - 70;
        const volumeFraction = volume / 100;
        minY = canvas.height - 40 - totalHeight * volumeFraction;
        maxY = canvas.height - 40;
      } else {
        // In balloon: spherical/oval bounds
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 10;
        const radius = 25 + (volume / 100) * 55;
        minX = Math.max(10, centerX - radius * 0.85);
        maxX = Math.min(canvas.width - 10, centerX + radius * 0.85);
        minY = Math.max(10, centerY - radius * 0.9);
        maxY = Math.min(canvas.height - 30, centerY + radius * 0.9);
      }

      // Draw each particle
      particlesRef.current.forEach((p) => {
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Bounce horizontally
        if (p.x - p.radius < minX) {
          p.x = minX + p.radius;
          p.vx = Math.abs(p.vx);
        } else if (p.x + p.radius > maxX) {
          p.x = maxX - p.radius;
          p.vx = -Math.abs(p.vx);
        }

        // Bounce vertically
        if (p.y - p.radius < minY) {
          p.y = minY + p.radius;
          p.vy = Math.abs(p.vy);
        } else if (p.y + p.radius > maxY) {
          p.y = maxY - p.radius;
          p.vy = -Math.abs(p.vy);
        }

        // Color shifts warmly with temperature
        let particleColor = p.color;
        if (temperature >= 50) {
          particleColor = '#FF7675';
        } else if (temperature <= -5) {
          particleColor = '#74B9FF';
        }

        // Draw particle body
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = temperature > 40 ? 8 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw cute smiley face on particle
        ctx.fillStyle = '#2D3436';
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.35, p.y - p.radius * 0.15, p.radius * 0.18, 0, Math.PI * 2);
        ctx.arc(p.x + p.radius * 0.35, p.y - p.radius * 0.15, p.radius * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#2D3436';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.radius * 0.1, p.radius * 0.45, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, temperature, volume]);

  // Adjust temperature with sound
  const handleTempAdjust = (delta: number) => {
    soundEffects.playPop();
    const next = Math.max(MIN_TEMP, Math.min(MAX_TEMP, temperature + delta));
    onTemperatureChange(next);
  };

  // Adjust pressure with sound
  const handlePressureAdjust = (delta: number) => {
    soundEffects.playAir();
    const next = Math.max(MIN_PRESSURE, Math.min(MAX_PRESSURE, Math.round((pressure + delta) * 10) / 10));
    onPressureChange(next);
  };

  // Syringe plunger height offset
  // volume is 10 to 100, fraction 0.1 to 1.0
  const plungerHeightPct = Math.max(10, Math.min(100, volume));
  const plungerTopOffset = 220 - (plungerHeightPct / 100) * 170; // in SVG coords

  // Weights count on plunger
  const weightCount = Math.max(1, Math.round(pressure / 0.5));

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-xl border-4 border-amber-200 flex flex-col items-center">
      {/* Top Apparatus Switch Bar */}
      <div className="flex items-center justify-between w-full mb-3 gap-2">
        <div className="flex items-center gap-1.5 bg-amber-100/80 p-1.5 rounded-2xl border border-amber-300">
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onModeChange('syringe');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'syringe'
                ? 'bg-amber-500 text-white shadow-md scale-105'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            <span>💉</span> 주사기 실험실
          </button>
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onModeChange('balloon');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'balloon'
                ? 'bg-rose-500 text-white shadow-md scale-105'
                : 'text-rose-900 hover:bg-rose-200/60'
            }`}
          >
            <span>🎈</span> 풍선 플라스크 실험실
          </button>
        </div>

        {/* Volume Display Badge */}
        <div className="bg-linear-to-r from-emerald-500 to-teal-600 text-white font-fun text-lg md:text-xl px-4 py-1.5 rounded-2xl shadow-md border-2 border-emerald-300 flex items-center gap-2">
          <span>기체 부피:</span>
          <span className="text-2xl md:text-3xl font-black text-amber-200 tracking-wider">
            {volume.toFixed(1)}
          </span>
          <span className="text-sm font-semibold">mL</span>
        </div>
      </div>

      {/* Center Apparatus Stage */}
      <div className="relative w-full max-w-md h-64 md:h-72 bg-linear-to-b from-sky-100/60 via-amber-50/50 to-orange-50/60 rounded-2xl border-2 border-dashed border-amber-300 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
        {/* Background Lab Grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* APPARATUS 1: Syringe (주사기) */}
        {mode === 'syringe' && (
          <div className="relative w-64 h-full flex flex-col items-center justify-end pb-3">
            {/* SVG Syringe Barrel & Plunger */}
            <svg viewBox="0 0 240 260" className="w-full h-full pointer-events-none z-10">
              {/* Syringe Tip at bottom */}
              <rect x="110" y="235" width="20" height="20" rx="3" fill="#A0AEC0" />
              <rect x="115" y="250" width="10" height="10" fill="#718096" />

              {/* Barrel Glass Body */}
              <rect
                x="60"
                y="50"
                width="120"
                height="188"
                rx="6"
                fill="#EDF2F7"
                fillOpacity="0.35"
                stroke="#4A5568"
                strokeWidth="3.5"
              />
              {/* Glass reflection highlight */}
              <line x1="70" y1="55" x2="70" y2="230" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />

              {/* Graduation Scale Marks (10mL to 100mL) */}
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => {
                const yPos = 230 - (val / 100) * 170;
                return (
                  <g key={val}>
                    <line x1="62" y1={yPos} x2={val % 20 === 0 ? "82" : "74"} y2={yPos} stroke="#2D3748" strokeWidth={val % 20 === 0 ? "2.5" : "1.5"} />
                    {val % 20 === 0 && (
                      <text x="86" y={yPos + 4} fontSize="10" fontWeight="bold" fill="#2D3748" fontFamily="sans-serif">
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Piston Plunger Assembly */}
              <g
                className="transition-transform duration-300 ease-out"
                style={{
                  transform: `translateY(${plungerTopOffset - 60}px)`,
                }}
              >
                {/* Plunger Shaft */}
                <rect x="112" y="-120" width="16" height="180" rx="4" fill="#CBD5E0" stroke="#4A5568" strokeWidth="2.5" />
                {/* Plunger Top Handle */}
                <rect x="80" y="-132" width="80" height="14" rx="4" fill="#4A5568" />
                {/* Rubber Stopper inside barrel */}
                <rect x="62" y="55" width="116" height="18" rx="4" fill="#2D3748" stroke="#1A202C" strokeWidth="2" />
                <rect x="65" y="60" width="110" height="6" fill="#4A5568" />

                {/* Pressure Weights (추) on Plunger Handle */}
                {Array.from({ length: Math.min(6, weightCount) }).map((_, idx) => (
                  <g key={idx} transform={`translate(0, ${-145 - idx * 14})`}>
                    <rect x="75" y="0" width="90" height="12" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
                    <circle cx="120" cy="6" r="3" fill="#FDE68A" />
                    <text x="120" y="9" fontSize="8" fontWeight="bold" fill="#78350F" textAnchor="middle">
                      0.5 atm
                    </text>
                  </g>
                ))}

                {/* External Force Arrow */}
                {pressure >= 1.5 && (
                  <g transform="translate(120, -170)">
                    <path d="M 0,-20 L 0,0 M -7,-7 L 0,0 L 7,-7" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
                    <text x="14" y="-7" fontSize="10" fontWeight="black" fill="#EF4444">
                      압력!
                    </text>
                  </g>
                )}
              </g>
            </svg>

            {/* Canvas for bouncy gas particles inside the barrel */}
            <canvas
              ref={canvasRef}
              width={240}
              height={260}
              className="absolute inset-0 w-full h-full pointer-events-none z-5"
            />
          </div>
        )}

        {/* APPARATUS 2: Balloon on Flask in Water Bath (풍선과 플라스크) */}
        {mode === 'balloon' && (
          <div className="relative w-64 h-full flex flex-col items-center justify-end pb-2">
            {/* SVG Balloon and Flask */}
            <svg viewBox="0 0 240 260" className="w-full h-full pointer-events-none z-10">
              {/* Water Bath Basin at bottom */}
              <rect x="40" y="160" width="160" height="90" rx="8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="3" />
              {/* Water liquid color changes with temperature */}
              <rect
                x="43"
                y={temperature > 30 ? "175" : "170"}
                width="154"
                height="77"
                rx="6"
                fill={
                  temperature >= 50
                    ? '#FED7AA'
                    : temperature <= 0
                    ? '#BAE6FD'
                    : '#A7F3D0'
                }
                fillOpacity="0.75"
              />

              {/* Water surface waves */}
              <path
                d="M 43,172 Q 70,168 100,172 T 160,172 T 197,172"
                stroke="#60A5FA"
                strokeWidth="2"
                fill="none"
              />

              {/* Water Bath Labels */}
              <text x="120" y="235" fontSize="11" fontWeight="bold" fill="#1E293B" textAnchor="middle">
                {temperature >= 50
                  ? '♨️ 따뜻한 물'
                  : temperature <= 0
                  ? '🧊 얼음물'
                  : '💧 실온의 물'}
              </text>

              {/* Floating Ice Cubes if Cold */}
              {temperature <= 5 && (
                <g fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5">
                  <rect x="60" y="180" width="16" height="16" rx="2" />
                  <rect x="160" y="185" width="14" height="14" rx="2" />
                  <rect x="100" y="195" width="12" height="12" rx="2" />
                </g>
              )}

              {/* Steam waves if Hot */}
              {temperature >= 45 && (
                <g stroke="#FB923C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8">
                  <path d="M 55,160 Q 60,145 55,130" />
                  <path d="M 185,160 Q 180,145 185,130" />
                </g>
              )}

              {/* Conical Flask */}
              <path
                d="M 108,105 L 108,140 L 75,215 L 165,215 L 132,140 L 132,105 Z"
                fill="#F8FAFC"
                fillOpacity="0.45"
                stroke="#334155"
                strokeWidth="3.5"
              />

              {/* Balloon tied to neck */}
              {/* Balloon size scales according to volume */}
              {(() => {
                const balloonScale = 0.5 + (volume / 100) * 0.95;
                const balloonR = 36 * balloonScale;
                const balloonCx = 120;
                const balloonCy = 85 - balloonR * 0.7;

                const balloonColor =
                  volume > 85 ? '#EF4444' : volume > 70 ? '#F43F5E' : '#FB7185';

                return (
                  <g>
                    {/* Balloon Neck knot */}
                    <polygon points="112,105 128,105 120,96" fill="#E11D48" />

                    {/* Balloon Body */}
                    <ellipse
                      cx={balloonCx}
                      cy={balloonCy}
                      rx={balloonR * 0.95}
                      ry={balloonR * 1.15}
                      fill={balloonColor}
                      fillOpacity="0.85"
                      stroke="#BE123C"
                      strokeWidth="2.5"
                    />
                    {/* Balloon Highlight */}
                    <ellipse
                      cx={balloonCx - balloonR * 0.35}
                      cy={balloonCy - balloonR * 0.45}
                      rx={balloonR * 0.25}
                      ry={balloonR * 0.4}
                      fill="#FFFFFF"
                      fillOpacity="0.5"
                    />

                    {/* Warning if expanding dangerously close to pop */}
                    {volume >= 85 && (
                      <text x="120" y="30" fontSize="12" fontWeight="black" fill="#DC2626" textAnchor="middle">
                        ⚠️ 펑! 터지기 직전!
                      </text>
                    )}
                  </g>
                );
              })()}

              {/* Ambient atmospheric pressure arrows */}
              {pressure >= 1.5 && (
                <g stroke="#3B82F6" strokeWidth="2.5" fill="none">
                  <path d="M 35,60 L 55,75 M 45,75 L 55,75 L 55,65" />
                  <path d="M 205,60 L 185,75 M 195,75 L 185,75 L 185,65" />
                </g>
              )}
            </svg>

            {/* Canvas for bouncy gas particles inside balloon */}
            <canvas
              ref={canvasRef}
              width={240}
              height={260}
              className="absolute inset-0 w-full h-full pointer-events-none z-5"
            />
          </div>
        )}
      </div>

      {/* Control Dials / Sliders / Large Buttons for 4th Graders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* 1. TEMPERATURE CONTROLS */}
        <div className="bg-rose-50/80 rounded-2xl p-4 border-2 border-rose-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-fun text-rose-800 text-base md:text-lg">
              <Thermometer className="w-5 h-5 text-rose-500" />
              <span>온도 조절 (샤를의 법칙)</span>
            </div>
            <div className="bg-rose-500 text-white font-black px-3 py-1 rounded-xl text-lg shadow-xs">
              {temperature > 0 ? `+${temperature}` : temperature} ℃
            </div>
          </div>

          {/* Slider */}
          <div className="relative my-2">
            <input
              type="range"
              min={MIN_TEMP}
              max={MAX_TEMP}
              step={5}
              value={temperature}
              disabled={disabled}
              onChange={(e) => {
                soundEffects.playPop();
                onTemperatureChange(Number(e.target.value));
              }}
              className="w-full h-4 bg-linear-to-r from-blue-300 via-amber-200 to-rose-400 rounded-lg appearance-none cursor-pointer accent-rose-600 disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-rose-600 font-bold mt-1 px-1">
              <span>❄️ -30℃ (얼음)</span>
              <span>🌡️ 20℃ (실온)</span>
              <span>🔥 90℃ (가열)</span>
            </div>
          </div>

          {/* Large +/- Step Buttons for intuitive touching */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              disabled={disabled || temperature <= MIN_TEMP}
              onClick={() => handleTempAdjust(-10)}
              className="flex-1 bg-white hover:bg-blue-50 active:scale-95 text-blue-700 font-bold py-2.5 px-3 rounded-xl border-2 border-blue-300 shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40"
            >
              <Minus className="w-4 h-4" /> 10℃ 냉각
            </button>
            <button
              type="button"
              disabled={disabled || temperature >= MAX_TEMP}
              onClick={() => handleTempAdjust(10)}
              className="flex-1 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> 10℃ 가열
            </button>
          </div>
        </div>

        {/* 2. PRESSURE CONTROLS */}
        <div className="bg-indigo-50/80 rounded-2xl p-4 border-2 border-indigo-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-fun text-indigo-800 text-base md:text-lg">
              <Gauge className="w-5 h-5 text-indigo-500" />
              <span>압력 조절 (보일의 법칙)</span>
            </div>
            <div className="bg-indigo-600 text-white font-black px-3 py-1 rounded-xl text-lg shadow-xs">
              {pressure.toFixed(1)} atm
            </div>
          </div>

          {/* Slider */}
          <div className="relative my-2">
            <input
              type="range"
              min={MIN_PRESSURE}
              max={MAX_PRESSURE}
              step={0.1}
              value={pressure}
              disabled={disabled}
              onChange={(e) => {
                soundEffects.playAir();
                onPressureChange(Number(e.target.value));
              }}
              className="w-full h-4 bg-linear-to-r from-teal-200 via-indigo-200 to-purple-400 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-indigo-600 font-bold mt-1 px-1">
              <span>🎈 0.5 (가벼움)</span>
              <span>⚖️ 1.0 (보통)</span>
              <span>🗜️ 3.0 (꽉 누름)</span>
            </div>
          </div>

          {/* Large +/- Step Buttons */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              disabled={disabled || pressure <= MIN_PRESSURE}
              onClick={() => handlePressureAdjust(-0.5)}
              className="flex-1 bg-white hover:bg-teal-50 active:scale-95 text-teal-700 font-bold py-2.5 px-3 rounded-xl border-2 border-teal-300 shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40"
            >
              <Minus className="w-4 h-4" /> 0.5 atm 빼기
            </button>
            <button
              type="button"
              disabled={disabled || pressure >= MAX_PRESSURE}
              onClick={() => handlePressureAdjust(0.5)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> 0.5 atm 누르기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
