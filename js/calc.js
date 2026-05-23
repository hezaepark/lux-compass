// ── LUX COMPASS · calc.js ─────────────────────────────────────────────────

// ── LEICA PRESETS ──────────────────────────────────────────────────────────

window.LEICA_PRESETS = [
  {
    id: 'q3_28',
    name: 'Leica Q3',
    body: 'Leica Q3',
    lenses: 'Summilux 28mm f/1.7 ASPH (fixed)',
    maxAperture: 'f/1.7',
    focalMin: 28, focalMax: 28,
    maxISO: 50000,
    note: '28mm 고정 렌즈 / 크롭 시 35·47mm 상당',
  },
  {
    id: 'q3_43',
    name: 'Leica Q3 43',
    body: 'Leica Q3 43',
    lenses: 'Summilux 43mm f/2.0 ASPH (fixed)',
    maxAperture: 'f/2.0',
    focalMin: 43, focalMax: 43,
    maxISO: 50000,
    note: '43mm 고정 렌즈',
  },
  {
    id: 'sl3_2490',
    name: 'SL3 + 24-90mm',
    body: 'Leica SL3',
    lenses: 'Vario-Elmarit-SL 24-90mm f/2.8-4',
    maxAperture: 'f/2.8 (광각) / f/4 (망원)',
    focalMin: 24, focalMax: 90,
    maxISO: 100000,
    note: '범용 줌. 24mm f/2.8 ~ 90mm f/4',
  },
  {
    id: 'sl3_90240',
    name: 'SL3 + 90-240mm',
    body: 'Leica SL3',
    lenses: 'Vario-Elmarit-SL 90-240mm f/2.8-4',
    maxAperture: 'f/2.8 (90mm) / f/4 (240mm)',
    focalMin: 90, focalMax: 240,
    maxISO: 100000,
    note: '망원 줌. 스포츠·야생동물·원거리 인물',
  },
  {
    id: 'sl3_21',
    name: 'SL3 + Super-Elmar 21mm',
    body: 'Leica SL3',
    lenses: 'Super-Elmar-SL 21mm f/3.4 ASPH',
    maxAperture: 'f/3.4',
    focalMin: 21, focalMax: 21,
    maxISO: 100000,
    note: '울트라 광각. 풍경·건축·실내',
  },
  {
    id: 'sl3_50',
    name: 'SL3 + APO-Summicron 50mm',
    body: 'Leica SL3',
    lenses: 'APO-Summicron-SL 50mm f/2 ASPH',
    maxAperture: 'f/2.0',
    focalMin: 50, focalMax: 50,
    maxISO: 100000,
    note: '표준 단렌즈. 인물·스트리트·일상',
  },
  {
    id: 'sl3_35',
    name: 'SL3 + Summicron 35mm',
    body: 'Leica SL3',
    lenses: 'Summicron-SL 35mm f/2 ASPH',
    maxAperture: 'f/2.0',
    focalMin: 35, focalMax: 35,
    maxISO: 100000,
    note: '광각 단렌즈. 스트리트·환경인물',
  },
  {
    id: 'sl3_75',
    name: 'SL3 + APO-Summicron 75mm',
    body: 'Leica SL3',
    lenses: 'APO-Summicron-SL 75mm f/2 ASPH',
    maxAperture: 'f/2.0',
    focalMin: 75, focalMax: 75,
    maxISO: 100000,
    note: '인물용 단렌즈. 압축감·보케',
  },
  {
    id: 'custom',
    name: '직접 입력 / Custom',
    body: '',
    lenses: '',
    maxAperture: '',
    focalMin: null, focalMax: null,
    maxISO: 6400,
    note: '',
  },
];

// ── SCENES ─────────────────────────────────────────────────────────────────

window.SCENES = [
  { id: 'beach',        icon: '☀️',  ev: 15 },
  { id: 'sunny_shade',  icon: '🌤️',  ev: 13 },
  { id: 'cloudy',       icon: '⛅',  ev: 11 },
  { id: 'indoor_bright',icon: '🏠',  ev: 9  },
  { id: 'indoor_dim',   icon: '🕯️',  ev: 7  },
  { id: 'golden',       icon: '🌅',  ev: 8  },
  { id: 'dusk',         icon: '🌆',  ev: 6  },
  { id: 'night',        icon: '🌃',  ev: 4  },
  { id: 'darknight',    icon: '🌙',  ev: 2  },
  { id: 'custom',       icon: '✏️',  ev: null },
];

// ── SUBJECTS ───────────────────────────────────────────────────────────────

