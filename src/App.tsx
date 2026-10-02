/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { MISSIONS } from './utils/missions';
import { ApparatusMode, StudentRecord } from './types/experiment';
import {
  calculateVolume,
  getKidExplanation,
  DEFAULT_TEMP,
  DEFAULT_PRESSURE,
} from './utils/physics';
import { soundEffects } from './utils/audio';
import {
  ensureAuth,
  saveStudentProgress,
  listenToSessionStudents,
} from './firebase';
import { ApparatusSimulation } from './components/ApparatusSimulation';
import { GasFairy } from './components/GasFairy';
import { SuccessModal } from './components/SuccessModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentEntryModal } from './components/StudentEntryModal';
import {
  Trophy,
  Clock,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FlaskConical,
  Award,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';

const DEFAULT_SESSION_ID = '4학년4반';

export default function App() {
  // Navigation / View State
  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      window.location.pathname.includes('/admin') ||
      window.location.search.includes('admin=true')
    );
  });

  // Student Identity & Session
  const [sessionId, setSessionId] = useState(DEFAULT_SESSION_ID);
  const [studentId, setStudentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [sessionStudents, setSessionStudents] = useState<StudentRecord[]>([]);

  // Experiment State
  const [currentStageId, setCurrentStageId] = useState(1);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState(1);
  const [temperature, setTemperature] = useState(DEFAULT_TEMP);
  const [pressure, setPressure] = useState(DEFAULT_PRESSURE);
  const [apparatusMode, setApparatusMode] = useState<ApparatusMode>('syringe');
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // Mission Tracking & Timer State
  const [timeLeft, setTimeLeft] = useState(60);
  const [attempts, setAttempts] = useState(1);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [stageElapsed, setStageElapsed] = useState(0);
  const [friendlyAlert, setFriendlyAlert] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calculate dynamic volume
  const volume = calculateVolume(temperature, pressure);
  const explanation = getKidExplanation(temperature, pressure, volume);

  // Active mission
  const currentMission =
    MISSIONS.find((m) => m.id === currentStageId) || MISSIONS[0];

  // Initialize student from localStorage or prompt modal
  useEffect(() => {
    const savedNickname = localStorage.getItem('gas_student_nickname');
    let savedSession = localStorage.getItem('gas_student_session');
    if (!savedSession || savedSession === '4학년1반') {
      savedSession = DEFAULT_SESSION_ID;
      localStorage.setItem('gas_student_session', DEFAULT_SESSION_ID);
    }
    const savedId = localStorage.getItem('gas_student_uid');

    if (savedNickname && savedId) {
      setNickname(savedNickname);
      setSessionId(savedSession);
      setStudentId(savedId);
    } else {
      setIsEntryModalOpen(true);
    }
  }, []);

  // Sync anonymous auth
  useEffect(() => {
    ensureAuth()
      .then((user) => {
        if (!studentId) {
          setStudentId(user.uid);
          localStorage.setItem('gas_student_uid', user.uid);
        }
      })
      .catch((err) => {
        console.warn('Anonymous auth initialization:', err);
      });
  }, [studentId]);

  // Listen to session students in real-time via Firestore onSnapshot
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = listenToSessionStudents(
      sessionId,
      (students) => {
        setSessionStudents(students);
        // Sync my own maxStage if already saved in DB
        if (studentId) {
          const me = students.find((s) => s.id === studentId);
          if (me) {
            setMaxUnlockedStage(Math.max(me.maxStage || 1, maxUnlockedStage));
          }
        }
      },
      () => {
        // Friendly silent handling
      }
    );
    return () => unsubscribe();
  }, [sessionId, studentId, maxUnlockedStage]);

  // When changing stage, reset temperature/pressure to sensible starting state
  useEffect(() => {
    setTemperature(DEFAULT_TEMP);
    setPressure(DEFAULT_PRESSURE);
    setApparatusMode(currentMission.apparatus);
    setTimeLeft(currentMission.timeLimitSeconds);
    setStageElapsed(0);
    setHoldTimer(null);
  }, [currentStageId, currentMission]);

  // Countdown timer effect
  useEffect(() => {
    if (isSuccessModalOpen || isSandboxMode || isEntryModalOpen || isAdminView) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired
          soundEffects.playGentleOops();
          setFriendlyAlert(
            '⏰ 시간이 다 되었어요! 아쉬워하지 말고 다시 한번 도전해 볼까요? 😊'
          );
          setAttempts((a) => a + 1);
          setTemperature(DEFAULT_TEMP);
          setPressure(DEFAULT_PRESSURE);
          return currentMission.timeLimitSeconds;
        }
        if (prev <= 5 && soundEnabled) {
          soundEffects.playTick();
        }
        return prev - 1;
      });
      setStageElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isSuccessModalOpen,
    isSandboxMode,
    isEntryModalOpen,
    isAdminView,
    currentMission,
    soundEnabled,
  ]);

  // Mission condition evaluation & Hold verification
  const targetCheck = currentMission.targetCondition({
    temperature,
    pressure,
    volume,
  });

  const requiredHold = currentMission.holdDurationSeconds || 2;

  useEffect(() => {
    if (isSuccessModalOpen || isSandboxMode || isEntryModalOpen || isAdminView) {
      return;
    }

    let holdInterval: NodeJS.Timeout | null = null;

    if (targetCheck.isSatisfied) {
      if (holdTimer === null) {
        setHoldTimer(requiredHold);
      } else if (holdTimer > 0) {
        holdInterval = setInterval(() => {
          setHoldTimer((h) => {
            if (h === null || h <= 1) {
              // Successfully held condition!
              handleMissionSuccess();
              return 0;
            }
            if (soundEnabled) soundEffects.playTick();
            return h - 1;
          });
        }, 1000);
      }
    } else {
      setHoldTimer(null);
    }

    return () => {
      if (holdInterval) clearInterval(holdInterval);
    };
  }, [
    targetCheck.isSatisfied,
    holdTimer,
    isSuccessModalOpen,
    isSandboxMode,
    isEntryModalOpen,
    isAdminView,
    requiredHold,
    soundEnabled,
  ]);

  // Handle Mission Success
  const handleMissionSuccess = async () => {
    setIsSuccessModalOpen(true);
    const nextMax = Math.max(maxUnlockedStage, currentStageId + 1);
    setMaxUnlockedStage(nextMax);

    // Save student record in Firestore
    if (studentId && nickname) {
      const isFinalComplete = currentStageId >= 5;
      const record: StudentRecord = {
        id: studentId,
        nickname,
        sessionId,
        currentStage: currentStageId,
        maxStage: nextMax,
        completed: isFinalComplete,
        attempts,
        totalTimeSeconds: stageElapsed,
        stageTimes: { [currentStageId]: stageElapsed },
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      try {
        await saveStudentProgress(sessionId, record);
      } catch {
        setFriendlyAlert(
          '앗! 통신이 원활하지 않아 점수를 저장하지 못했어요. 다시 시도해 볼까요? 🎒'
        );
      }
    }
  };

  // Student Entry Confirmation
  const handleStudentEnter = (newNickname: string, newSession: string) => {
    setNickname(newNickname);
    setSessionId(newSession);
    localStorage.setItem('gas_student_nickname', newNickname);
    localStorage.setItem('gas_student_session', newSession);
    setIsEntryModalOpen(false);

    // Register initial record to Firestore
    ensureAuth().then((user) => {
      const uid = user.uid;
      setStudentId(uid);
      localStorage.setItem('gas_student_uid', uid);

      const initialRecord: StudentRecord = {
        id: uid,
        nickname: newNickname,
        sessionId: newSession,
        currentStage: 1,
        maxStage: 1,
        completed: false,
        attempts: 1,
        totalTimeSeconds: 0,
        stageTimes: {},
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      saveStudentProgress(newSession, initialRecord).catch(() => {});
    });
  };

  // Switch to Next Stage
  const handleNextStage = () => {
    setIsSuccessModalOpen(false);
    if (currentStageId < 5) {
      setCurrentStageId(currentStageId + 1);
    }
  };

  // Retry Current Stage
  const handleRetryStage = () => {
    setIsSuccessModalOpen(false);
    setAttempts((a) => a + 1);
    setTemperature(DEFAULT_TEMP);
    setPressure(DEFAULT_PRESSURE);
    setTimeLeft(currentMission.timeLimitSeconds);
    setHoldTimer(null);
  };

  // If in Teacher Dashboard View
  if (isAdminView) {
    return (
      <TeacherDashboard
        currentSessionId={sessionId}
        onSessionChange={(newSession) => setSessionId(newSession)}
        onExitDashboard={() => {
          setIsAdminView(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-100 via-amber-50 to-rose-50 text-slate-800 flex flex-col font-sans selection:bg-amber-200">
      {/* 1. Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-amber-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Student Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-xl shadow-xs border-2 border-amber-200 animate-cute-bounce">
              🫧
            </div>
            <div>
              <h1 className="font-fun text-lg md:text-xl font-black text-amber-950 flex items-center gap-1.5 leading-tight">
                <span>기체 탐험대: 온도와 압력의 비밀</span>
              </h1>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  {sessionId}
                </span>
                <span className="text-indigo-600">탐험가: {nickname || '입장 중...'}</span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
              title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Hall of Fame (Leaderboard) */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setIsLeaderboardOpen(true);
              }}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-fun font-bold px-3 py-2 rounded-xl border border-amber-300 shadow-xs flex items-center gap-1.5 text-xs md:text-sm cursor-pointer transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-900 fill-amber-300" />
              <span>명예의 전당</span>
            </button>

            {/* Switch to Teacher Mode */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setIsAdminView(true);
              }}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl border border-indigo-200 text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>교사 모드</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Stepper (1 to 5) */}
        <div className="bg-amber-100/50 border-t border-amber-200/80 px-4 py-2 overflow-x-auto">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 min-w-[340px]">
            {MISSIONS.map((m) => {
              const isCurrent = m.id === currentStageId && !isSandboxMode;
              const isUnlocked = m.id <= maxUnlockedStage;
              const isCompleted = m.id < maxUnlockedStage;

              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    soundEffects.playPop();
                    setIsSandboxMode(false);
                    setCurrentStageId(m.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-fun text-xs md:text-sm transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-white font-black shadow-md scale-105 border border-amber-400'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      : isUnlocked
                      ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      : 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                  }`}
                >
                  <span>{m.badgeEmoji}</span>
                  <span>{m.id}단계</span>
                  {isCompleted && <span>✓</span>}
                </button>
              );
            })}

            {/* Sandbox Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setIsSandboxMode(!isSandboxMode);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-fun text-xs md:text-sm border transition-all cursor-pointer ${
                isSandboxMode
                  ? 'bg-purple-600 text-white font-black shadow-md scale-105'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>자유 실험실</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-5xl mx-auto p-3 md:p-6 flex-1 flex flex-col gap-4 w-full">
        {/* Friendly Alert Banner if any */}
        {friendlyAlert && (
          <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-sm font-bold shadow-xs">
            <span>{friendlyAlert}</span>
            <button
              type="button"
              onClick={() => setFriendlyAlert(null)}
              className="text-amber-800 hover:text-amber-950 font-black ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mission Goal Card (Hidden in Free Sandbox Mode) */}
        {!isSandboxMode ? (
          <div className="bg-white rounded-3xl p-4 md:p-5 border-4 border-amber-300 shadow-md relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-amber-950 font-fun font-black px-3 py-1 rounded-xl text-sm shadow-xs">
                  미션 {currentMission.id}
                </span>
                <h2 className="font-fun text-xl md:text-2xl font-black text-slate-800">
                  {currentMission.title}
                </h2>
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-1.5 font-fun text-base md:text-lg font-black px-3.5 py-1 rounded-2xl border-2 transition-all ${
                  timeLeft <= 10
                    ? 'bg-rose-100 text-rose-600 border-rose-300 animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>남은 시간: {timeLeft}초</span>
              </div>
            </div>

            <p className="text-sm md:text-base font-bold text-slate-700 mb-2">
              🎯 {currentMission.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200 text-xs md:text-sm">
              <div className="text-amber-900 font-semibold">{currentMission.tip}</div>
              <div className="font-black text-indigo-700 flex items-center gap-1">
                <span>{targetCheck.feedback}</span>
              </div>
            </div>

            {/* Hold Progress Indicator if satisfied */}
            {holdTimer !== null && holdTimer > 0 && (
              <div className="mt-2.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl p-2 text-center animate-pulse">
                <span className="font-fun text-sm md:text-base font-black text-emerald-700">
                  🎉 정답 상태 유지 중! ({holdTimer}초 남음...)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-purple-100/80 rounded-3xl p-4 border-3 border-purple-300 text-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h2 className="font-fun text-lg md:text-xl font-black">자유 가상 실험실</h2>
                <p className="text-xs font-semibold text-purple-700">
                  시간 제한 없이 마음껏 온도와 압력을 조절해 보며 기체의 부피 변화를 관찰하세요!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSandboxMode(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-fun font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs"
            >
              미션으로 돌아가기
            </button>
          </div>
        )}

        {/* 3. Central Apparatus Simulation */}
        <ApparatusSimulation
          mode={apparatusMode}
          onModeChange={setApparatusMode}
          temperature={temperature}
          pressure={pressure}
          volume={volume}
          onTemperatureChange={setTemperature}
          onPressureChange={setPressure}
        />

        {/* 4. Gas Fairy Dialogue Bubble (초등 4학년 눈높이 과학 원리 안내) */}
        <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-4 border-2 border-amber-200 shadow-sm flex items-center justify-between gap-4">
          <GasFairy
            mood={explanation.fairyMood}
            size="md"
            speech={`${explanation.headline} (${explanation.fairySpeech})`}
          />

          {/* Quick Reset Button */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              setTemperature(DEFAULT_TEMP);
              setPressure(DEFAULT_PRESSURE);
            }}
            className="shrink-0 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold p-2.5 rounded-2xl border border-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-all"
            title="실험 상태 초기화"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">원위치</span>
          </button>
        </div>

        {/* 5. Elementary Concept Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-rose-50/90 rounded-2xl p-3.5 border-2 border-rose-200 flex items-start gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-fun text-sm font-black text-rose-900 flex items-center gap-1.5">
                <span>샤를의 법칙 (온도와 부피)</span>
                <span className="text-[11px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded-sm font-bold">
                  온도↑ 부피↑
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed font-medium">
                온도가 올라가면 기체 알갱이들이 에너지를 얻어 쌩쌩 활발하게 움직여요! 알갱이들이 서로 밀어내어 기체의 부피가 늘어납니다.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/90 rounded-2xl p-3.5 border-2 border-indigo-200 flex items-start gap-3">
            <div className="text-2xl">🗜️</div>
            <div>
              <div className="font-fun text-sm font-black text-indigo-900 flex items-center gap-1.5">
                <span>보일의 법칙 (압력과 부피)</span>
                <span className="text-[11px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded-sm font-bold">
                  압력↑ 부피↓
                </span>
              </div>
              <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed font-medium">
                밖에서 누르는 힘(압력)이 커지면 기체 알갱이들이 있을 수 있는 공간이 좁아져요! 반대로 압력이 낮아지면 기체 부피는 팽창합니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* A. Student Nickname Entry Modal */}
      {isEntryModalOpen && (
        <StudentEntryModal
          defaultSessionId={sessionId}
          onEnter={handleStudentEnter}
        />
      )}

      {/* B. Mission Success / Confetti Modal */}
      {isSuccessModalOpen && (
        <SuccessModal
          mission={currentMission}
          elapsedSeconds={stageElapsed}
          attempts={attempts}
          isLastStage={currentStageId >= 5}
          onNextStage={handleNextStage}
          onRetry={handleRetryStage}
          onOpenLeaderboard={() => {
            setIsSuccessModalOpen(false);
            setIsLeaderboardOpen(true);
          }}
        />
      )}

      {/* C. Hall of Fame Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          students={sessionStudents}
          currentStudentId={studentId}
          onClose={() => setIsLeaderboardOpen(false)}
          sessionName={sessionId}
        />
      )}
    </div>
  );
}
