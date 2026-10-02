export type ApparatusMode = 'syringe' | 'balloon';

export interface MissionStage {
  id: number;
  title: string;
  subtitle: string;
  badgeName: string;
  badgeEmoji: string;
  description: string;
  tip: string;
  targetExplanation: string;
  timeLimitSeconds: number;
  apparatus: ApparatusMode;
  targetCondition: (state: { temperature: number; pressure: number; volume: number }) => {
    isSatisfied: boolean;
    progressPercentage: number;
    feedback: string;
  };
  holdDurationSeconds?: number; // e.g. hold for 3 seconds
}

export interface StudentRecord {
  id: string;
  nickname: string;
  sessionId: string;
  currentStage: number;
  maxStage: number;
  completed: boolean;
  attempts: number;
  totalTimeSeconds: number;
  stageTimes: Record<number, number>;
  lastActive: string;
  createdAt: string;
}

export interface ClassroomSession {
  id: string;
  name: string;
  createdAt: string;
}

export interface CRUDTestResult {
  step: 'idle' | 'create' | 'read' | 'update' | 'delete' | 'success' | 'failed';
  success: boolean;
  latencyMs?: number;
  message: string;
  details?: string;
  testedAt?: string;
}