window.SUBJECTS = [
  { id: 'person_walk',  icon: '🚶', speed: 5   },
  { id: 'person_run',   icon: '🏃', speed: 15  },
  { id: 'bicycle',      icon: '🚲', speed: 25  },
  { id: 'car_city',     icon: '🚗', speed: 50  },
  { id: 'car_highway',  icon: '🛣️', speed: 100 },
  { id: 'static',       icon: '🏔️', speed: 0   },
];

// ── GOALS ──────────────────────────────────────────────────────────────────

window.GOALS = [
  { id: 'freeze', blurPx: 1   },
  { id: 'slight', blurPx: 5   },
  { id: 'motion', blurPx: 30  },
  { id: 'long',   blurPx: 120 },
];

// ── FILTERS ────────────────────────────────────────────────────────────────

window.ND_FILTERS = [
  { label: '없음/None/なし/Brak', stops: 0   },
  { label: 'ND2',    stops: 1   },
  { label: 'ND4',    stops: 2   },
  { label: 'ND8',    stops: 3   },
  { label: 'ND16',   stops: 4   },
  { label: 'ND64',   stops: 6   },
  { label: 'ND100',  stops: 6.6 },
  { label: 'ND400',  stops: 8.6 },
  { label: 'ND1000', stops: 10  },
];

window.ND_FILTER_LABELS = ['없음', 'ND2', 'ND4', 'ND8', 'ND16', 'ND64', 'ND100', 'ND400', 'ND1000'];
window.OWNED_FILTER_OPTIONS = ['ND2','ND4','ND8','ND16','ND64','ND100','ND400','ND1000','CPL'];

// ── STANDARD VALUES ────────────────────────────────────────────────────────

const SHUTTER_SPEEDS = [
  1/8000,1/6400,1/5000,1/4000,1/3200,1/2500,1/2000,1/1600,1/1250,
  1/1000,1/800,1/640,1/500,1/400,1/320,1/250,1/200,1/160,1/125,
  1/100,1/80,1/60,1/50,1/40,1/30,1/25,1/20,1/15,1/13,1/10,1/8,
  1/6,1/5,1/4,0.3,0.4,0.5,0.6,0.8,1,1.3,1.6,2,2.5,3,4,5,6,8,10,13,15,20,25,30
];

const ISO_VALUES = [
  50,64,100,125,160,200,250,320,400,500,640,800,
  1000,1250,1600,2000,3200,6400,12800,25600,51200,102400
];

// ── UTILS ──────────────────────────────────────────────────────────────────

function snapShutter(t) {
  return SHUTTER_SPEEDS.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
}
function snapISO(v, maxISO) {
  const max = maxISO || 12800;
  const clamped = Math.max(50, Math.min(max, v));
  return ISO_VALUES.filter(i => i <= max)
    .reduce((a, b) => Math.abs(b - clamped) < Math.abs(a - clamped) ? b : a);
}

window.fmtShutter = function(s) {
  if (s >= 1) return s % 1 === 0 ? `${s}s` : `${s.toFixed(1)}s`;
  return `1/${Math.round(1/s)}s`;
};

// ── CORE CALCULATION ───────────────────────────────────────────────────────

window.calculate = function({ subjectId, speedKmh, goalId, focalLength,
                               distance, ev, ndStops, cpl, aperture, maxISO }) {
  const goal       = GOALS.find(g => g.id === goalId);
  const CPL_STOPS  = cpl ? 1.5 : 0;
  const totalStops = ndStops + CPL_STOPS;
  const filterMult = Math.pow(2, totalStops);

  // Required shutter without filter
  let shutterBase;
  if (subjectId === 'static' || speedKmh === 0) {
    const map = { freeze: 1/250, slight: 1/60, motion: 1/8, long: 5 };
    shutterBase = map[goalId] || 1/250;
  } else {
    const speedMs  = speedKmh / 3.6;
    const angVel   = speedMs / Math.max(distance, 0.1);
    const fovRad   = 2 * Math.atan(36 / 2 / focalLength);
    const pxPerRad = 9456 / fovRad;
    const pxPerSec = angVel * pxPerRad;
    shutterBase    = goal.blurPx / pxPerSec;
  }

  const shutterWithFilter = shutterBase * filterMult;
  const shutter           = snapShutter(shutterWithFilter);

  // Solve ISO from EV
  const isoRaw = 100 * Math.pow(2, ev - Math.log2(shutter / (aperture * aperture)));
  const iso    = snapISO(isoRaw, maxISO);

  const warnHigh = iso >= (maxISO || 12800) * 0.8 && isoRaw > 800;
  const warnLow  = isoRaw < 50;

  return {
    shutter,
    shutterBase,
    shutterFmt:     window.fmtShutter(shutter),
    shutterBaseFmt: window.fmtShutter(shutterBase),
    iso,
    aperture,
    totalStops,
    expComp: -totalStops,
    warnHigh,
    warnLow,
  };
};
