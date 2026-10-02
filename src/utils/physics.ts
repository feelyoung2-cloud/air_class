/**
 * Gas physics model based on Boyle's and Charles's laws for 4th Grade Science
 * Boyle's Law: P1 * V1 = P2 * V2  (At constant temp, P increases -> V decreases)
 * Charles's Law: V1 / T1 = V2 / T2  (At constant pressure, T increases -> V increases)
 */

export const MIN_TEMP = -30; // Celsius
export const MAX_TEMP = 90;  // Celsius
export const DEFAULT_TEMP = 20;

export const MIN_PRESSURE = 0.5; // atm
export const MAX_PRESSURE = 3.0; // atm
export const DEFAULT_PRESSURE = 1.0;

export const BASE_VOLUME = 50; // mL at 20°C and 1.0 atm

/**
 * Calculates volume in mL given Temperature (°C) and Pressure (atm)
 */
export function calculateVolume(temperature: number, pressure: number): number {
  const safePressure = Math.max(0.4, pressure);
  const kelvin = temperature + 273.15;
  const standardKelvin = 20 + 273.15; // 293.15 K

  // Ideal Gas Law relative scaling: V = V0 * (T / T0) * (P0 / P)
  const rawVolume = BASE_VOLUME * (kelvin / standardKelvin) * (1.0 / safePressure);
  
  // Clamped nicely between 10 mL and 100 mL for visual clarity
  const clamped = Math.max(10, Math.min(100, rawVolume));
  return Math.round(clamped * 10) / 10;
}

/**
 * Elementary 4th grade explanation helper
 */
export function getKidExplanation(temperature: number, pressure: number, volume: number): {
  headline: string;
  fairyMood: 'happy' | 'cold' | 'hot' | 'squeezed' | 'normal';
  fairySpeech: string;
  lawName: string;
} {
  if (pressure >= 2.0 && temperature <= 25) {
    return {
      headline: '밖에서 꽉 누르면(압력 증가) 기체의 부피가 줄어들어요!',
      fairyMood: 'squeezed',
      fairySpeech: '으쌰! 밖에서 꽉 누르니까 우리 방이 좁아졌어요! (보일의 법칙)',
      lawName: '보일의 법칙',
    };
  }
  if (temperature >= 60 && pressure <= 1.2) {
    return {
      headline: '온도가 올라가면 기체의 부피가 쑥쑥 커져요!',
      fairyMood: 'hot',
      fairySpeech: '앗 뜨거워! 몸이 가벼워지고 신나게 뛰어다녀서 방이 넓어졌어요! (샤를의 법칙)',
      lawName: '샤를의 법칙',
    };
  }
  if (temperature <= -10) {
    return {
      headline: '온도가 차가워지면 기체의 부피가 줄어들어요!',
      fairyMood: 'cold',
      fairySpeech: '덜덜덜~ 너무 추워서 기체 알갱이들이 옹기종기 모였어요! (샤를의 법칙)',
      lawName: '샤를의 법칙',
    };
  }
  if (pressure <= 0.8 && temperature >= 40) {
    return {
      headline: '압력이 낮고 온도가 높으면 부피가 엄청 커져요!',
      fairyMood: 'happy',
      fairySpeech: '와아! 누르는 힘도 약하고 따뜻하니까 풍선이 팡팡 커져요!',
      lawName: '보일 & 샤를의 법칙',
    };
  }
  return {
    headline: '온도와 압력에 따라 기체의 부피가 달라져요!',
    fairyMood: 'normal',
    fairySpeech: '슬라이더를 움직여서 퐁퐁이의 방 크기를 바꿔보세요!',
    lawName: '기체의 성질',
  };
}
