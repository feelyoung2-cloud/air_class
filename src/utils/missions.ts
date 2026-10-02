import { MissionStage } from '../types/experiment';

export const MISSIONS: MissionStage[] = [
  {
    id: 1,
    title: '1단계: 꼬마 압축왕! 🗜️',
    subtitle: '압력을 올려서 기체의 부피 줄이기',
    badgeName: '꼬마 압축왕',
    badgeEmoji: '🗜️',
    apparatus: 'syringe',
    timeLimitSeconds: 60,
    holdDurationSeconds: 2,
    description: '주사기 피스톤을 힘껏 눌러(압력을 높여) 기체의 부피를 25mL 이하로 꽉 줄여보세요!',
    tip: '💡 힌트: 압력 슬라이더나 [+] 버튼을 눌러 압력을 2.0 atm 이상으로 올려보세요!',
    targetExplanation: '목표: 부피 25mL 이하 (현재 상태를 2초간 유지하세요!)',
    targetCondition: ({ volume }) => {
      const isSatisfied = volume <= 25;
      const progressPercentage = Math.min(100, Math.max(0, Math.round(((50 - volume) / (50 - 25)) * 100)));
      const feedback = isSatisfied
        ? '완벽해요! 피스톤이 공기를 꽉 압축했어요!'
        : `현재 부피: ${volume}mL (25mL 이하까지 더 꽉 눌러주세요!)`;
      return { isSatisfied, progressPercentage, feedback };
    },
  },
  {
    id: 2,
    title: '2단계: 따뜻한 쑥쑥이! 🔥',
    subtitle: '온도를 높여서 기체의 부피 키우기',
    badgeName: '열정 팽창왕',
    badgeEmoji: '🔥',
    apparatus: 'balloon',
    timeLimitSeconds: 60,
    holdDurationSeconds: 2,
    description: '따뜻한 열기를 가해 온도를 올려서 기체의 부피를 75mL 이상으로 쑥쑥 키워보세요!',
    tip: '💡 힌트: 온도 슬라이더를 오른쪽으로 올리면 기체 알갱이가 신나게 쌩쌩 움직여요!',
    targetExplanation: '목표: 부피 75mL 이상 (현재 상태를 2초간 유지하세요!)',
    targetCondition: ({ volume }) => {
      const isSatisfied = volume >= 75;
      const progressPercentage = Math.min(100, Math.max(0, Math.round(((volume - 50) / (75 - 50)) * 100)));
      const feedback = isSatisfied
        ? '최고예요! 따뜻해지니 기체 알갱이들이 신나게 방을 넓혔어요!'
        : `현재 부피: ${volume}mL (75mL 이상까지 온도를 더 올려보세요!)`;
      return { isSatisfied, progressPercentage, feedback };
    },
  },
  {
    id: 3,
    title: '3단계: 꽁꽁 얼음 나라! ❄️',
    subtitle: '온도를 낮춰서 기체의 부피 줄이기',
    badgeName: '얼음 탐험가',
    badgeEmoji: '❄️',
    apparatus: 'balloon',
    timeLimitSeconds: 60,
    holdDurationSeconds: 2,
    description: '얼음물에 담가 온도를 영하(-10℃ 이하)로 낮추고, 부피를 35mL 이하로 오그라들게 만드세요!',
    tip: '💡 힌트: 온도를 낮추면 기체 알갱이들의 움직임이 둔해져서 옹기종기 모여요!',
    targetExplanation: '목표: 부피 35mL 이하 (현재 상태를 2초간 유지하세요!)',
    targetCondition: ({ volume }) => {
      const isSatisfied = volume <= 35;
      const progressPercentage = Math.min(100, Math.max(0, Math.round(((50 - volume) / (50 - 35)) * 100)));
      const feedback = isSatisfied
        ? '멋져요! 차가워지니 기체 알갱이들이 얌전해지며 부피가 쪼그라들었어요!'
        : `현재 부피: ${volume}mL (35mL 이하까지 온도를 더 낮춰주세요!)`;
      return { isSatisfied, progressPercentage, feedback };
    },
  },
  {
    id: 4,
    title: '4단계: 찌그러진 탁구공 살리기! 🏓',
    subtitle: '온도와 압력을 조화롭게 맞춰 황금 부피 만들기',
    badgeName: '탁구공 구조대',
    badgeEmoji: '🏓',
    apparatus: 'syringe',
    timeLimitSeconds: 60,
    holdDurationSeconds: 3,
    description: '찌그러진 탁구공을 원상복구 하려면 기체의 부피를 정확히 48mL ~ 54mL 사이로 맞춰 3초간 유지해야 해요!',
    tip: '💡 힌트: 온도가 높다면 압력도 살짝 높여보거나, 표준 온도(20℃)와 압력(1.0 atm) 근처를 노려보세요!',
    targetExplanation: '목표: 부피 48mL ~ 54mL 사이 (3초간 균형 유지!)',
    targetCondition: ({ volume }) => {
      const isSatisfied = volume >= 48 && volume <= 54;
      const diff = Math.min(Math.abs(volume - 48), Math.abs(volume - 54));
      const progressPercentage = isSatisfied ? 100 : Math.max(0, Math.round(100 - diff * 4));
      const feedback = isSatisfied
        ? '정답 영역에 들어왔어요! 3초 동안 흔들리지 않게 유지하세요!'
        : volume < 48
          ? `현재 부피: ${volume}mL (조금 작아요! 온도를 올리거나 압력을 낮추세요)`
          : `현재 부피: ${volume}mL (조금 커요! 온도를 낮추거나 압력을 올리세요)`;
      return { isSatisfied, progressPercentage, feedback };
    },
  },
  {
    id: 5,
    title: '5단계: 마스터 챌린지 - 풍선 팡팡 위기탈출! 👑',
    subtitle: '풍선이 터지지 않게 황금 안전 영역 맞추기',
    badgeName: '기체 과학 마스터',
    badgeEmoji: '👑',
    apparatus: 'balloon',
    timeLimitSeconds: 60,
    holdDurationSeconds: 3,
    description: '풍선이 88mL를 넘으면 펑! 터져요! 압력을 낮추고(0.8 atm 이하) 온도를 조절해 70mL ~ 80mL 사이 황금 안전 구역을 3초간 유지하세요!',
    tip: '💡 힌트: 압력을 먼저 0.7~0.8 atm으로 낮추고, 온도를 10℃~25℃ 정도로 천천히 맞춰보세요!',
    targetExplanation: '목표: 압력 0.8 atm 이하 & 부피 70mL ~ 80mL (3초간 안전 유지!)',
    targetCondition: ({ pressure, volume }) => {
      const isPressureOk = pressure <= 0.8;
      const isVolumeOk = volume >= 70 && volume <= 80;
      const isSatisfied = isPressureOk && isVolumeOk;
      
      let feedback = '';
      if (!isPressureOk) {
        feedback = `압력이 너무 높아요! 압력을 0.8 atm 이하로 낮춰주세요 (현재: ${pressure} atm)`;
      } else if (volume < 70) {
        feedback = `부피가 조금 부족해요! 온도를 살짝 올려보세요 (현재: ${volume}mL)`;
      } else if (volume > 80) {
        feedback = `앗! 풍선이 터지기 직전이에요! 온도를 낮춰주세요 (현재: ${volume}mL)`;
      } else {
        feedback = '환상적이에요! 황금 안전 구역입니다! 3초간 유지하세요!';
      }

      const progressPercentage = isSatisfied ? 100 : (isPressureOk ? 50 : 20);
      return { isSatisfied, progressPercentage, feedback };
    },
  },
];
