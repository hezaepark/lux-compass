// ── DATA ──────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: 'person_walk',  label: '사람 (걷기)',      icon: '🚶', speed: 5 },
  { id: 'person_run',   label: '사람 (달리기)',     icon: '🏃', speed: 15 },
  { id: 'bicycle',      label: '자전거',            icon: '🚲', speed: 25 },
  { id: 'car_city',     label: '자동차 (시내)',      icon: '🚗', speed: 50 },
  { id: 'car_highway',  label: '자동차 (고속)',      icon: '🛣️', speed: 100 },
  { id: 'static',       label: '고정 물체',          icon: '🏔️', speed: 0 },
];

const SCENES = [
  { id: 'beach',    icon: '☀️', label: '맑은 날\n해변·야외', ev: 15 },
  { id: 'cloudy',   icon: '⛅', label: '흐린 날\n야외',      ev: 12 },
  { id: 'indoor',   icon: '🏠', label: '실내\n밝은 창가',    ev: 10 },
  { id: 'golden',   icon: '🌅', label: '황금시간대\n황혼',   ev: 8 },
  { id: 'dusk',     icon: '🌆', label: '땅거미\n도시',       ev: 6 },
  { id: 'night',    icon: '🌃', label: '야간\n조명 있음',    ev: 4 },
  { id: 'darknight',icon: '🌙', label: '야간\n어두움',       ev: 2 },
  { id: 'custom',   icon: '✏️', label: '직접\n입력',         ev: null },
];

const GOALS = [
  { id: 'freeze', label: '완전 정지',    desc: '흔들림 없는 선명한 순간', blurPx: 1 },
  { id: 'slight', label: '미세 흔들림',  desc: '약간의 역동감 유지',      blurPx: 5 },
  { id: 'motion', label: '모션 블러',    desc: '속도감·흐름 표현',        blurPx: 30 },
  { id: 'long',   label: '긴 노출',      desc: '궤적·실크·빛 궤적',       blurPx: 120 },
];

const ND_FILTERS = [
  { label: '없음',    stops: 0 },
  { label: 'ND2',    stops: 1 },
  { label: 'ND4',    stops: 2 },
  { label: 'ND8',    stops: 3 },
  { label: 'ND16',   stops: 4 },
  { label: 'ND64',   stops: 6 },
  { label: 'ND100',  stops: 6.6 },
  { label: 'ND400',  stops: 8.6 },
  { label: 'ND1000', stops: 10 },
];

const SHUTTER_SPEEDS = [
  1/8000,1/6400,1/5000,1/4000,1/3200,1/2500,1/2000,1/1600,1/1250,
  1/1000,1/800,1/640,1/500,1/400,1/320,1/250,1/200,1/160,1/125,
  1/100,1/80,1/60,1/50,1/40,1/30,1/25,1/20,1/15,1/13,1/10,1/8,
  1/6,1/5,1/4,0.3,0.4,0.5,0.6,0.8,1,1.3,1.6,2,2.5,3,4,5,6,8,10,13,15,20,25,30
];

const ISO_VALUES = [50,64,100,125,160,200,250,320,400,500,640,800,1000,
  1250,1600,2000,3200,6400,12800];

// ── UTILS ──────────────────────────────────────────────────────────────────

function snapShutter(t) {
  return SHUTTER_SPEEDS.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
}
function snapISO(v) {
  const clamped = Math.max(50, Math.min(12800, v));
  return ISO_VALUES.reduce((a, b) => Math.abs(b - clamped) < Math.abs(a - clamped) ? b : a);
}
function fmtShutter(s) {
  if (s >= 1) return s % 1 === 0 ? `${s}s` : `${s.toFixed(1)}s`;
  return `1/${Math.round(1/s)}s`;
}

// ── CORE CALC ──────────────────────────────────────────────────────────────

function calculate({ subjectId, speedKmh, goalId, focalLength, distance, ev,
                     ndStops, cpl, aperture }) {
  const goal = GOALS.find(g => g.id === goalId);
  const CPL_STOPS = cpl ? 1.5 : 0;
  const totalStops = ndStops + CPL_STOPS;
  const filterMult = Math.pow(2, totalStops);

  // Required shutter (no filter)
  let shutterBase;
  if (subjectId === 'static' || speedKmh === 0) {
    shutterBase = { freeze: 1/250, slight: 1/60, motion: 1/8, long: 5 }[goalId];
  } else {
    const speedMs = speedKmh / 3.6;
    const angVel  = speedMs / distance;
    const fovRad  = 2 * Math.atan(36 / 2 / focalLength); // SL3 36mm sensor
    const pxPerRad = 9456 / fovRad;
    const pxPerSec = angVel * pxPerRad;
    shutterBase = goal.blurPx / pxPerSec;
  }

  // Apply filter stops → need longer shutter
  const shutterWithFilter = shutterBase * filterMult;
  const shutter = snapShutter(shutterWithFilter);

  // Solve ISO: EV = log2(N²/t) + log2(ISO/100)
  const isoRaw = 100 * Math.pow(2, ev - Math.log2(aperture * aperture / shutter));
  const iso = snapISO(isoRaw);

  const warning = iso > 3200
    ? 'ISO가 높습니다. ND 강도를 줄이거나 조리개를 더 여세요.'
    : isoRaw < 50
    ? 'ISO가 너무 낮습니다. ND 강도를 줄이거나 조리개를 조이세요.'
    : null;

  return {
    shutter,
    shutterBase,
    shutterFmt: fmtShutter(shutter),
    shutterBaseFmt: fmtShutter(shutterBase),
    iso,
    aperture,
    totalStops,
    expComp: -totalStops,
    warning,
  };
}

// ── EXPORTS ────────────────────────────────────────────────────────────────
window.FC = { SUBJECTS, SCENES, GOALS, ND_FILTERS, calculate, fmtShutter };
