import React from 'react';
import { StudentRecord } from '../types/experiment';
import { Trophy, Clock, Target, Award, X, Sparkles } from 'lucide-react';

interface LeaderboardModalProps {
  students: StudentRecord[];
  currentStudentId: string;
  onClose: () => void;
  sessionName: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  students,
  currentStudentId,
  onClose,
  sessionName,
}) => {
  // Sorting:
  // 1. completed (true first)
  // 2. maxStage desc
  // 3. attempts asc
  // 4. totalTimeSeconds asc
  const sortedStudents = [...students].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    if (b.maxStage !== a.maxStage) return b.maxStage - a.maxStage;
    if (a.attempts !== b.attempts) return a.attempts - b.attempts;
    return a.totalTimeSeconds - b.totalTimeSeconds;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 p-5 text-amber-950 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-2xl shadow-xs">
              🏆
            </div>
            <div>
              <h2 className="font-fun text-xl md:text-2xl font-black flex items-center gap-1.5">
                <span>기체 탐험대 명예의 전당</span>
                <Sparkles className="w-5 h-5 text-amber-600 fill-amber-500" />
              </h2>
              <p className="text-xs md:text-sm font-semibold text-amber-900">
                학급 방: <span className="font-bold underline">{sessionName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table / List */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-2.5">
          {sortedStudents.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <p className="font-bold">아직 탐험 기록이 없어요!</p>
              <p className="text-sm">가장 먼저 미션을 완료하여 1위에 올라보세요!</p>
            </div>
          ) : (
            sortedStudents.map((st, idx) => {
              const isMe = st.id === currentStudentId;
              const rank = idx + 1;
              const rankIcon =
                rank === 1
                  ? '🥇'
                  : rank === 2
                  ? '🥈'
                  : rank === 3
                  ? '🥉'
                  : `${rank}위`;

              return (
                <div
                  key={st.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                    isMe
                      ? 'bg-amber-100/90 border-amber-400 shadow-md scale-[1.01]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg md:text-xl font-black font-fun">
                      {rankIcon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-fun text-base md:text-lg font-bold text-slate-900">
                          {st.nickname}
                        </span>
                        {isMe && (
                          <span className="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                            나
                          </span>
                        )}
                        {st.completed && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            완주
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        최고 달성: <span className="font-bold text-indigo-600">{st.maxStage}단계</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="text-xs">
                      <div className="flex items-center justify-end gap-1 text-slate-500 font-semibold">
                        <Target className="w-3.5 h-3.5 text-rose-500" />
                        <span>시도: {st.attempts}회</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>시간: {st.totalTimeSeconds}초</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-fun font-bold py-3 px-6 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95"
          >
            확인하고 탐험 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
