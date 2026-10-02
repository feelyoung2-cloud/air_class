import React, { useState } from 'react';
import { soundEffects } from '../utils/audio';
import { Sparkles, Compass, Dices, Rocket } from 'lucide-react';

interface StudentEntryModalProps {
  onEnter: (nickname: string, sessionId: string) => void;
  defaultSessionId: string;
}

const RANDOM_NICKNAMES = [
  '호기심토끼',
  '기체박사',
  '풍선마법사',
  '번개탐험가',
  '퐁퐁이친구',
  '보글보글요정',
  '우주비행사',
  '꼬마과학자',
  '에너지스타',
  '실험대장',
];

export const StudentEntryModal: React.FC<StudentEntryModalProps> = ({
  onEnter,
  defaultSessionId,
}) => {
  const [nickname, setNickname] = useState('');
  const [sessionId, setSessionId] = useState(defaultSessionId);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRandomNickname = () => {
    soundEffects.playPop();
    const randomPick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const randomNum = Math.floor(Math.random() * 90) + 10;
    setNickname(`${randomPick}${randomNum}`);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setErrorMsg('멋진 닉네임을 입력하거나 주사위를 굴려보세요!');
      return;
    }
    if (trimmed.length > 15) {
      setErrorMsg('닉네임은 15글자 이하로 지어주세요!');
      return;
    }
    soundEffects.playPop();
    onEnter(trimmed, sessionId.trim() || defaultSessionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden">
        {/* Top Decorative Bubbles */}
        <div className="w-20 h-20 bg-linear-to-tr from-sky-200 via-amber-100 to-rose-200 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-md animate-cute-bounce">
          🫧
        </div>

        <h2 className="font-fun text-2xl md:text-3xl font-black text-slate-800 mb-1">
          기체 탐험대에 온 것을 환영해요!
        </h2>
        <p className="text-slate-600 text-sm md:text-base font-medium mb-6">
          온도와 압력을 조절하여 기체의 신비한 비밀을 풀어보세요!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Nickname Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>나만의 닉네임</span>
              </label>
              <button
                type="button"
                onClick={handleRandomNickname}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>랜덤 추천</span>
              </button>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setErrorMsg('');
              }}
              placeholder="예: 씩씩한호랑이, 4학년김과학"
              maxLength={15}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:outline-hidden text-base font-bold shadow-xs bg-amber-50/40"
            />
          </div>

          {/* Session / Class Room */}
          <div>
            <label className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-4 h-4 text-teal-500" />
              <span>학급/모둠 방 코드</span>
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="예: 4학년4반"
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-hidden text-sm font-bold shadow-xs bg-slate-50"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-linear-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-600 text-white font-fun text-xl py-3.5 px-6 rounded-2xl shadow-lg border-2 border-amber-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
          >
            <span>탐험 방 입장하기!</span>
            <Rocket className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 mt-4">
          * 별도의 비밀번호 없이 닉네임만으로 바로 안전하게 참여합니다.
        </p>
      </div>
    </div>
  );
};
