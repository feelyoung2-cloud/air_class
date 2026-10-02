import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MissionStage } from '../types/experiment';
import { soundEffects } from '../utils/audio';
import { ArrowRight, Trophy, Sparkles, RefreshCw } from 'lucide-react';

interface SuccessModalProps {
  mission: MissionStage;
  elapsedSeconds: number;
  attempts: number;
  isLastStage: boolean;
  onNextStage: () => void;
  onRetry: () => void;
  onOpenLeaderboard: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  mission,
  elapsedSeconds,
  attempts,
  isLastStage,
  onNextStage,
  onRetry,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    // Play celebratory sound
    soundEffects.playSuccess();

    // Trigger full fireworks confetti
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFEAA7', '#81ECEC', '#74B9FF', '#FF7675', '#A29BFE'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFEAA7', '#81ECEC', '#74B9FF', '#FF7675', '#A29BFE'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [mission.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden animate-cute-bounce">
        {/* Decorative Top Sunburst Glow */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Badge Emoji Avatar */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-tr from-amber-200 via-amber-100 to-yellow-300 border-4 border-amber-400 shadow-lg text-5xl mb-4 animate-pulse-glow">
          {mission.badgeEmoji}
        </div>

        {/* Title */}
        <h2 className="font-fun text-2xl md:text-3xl font-black text-amber-900 mb-1">
          {isLastStage ? '🎉 모든 미션 정복 완료!' : '🌟 미션 성공! 멋져요!'}
        </h2>
        <p className="text-slate-600 font-semibold mb-4 text-sm md:text-base">
          [{mission.badgeName}] 배지를 획득했습니다!
        </p>

        {/* Result Stats Box */}
        <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 mb-6 flex justify-around items-center">
          <div>
            <div className="text-xs text-slate-500 font-bold mb-0.5">걸린 시간</div>
            <div className="text-xl md:text-2xl font-black text-indigo-600">
              {elapsedSeconds} <span className="text-xs">초</span>
            </div>
          </div>
          <div className="w-px h-8 bg-amber-200" />
          <div>
            <div className="text-xs text-slate-500 font-bold mb-0.5">시도 횟수</div>
            <div className="text-xl md:text-2xl font-black text-rose-500">
              {attempts} <span className="text-xs">회</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {!isLastStage ? (
            <button
              type="button"
              onClick={onNextStage}
              className="w-full bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-fun text-lg md:text-xl py-3.5 px-6 rounded-2xl shadow-lg border-2 border-amber-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>다음 단계 도전!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-fun text-lg md:text-xl py-3.5 px-6 rounded-2xl shadow-lg border-2 border-purple-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span>명예의 전당 보러가기!</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl border border-slate-300 text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>다시 해보기</span>
            </button>
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2.5 px-3 rounded-xl border border-amber-300 text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>랭킹 순위표</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
