import React, { useState, useEffect } from 'react';
import { StudentRecord, CRUDTestResult } from '../types/experiment';
import {
  testFirestoreCRUD,
  listenToSessionStudents,
  resetSessionStudents,
} from '../firebase';
import {
  verifyTeacherPassword,
  hashPassword,
  saveTeacherHash,
  DEFAULT_TEACHER_PASSWORD,
} from '../utils/crypto';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  RefreshCw,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  Database,
  PlayCircle,
  LogOut,
  Sliders,
  Sparkles,
  Search,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentSessionId: string;
  onSessionChange: (sessionId: string) => void;
  onExitDashboard: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentSessionId,
  onSessionChange,
  onExitDashboard,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Live Data State
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [sessionInput, setSessionInput] = useState(currentSessionId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Firestore CRUD Test State
  const [crudTesting, setCrudTesting] = useState(false);
  const [crudResult, setCrudResult] = useState<CRUDTestResult | null>(null);

  // Handle password login with SHA-256 verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!passwordInput.trim()) {
      setAuthError('비밀번호를 입력해주세요.');
      return;
    }
    const isValid = await verifyTeacherPassword(passwordInput);
    if (isValid) {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      setAuthError('비밀번호가 일치하지 않습니다. (초기 비밀번호: science1234)');
    }
  };

  // Change password and store new SHA-256 hash
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.trim().length < 4) {
      alert('비밀번호는 4자리 이상이어야 합니다.');
      return;
    }
    const newHash = await hashPassword(newPasswordInput.trim());
    saveTeacherHash(newHash);
    setPasswordChangeSuccess('비밀번호가 안전하게 변경되었습니다.');
    setNewPasswordInput('');
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordChangeSuccess('');
    }, 1500);
  };

  // Run Real Firestore CRUD Test [Create -> Read -> Update -> Delete]
  const handleRunCRUDTest = async () => {
    setCrudTesting(true);
    setCrudResult(null);
    try {
      const result = await testFirestoreCRUD();
      setCrudResult(result);
    } catch (err) {
      setCrudResult({
        step: 'failed',
        success: false,
        message: 'CRUD 테스트 실패',
        details: err instanceof Error ? err.message : String(err),
        testedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      setCrudTesting(false);
    }
  };

  // Real-time Firestore onSnapshot listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = listenToSessionStudents(
      currentSessionId,
      (liveStudents) => {
        setStudents(liveStudents);
      },
      (error) => {
        console.error('Teacher onSnapshot error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, currentSessionId]);

  // Handle Session Change
  const handleApplySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionInput.trim() && sessionInput.trim() !== currentSessionId) {
      onSessionChange(sessionInput.trim());
    }
  };

  // Handle Reset Students
  const handleResetStudents = async () => {
    if (
      !window.confirm(
        `정말로 '${currentSessionId}' 방의 학생 실험 데이터를 모두 초기화하시겠습니까? (새로운 차시 수업을 시작할 때 유용합니다)`
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const count = await resetSessionStudents(currentSessionId);
      alert(`총 ${count}명의 학생 데이터가 초기화되었습니다.`);
    } catch {
      alert('데이터 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  // 1. Password Verification Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-indigo-50 via-sky-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-indigo-200">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-fun text-2xl font-black text-slate-800 text-center mb-1">
            교사용 관리자 로그인
          </h2>
          <p className="text-xs md:text-sm text-slate-500 text-center mb-6">
            실시간 학급 현황과 Firestore 연결 상태를 모니터링합니다.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                관리자 비밀번호 (SHA-256 암호화 보호)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="비밀번호 입력 (기본: science1234)"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-hidden text-base font-medium shadow-xs"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-indigo-600 mt-1.5 font-semibold">
                💡 초기 기본 비밀번호: <code className="bg-indigo-50 px-1.5 py-0.5 rounded-sm">{DEFAULT_TEACHER_PASSWORD}</code>
              </p>
            </div>

            {authError && (
              <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-fun text-lg py-3 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95"
            >
              대시보드 입장하기
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onExitDashboard}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              ← 학생 실험실 화면으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Class Metrics
  const totalStudents = students.length;
  const completedCount = students.filter((s) => s.completed).length;
  const averageStage =
    totalStudents > 0
      ? (students.reduce((acc, s) => acc + s.currentStage, 0) / totalStudents).toFixed(1)
      : '0.0';
  const averageAttempts =
    totalStudents > 0
      ? (students.reduce((acc, s) => acc + s.attempts, 0) / totalStudents).toFixed(1)
      : '0.0';

  const filteredStudents = students.filter((s) =>
    s.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Full Teacher Dashboard Screen
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-xs">
              🔬
            </div>
            <div>
              <h1 className="font-fun text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>교사용 실시간 가상 실험 모니터링 현황판</span>
                <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  실시간 연동 중 (onSnapshot)
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                초등학교 4학년 1학기 과학: 기체의 성질 (온도와 압력에 따른 부피 변화)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>비밀번호 변경</span>
            </button>
            <button
              type="button"
              onClick={onExitDashboard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>학생 실험실로 이동</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-2 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Password Change Drawer */}
        {isChangingPassword && (
          <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>새 관리자 비밀번호 설정 (SHA-256 안전 해시 저장)</span>
            </h3>
            <form onSubmit={handleChangePassword} className="flex flex-wrap gap-2 items-center">
              <input
                type="password"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="새 비밀번호 입력 (4자리 이상)"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm focus:outline-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs cursor-pointer font-bold"
              >
                취소
              </button>
              {passwordChangeSuccess && (
                <span className="text-xs font-bold text-emerald-600 ml-2">
                  {passwordChangeSuccess}
                </span>
              )}
            </form>
          </div>
        )}

        {/* 1. FIREBASE CONNECTION & CRUD TEST PANEL (Requirement #8) */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border-2 border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h2 className="font-fun text-lg md:text-xl font-black text-slate-900">
                  Firebase Cloud Firestore 연결 및 무결성 테스트
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                실제 Firestore에 [문서 생성 → 읽기 → 수정 → 삭제] 4단계를 연속 실행하여 실시간 데이터베이스 통신을 엄격히 검증합니다.
              </p>
            </div>

            <button
              type="button"
              disabled={crudTesting}
              onClick={handleRunCRUDTest}
              className="bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${crudTesting ? 'animate-spin' : ''}`} />
              <span>{crudTesting ? 'CRUD 테스트 실행 중...' : 'Firebase 연결 테스트 실행'}</span>
            </button>
          </div>

          {/* Test Result Display */}
          <div className="mt-4">
            {crudResult ? (
              <div
                className={`p-4 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                  crudResult.success
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50/90 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {crudResult.success ? (
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="font-fun text-base font-black flex items-center gap-2">
                      <span>{crudResult.message}</span>
                      {crudResult.success && (
                        <span className="bg-emerald-200 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          정상 가동 중
                        </span>
                      )}
                    </div>
                    {crudResult.details && (
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        {crudResult.details}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500 self-end md:self-center">
                  검증 시각: {crudResult.testedAt}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center text-xs text-slate-500">
                위의 [Firebase 연결 테스트 실행] 버튼을 클릭하면 실제 Cloud Firestore의 생성·읽기·수정·삭제 상태를 즉시 진단합니다.
              </div>
            )}
          </div>
        </section>

        {/* 2. CLASSROOM METRICS & ROOM SETTINGS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>현재 접속 학생</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl md:text-3xl font-black font-fun text-indigo-600">
              {totalStudents} <span className="text-sm font-medium text-slate-400">명</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>미션 완주 완료</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl md:text-3xl font-black font-fun text-amber-500">
              {completedCount} <span className="text-sm font-medium text-slate-400">명</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>학급 평균 진도</span>
              <Sparkles className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl md:text-3xl font-black font-fun text-teal-600">
              {averageStage} <span className="text-sm font-medium text-slate-400">/ 5 단계</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>평균 도전 횟수</span>
              <Target className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl md:text-3xl font-black font-fun text-rose-500">
              {averageAttempts} <span className="text-sm font-medium text-slate-400">회</span>
            </div>
          </div>
        </section>

        {/* 3. SESSION / ROOM CONTROLLER & SEARCH */}
        <section className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Room switcher */}
          <form onSubmit={handleApplySession} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600">수업 방 코드:</span>
            <input
              type="text"
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              placeholder="예: 4학년4반"
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold w-36 focus:outline-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
            >
              방 변경
            </button>
            <div className="flex gap-1">
              {['4학년4반', '4학년1반', '4학년2반', '4학년3반', '과학탐험실'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSessionInput(preset);
                    onSessionChange(preset);
                  }}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                    currentSessionId === preset
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>

          {/* Student Search & Reset Action */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="학생 닉네임 검색..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              disabled={isResetting || students.length === 0}
              onClick={handleResetStudents}
              className="bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-300 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>방 데이터 초기화</span>
            </button>
          </div>
        </section>

        {/* 4. LIVE STUDENT PROGRESS MONITOR (Requirement #6) */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-fun text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <span>실시간 학생 미션 진행 현황표</span>
              <span className="text-xs font-semibold text-slate-500">
                ({filteredStudents.length}명 표시 중)
              </span>
            </h3>
            <span className="text-xs text-indigo-600 font-bold">
              ⚡ Firestore onSnapshot 실시간 동기화
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="font-bold">현재 '{currentSessionId}' 방에 접속한 학생이 없습니다.</p>
              <p className="text-xs mt-1">학생들이 입장하면 실시간으로 진행률 바가 업데이트됩니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 rounded-l-xl">순위</th>
                    <th className="py-3 px-4">학생 닉네임</th>
                    <th className="py-3 px-4">진행 단계</th>
                    <th className="py-3 px-4 w-1/3">실시간 진행률 (%)</th>
                    <th className="py-3 px-4">시도 횟수</th>
                    <th className="py-3 px-4">소요 시간</th>
                    <th className="py-3 px-4 rounded-r-xl">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => {
                    const progressPercent = Math.min(100, Math.round((st.currentStage / 5) * 100));

                    return (
                      <tr key={st.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-500 font-fun">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-fun text-base">
                          {st.nickname}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg">
                            {st.completed ? '5단계 (완료)' : `${st.currentStage}단계 진행 중`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-3.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  st.completed
                                    ? 'bg-emerald-500'
                                    : progressPercent >= 60
                                    ? 'bg-indigo-500'
                                    : 'bg-amber-400'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700 w-10 text-right">
                              {progressPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {st.attempts}회
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {st.totalTimeSeconds}초
                        </td>
                        <td className="py-3.5 px-4">
                          {st.completed ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              완주 완료
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              실험 중
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
