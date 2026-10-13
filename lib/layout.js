/**
 * 노선도 모양. 역의 좌표(x, y)는 반드시 이 선 위에 있어야 합니다.
 * viewBox는 0 0 1400 440 기준이고, 노선은 수평과 45도 꺾임만 씁니다.
 */
export const VIEWBOX = '0 200 1400 440';

// 선을 그리는 조각들. kind: before(회색, 전과 전) / after(초록, 전과 후)
export const ROUTES = [
  { kind: 'before', points: [[100, 560], [520, 560], [640, 440]] },
  { kind: 'after', points: [[640, 440], [960, 440]] },
  { kind: 'after', dashed: true, points: [[960, 440], [1060, 440], [1160, 340], [1330, 340]] },
];

// 열차가 달리는 전체 경로
export const TRAIN_ROUTE = [[100, 560], [520, 560], [640, 440], [1060, 440], [1160, 340], [1330, 340]];

/** 점 (x, y)가 열차 경로 위에서 시작점으로부터 몇 칸 떨어져 있는지 계산한다. 경로 위에 없으면 null. */
export function distanceAlongRoute(x, y) {
  let total = 0;
  for (let i = 0; i < TRAIN_ROUTE.length - 1; i++) {
    const [x1, y1] = TRAIN_ROUTE[i];
    const [x2, y2] = TRAIN_ROUTE[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const d1 = Math.hypot(x - x1, y - y1);
    const d2 = Math.hypot(x2 - x, y2 - y);
    if (Math.abs(d1 + d2 - len) < 0.5) return total + d1;
    total += len;
  }
  return null;
}

export const toPath = (pts) => 'M' + pts.map((p) => p.join(',')).join(' L');
