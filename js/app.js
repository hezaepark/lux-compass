// ── LUX COMPASS · app.js ──────────────────────────────────────────────────

const DEFAULT_STATE = {
  lang: 'ko',
  scene: 'beach',
  customEV: 13,
  subjectId: 'person_walk',
  speedKmh: 5,
  goalId: 'freeze',
  focalLength: 50,
  distance: 5,
  aperture: 8,
  nd: 'ND8',
  cpl: false,
  feedbackOpen: false,
};

const DEFAULT_PROFILE = {
  presetId: 'sl3_2490',
  body: 'Leica SL3',
  lenses: 'Vario-Elmarit-SL 24-90mm f/2.8-4',
  maxAperture: 'f/2.8',
  bodyMaxISO: 100000,
  ownedFilters: ['ND8', 'ND64', 'ND1000', 'CPL'],
  // 사용자 촬영 기준 레인지
  isoMin: 50,
  isoMax: 3200,
  shutterMin: 1/8000,
  shutterMax: 30,
  apertureMin: 2.8,
  apertureMax: 22,
};

let state   = { ...DEFAULT_STATE };
let profile = { ...DEFAULT_PROFILE };

// ── STORAGE ────────────────────────────────────────────────────────────────

function load() {
  try {
    const s = localStorage.getItem('lc_state');
    const p = localStorage.getItem('lc_profile');
    if (s) state   = { ...DEFAULT_STATE,   ...JSON.parse(s) };
    if (p) profile = { ...DEFAULT_PROFILE, ...JSON.parse(p) };
  } catch(e) {}
}
const saveState   = () => localStorage.setItem('lc_state',   JSON.stringify(state));
const saveProfile = () => localStorage.setItem('lc_profile', JSON.stringify(profile));

// ── HELPERS ────────────────────────────────────────────────────────────────

const q  = sel => document.querySelector(sel);
const qq = sel => [...document.querySelectorAll(sel)];
const t  = () => window.I18N[state.lang];

function getEV() {
  if (state.scene === 'custom') return state.customEV;
  return SCENES.find(s => s.id === state.scene)?.ev ?? 13;
}
function getNDStops() {
  return ND_FILTERS.find(f => f.label.startsWith(state.nd))?.stops
      ?? ND_FILTERS.find(f => f.label === state.nd)?.stops ?? 0;
}

// ── LANGUAGE ───────────────────────────────────────────────────────────────

function applyLang() {
  const tx = t();
  document.documentElement.lang = state.lang;

  q('#app-tagline').textContent       = tx.tagline;
  q('#app-subtitle').textContent      = tx.subtitle;
  q('#gear-btn-label').textContent    = tx.gearBtn;
  q('#lbl-scene').textContent         = tx.sections.scene;
  q('#lbl-subject').textContent       = tx.sections.subject;
  q('#lbl-goal').textContent          = tx.sections.goal;
  q('#lbl-lens').textContent          = tx.sections.lens;
  q('#lbl-filter').textContent        = tx.sections.filter;
  q('#lbl-results').textContent       = tx.sections.results;
  q('#lbl-feedback').textContent      = tx.sections.feedback;
  q('#lbl-feedback-sub').textContent  = tx.sections.feedbackSub;
  q('#cpl-label').textContent         = tx.cpl;
  q('#lbl-res-shutter').textContent   = tx.results.shutter;
  q('#lbl-res-iso').textContent       = tx.results.iso;
  q('#lbl-res-aperture').textContent  = tx.results.aperture;
  q('#lbl-res-base').textContent      = tx.results.baseShutter;
  q('#lbl-res-stops').textContent     = tx.results.filterStops;
  q('#lbl-res-comp').textContent      = tx.results.expComp;
  q('#res-note').innerHTML            = tx.results.note.map(n => `· ${n}`).join('<br>');
  q('#feedback-text').placeholder     = tx.feedback.placeholder;
  q('#feedback-send-btn').textContent = tx.feedback.send;
  q('#reset-btn').textContent         = tx.reset;

  q('#lbl-focal').textContent         = tx.sliders.focalLength;
  q('#lbl-distance').textContent      = tx.sliders.distance;
  q('#lbl-aperture').textContent      = tx.sliders.aperture;
  q('#lbl-speed').textContent         = tx.sliders.speed;
  q('#lbl-customev').textContent      = tx.sliders.customEV;

  q('#modal-title').textContent       = tx.profile.title;
  q('#modal-close').textContent       = tx.profile.close;
  q('#save-profile-btn').textContent  = tx.profile.save;
  q('#lbl-preset').textContent        = tx.profile.presetLabel;
  q('#lbl-custom-entry').textContent  = tx.profile.customLabel;
  q('#lbl-prof-body').textContent     = tx.profile.body;
  q('#lbl-prof-lenses').textContent   = tx.profile.lenses;
  q('#lbl-prof-maxap').textContent    = tx.profile.maxAperture;
  q('#lbl-prof-maxiso').textContent   = tx.profile.maxISO;
  q('#lbl-prof-filters').textContent  = tx.profile.ownedFilters;
  q('#prof-body').placeholder         = tx.profile.bodyPlaceholder;
  q('#prof-lenses').placeholder       = tx.profile.lensesPlaceholder;
  q('#prof-maxap').placeholder        = tx.profile.maxApPlaceholder;
  q('#prof-maxiso').placeholder       = tx.profile.maxISOPlaceholder;
  q('#install-text').textContent      = tx.install.text;
  q('#install-btn').textContent       = tx.install.add;

  // 레인지 라벨
  q('#lbl-range-iso').textContent     = tx.profile.rangeISO;
  q('#lbl-range-shutter').textContent = tx.profile.rangeShutter;
  q('#lbl-range-aperture').textContent= tx.profile.rangeAperture;

  qq('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === state.lang);
  });
}

// ── RENDER ─────────────────────────────────────────────────────────────────

function renderAll() {
  applyLang();
  renderScenes();
  renderSubjects();
  renderGoals();
  renderFilters();
  renderSliders();
  renderResults();
  renderFeedbackToggle();
  renderGearBtn();
}

function renderScenes() {
  const tx = t();
  const wrap = q('#scene-grid');
  wrap.innerHTML = SCENES.map(s => {
    const labels = tx.scenes[s.id] || [s.id, ''];
    return `
      <button class="scene-btn ${state.scene === s.id ? 'active' : ''}" data-scene="${s.id}">
        <span class="s-icon">${s.icon}</span>
        <span class="s-label">${labels[0]}<br><span class="s-sub">${labels[1]}</span></span>
        ${s.ev !== null ? `<span class="s-ev">EV ${s.ev}</span>` : ''}
      </button>`;
  }).join('');
  q('#custom-ev-row').style.display = state.scene === 'custom' ? 'block' : 'none';
  wrap.querySelectorAll('.scene-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.scene = btn.dataset.scene;
      saveState(); renderScenes(); renderResults();
    });
  });
}

function renderSubjects() {
  const tx = t();
  const wrap = q('#subject-pills');
  wrap.innerHTML = SUBJECTS.map(s => `
    <button class="pill ${state.subjectId === s.id ? 'active' : ''}" data-id="${s.id}">
      ${s.icon} ${tx.subjects[s.id] || s.id}
    </button>`).join('');
  const isStatic = state.subjectId === 'static';
  q('#speed-row').style.display    = isStatic ? 'none' : 'block';
  q('#distance-row').style.display = isStatic ? 'none' : 'block';
  wrap.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.subjectId = btn.dataset.id;
      const sub = SUBJECTS.find(s => s.id === state.subjectId);
      state.speedKmh = sub.speed;
      saveState(); renderSubjects(); renderSliders(); renderResults();
    });
  });
}

function renderGoals() {
  const tx = t();
  const wrap = q('#goal-list');
  wrap.innerHTML = GOALS.map(g => {
    const info = tx.goals[g.id];
    return `
      <button class="goal-row ${state.goalId === g.id ? 'active' : ''}" data-id="${g.id}">
        <div>
          <div class="goal-name">${info.label}</div>
          <div class="goal-desc">${info.desc}</div>
        </div>
        <div class="goal-dot"></div>
      </button>`;
  }).join('');
  wrap.querySelectorAll('.goal-row').forEach(btn => {
    btn.addEventListener('click', () => {
      state.goalId = btn.dataset.id;
      saveState(); renderGoals(); renderResults();
    });
  });
}

function renderFilters() {
  const wrap = q('#nd-buttons');
  wrap.innerHTML = ND_FILTER_LABELS.map(label => `
    <button class="filter-btn ${state.nd === label ? 'active' : ''}" data-nd="${label}">
      ${label === 'ND8' ? label + ' ★' : label}
    </button>`).join('');
  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.nd = btn.dataset.nd;
      saveState(); renderFilters(); renderResults();
    });
  });
  const cplT = q('#cpl-toggle');
  cplT.className = 'toggle' + (state.cpl ? ' on' : '');
}

function renderSliders() {
  setSlider('focal-slider',    'focal-val',    state.focalLength, v => `${v}mm`);
  setSlider('aperture-slider', 'aperture-val', state.aperture,    v => `f/${v.toFixed(1)}`);
  setSlider('speed-slider',    'speed-val',    state.speedKmh,    v => `${v} km/h`);
  setSlider('distance-slider', 'distance-val', state.distance,    v => `${v}m`);
  setSlider('custom-ev-slider','custom-ev-val',state.customEV,    v => `EV ${v}`);
}

function setSlider(sid, vid, val, fmt) {
  const s = q('#' + sid), v = q('#' + vid);
  if (!s || !v) return;
  s.value = val;
  v.textContent = fmt(val);
}

function renderResults() {
  const tx = t();
  const res = calculate({
    subjectId:   state.subjectId,
    speedKmh:    state.speedKmh,
    goalId:      state.goalId,
    focalLength: state.focalLength,
    distance:    state.distance,
    ev:          getEV(),
    ndStops:     getNDStops(),
    cpl:         state.cpl,
    aperture:    state.aperture,
    isoMin:      profile.isoMin,
    isoMax:      profile.isoMax,
    shutterMin:  profile.shutterMin,
    shutterMax:  profile.shutterMax,
  });

  q('#res-shutter').textContent  = res.shutterFmt;
  q('#res-iso').textContent      = res.iso.toLocaleString();
  q('#res-aperture').textContent = `f/${res.aperture.toFixed(1)}`;
  q('#res-base').textContent     = res.shutterBaseFmt;
  q('#res-stops').textContent    = res.totalStops > 0
    ? `-${res.totalStops.toFixed(1)} stop` : '—';
  q('#res-comp').textContent     = res.expComp === 0
    ? '±0' : `${res.expComp > 0 ? '+' : ''}${res.expComp.toFixed(1)}`;

  const warn = q('#res-warning');
  if (res.isoOverMax) {
    warn.textContent = '⚠ ' + tx.warnings.isoOverMax
      .replace('{max}', profile.isoMax.toLocaleString());
    warn.style.display = 'block';
  } else if (res.isoUnderMin) {
    warn.textContent = '⚠ ' + tx.warnings.isoUnderMin;
    warn.style.display = 'block';
  } else if (res.shutterOutOfRange) {
    warn.textContent = '⚠ ' + tx.warnings.shutterOutOfRange;
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }
}

function renderFeedbackToggle() {
  q('#feedback-body').className = 'feedback-body' + (state.feedbackOpen ? ' open' : '');
  q('#feedback-arrow').textContent = state.feedbackOpen ? '▲' : '▼';
}

function renderGearBtn() {
  const has = profile.body || profile.lenses;
  q('#gear-dot').style.display = has ? 'block' : 'none';
  q('#gear-profile-name').textContent = has
    ? (profile.body || '').split(' ').slice(-1)[0] : '';
}

// ── PROFILE MODAL ──────────────────────────────────────────────────────────

function openModal() {
  q('#modal').className = 'modal-overlay open';
  renderModal();
}
function closeModal() {
  q('#modal').className = 'modal-overlay';
}

// ISO 표준값 목록
const ISO_STEPS = [50,100,200,400,800,1600,3200,6400,12800,25600,51200,102400];
const SHUTTER_STEPS = [
  {label:'1/8000', val:1/8000},{label:'1/4000', val:1/4000},{label:'1/2000', val:1/2000},
  {label:'1/1000', val:1/1000},{label:'1/500',  val:1/500 },{label:'1/250',  val:1/250 },
  {label:'1/125',  val:1/125 },{label:'1/60',   val:1/60  },{label:'1/30',   val:1/30  },
  {label:'1/15',   val:1/15  },{label:'1/8',    val:1/8   },{label:'1/4',    val:1/4   },
  {label:'0.5s',   val:0.5   },{label:'1s',     val:1     },{label:'2s',     val:2     },
  {label:'5s',     val:5     },{label:'10s',    val:10    },{label:'30s',    val:30    },
];
const APERTURE_STEPS = [1.0,1.2,1.4,1.7,2.0,2.8,4.0,5.6,8.0,11,16,22];

function renderModal() {
  // Preset buttons
  const pw = q('#preset-list');
  pw.innerHTML = LEICA_PRESETS.map(p => `
    <button class="preset-btn ${profile.presetId === p.id ? 'active' : ''}" data-preset="${p.id}">
      <span class="preset-name">${p.name}</span>
      ${p.note ? `<span class="preset-note">${state.lang === 'ko' ? p.note : p.lenses}</span>` : ''}
    </button>`).join('');
  pw.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = LEICA_PRESETS.find(p => p.id === btn.dataset.preset);
      profile.presetId   = preset.id;
      if (preset.id !== 'custom') {
        profile.body        = preset.body;
        profile.lenses      = preset.lenses;
        profile.maxAperture = preset.maxAperture;
        profile.bodyMaxISO  = preset.bodyMaxISO;
        profile.apertureMin = preset.apertureMin;
        profile.apertureMax = preset.apertureMax;
        profile.shutterMin  = preset.shutterMin;
        profile.shutterMax  = preset.shutterMax;
        // 사용자 레인지도 장비 스펙 안으로
        profile.isoMax      = Math.min(profile.isoMax || 3200, preset.bodyMaxISO);
      }
      renderModal();
    });
  });

  // Preset summary / custom fields
  const isCustom = profile.presetId === 'custom';
  q('#custom-fields').style.display   = isCustom ? 'block' : 'none';
  q('#preset-summary').style.display  = isCustom ? 'none'  : 'block';

  if (!isCustom) {
    const preset = LEICA_PRESETS.find(p => p.id === profile.presetId);
    q('#preset-summary').innerHTML = `
      <div class="summary-row"><span>Body</span>${preset.body}</div>
      <div class="summary-row"><span>Lens</span>${preset.lenses}</div>
      <div class="summary-row"><span>Aperture</span>${preset.maxAperture}</div>
      <div class="summary-row"><span>Max ISO</span>${preset.bodyMaxISO.toLocaleString()}</div>
    `;
  }

  q('#prof-body').value   = profile.body || '';
  q('#prof-lenses').value = profile.lenses || '';
  q('#prof-maxap').value  = profile.maxAperture || '';
  q('#prof-maxiso').value = profile.bodyMaxISO || 6400;

  // ── 사용자 레인지 렌더 ──────────────────────────────────────────────────

  // ISO 레인지
  renderRangePills('iso-min-pills', ISO_STEPS, profile.isoMin,
    v => { profile.isoMin = v; renderRangePills('iso-min-pills', ISO_STEPS, v,
      vv => { profile.isoMin = vv; }); renderResults(); });
  renderRangePills('iso-max-pills', ISO_STEPS, profile.isoMax,
    v => { profile.isoMax = v; renderRangePills('iso-max-pills', ISO_STEPS, v,
      vv => { profile.isoMax = vv; }); renderResults(); });

  // 셔터 레인지
  renderRangePillsShutter('shutter-min-pills', profile.shutterMin,
    v => { profile.shutterMin = v; renderResults(); });
  renderRangePillsShutter('shutter-max-pills', profile.shutterMax,
    v => { profile.shutterMax = v; renderResults(); });

  // 조리개 레인지
  renderRangePillsAperture('aperture-min-pills', profile.apertureMin,
    v => { profile.apertureMin = v; renderResults(); });
  renderRangePillsAperture('aperture-max-pills', profile.apertureMax,
    v => { profile.apertureMax = v; renderResults(); });

  // Filter checklist
  const fw = q('#filter-checklist');
  fw.innerHTML = OWNED_FILTER_OPTIONS.map(f => `
    <button class="filter-check ${profile.ownedFilters.includes(f) ? 'on' : ''}" data-f="${f}">${f}</button>
  `).join('');
  fw.querySelectorAll('.filter-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.f;
      if (profile.ownedFilters.includes(f)) {
        profile.ownedFilters = profile.ownedFilters.filter(x => x !== f);
      } else {
        profile.ownedFilters.push(f);
      }
      btn.className = 'filter-check' + (profile.ownedFilters.includes(f) ? ' on' : '');
    });
  });
}

function renderRangePills(containerId, steps, currentVal, onChange) {
  const wrap = q('#' + containerId);
  if (!wrap) return;
  wrap.innerHTML = steps.map(v => `
    <button class="range-pill ${currentVal === v ? 'active' : ''}" data-val="${v}">
      ${v.toLocaleString()}
    </button>`).join('');
  wrap.querySelectorAll('.range-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      onChange(parseInt(btn.dataset.val));
      wrap.querySelectorAll('.range-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function renderRangePillsShutter(containerId, currentVal, onChange) {
  const wrap = q('#' + containerId);
  if (!wrap) return;
  wrap.innerHTML = SHUTTER_STEPS.map(s => `
    <button class="range-pill ${Math.abs(currentVal - s.val) < 0.0001 ? 'active' : ''}" data-val="${s.val}">
      ${s.label}
    </button>`).join('');
  wrap.querySelectorAll('.range-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      onChange(parseFloat(btn.dataset.val));
      wrap.querySelectorAll('.range-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function renderRangePillsAperture(containerId, currentVal, onChange) {
  const wrap = q('#' + containerId);
  if (!wrap) return;
  wrap.innerHTML = APERTURE_STEPS.map(v => `
    <button class="range-pill ${Math.abs(currentVal - v) < 0.01 ? 'active' : ''}" data-val="${v}">
      f/${v}
    </button>`).join('');
  wrap.querySelectorAll('.range-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      onChange(parseFloat(btn.dataset.val));
      wrap.querySelectorAll('.range-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function saveProfileFromModal() {
  const isCustom = profile.presetId === 'custom';
  if (isCustom) {
    profile.body        = q('#prof-body').value.trim();
    profile.lenses      = q('#prof-lenses').value.trim();
    profile.maxAperture = q('#prof-maxap').value.trim();
    profile.bodyMaxISO  = parseInt(q('#prof-maxiso').value) || 6400;
  }
  saveProfile(); closeModal(); renderAll();
}

// ── FEEDBACK ───────────────────────────────────────────────────────────────

async function sendFeedback() {
  const text = q('#feedback-text').value.trim();
  if (!text) return;
  const tx = t();
  const btn = q('#feedback-send-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>${tx.feedback.sending}`;

  const resultEl = q('#feedback-result');
  resultEl.className = 'feedback-result';

  const res = calculate({
    subjectId:   state.subjectId,
    speedKmh:    state.speedKmh,
    goalId:      state.goalId,
    focalLength: state.focalLength,
    distance:    state.distance,
    ev:          getEV(),
    ndStops:     getNDStops(),
    cpl:         state.cpl,
    aperture:    state.aperture,
    isoMin:      profile.isoMin,
    isoMax:      profile.isoMax,
    shutterMin:  profile.shutterMin,
    shutterMax:  profile.shutterMax,
  });

  const subjectTx = t().subjects[state.subjectId];
  const goalTx    = t().goals[state.goalId].label;
  const sceneTx   = (t().scenes[state.scene] || [state.scene])[0];

  const ctx = `
Current settings:
- Scene: ${sceneTx} (EV ${getEV()})
- Subject: ${subjectTx} (${state.speedKmh} km/h)
- Goal: ${goalTx}
- Result: Shutter ${res.shutterFmt} / ISO ${res.iso} / f/${res.aperture.toFixed(1)}
- Filters: ND ${state.nd}${state.cpl ? ' + CPL' : ''} (${res.totalStops.toFixed(1)} stop total)
- Focal: ${state.focalLength}mm / Distance: ${state.distance}m
- User ISO range: ${profile.isoMin} ~ ${profile.isoMax}
- User shutter range: ${window.fmtShutter(profile.shutterMin)} ~ ${window.fmtShutter(profile.shutterMax)}
${profile.body    ? `- Body: ${profile.body}` : ''}
${profile.lenses  ? `- Lens: ${profile.lenses}` : ''}
${profile.ownedFilters?.length ? `- Owned filters: ${profile.ownedFilters.join(', ')}` : ''}

User feedback: "${text}"
Response language: ${state.lang === 'ko' ? 'Korean' : state.lang === 'ja' ? 'Japanese' : state.lang === 'pl' ? 'Polish' : 'English'}
`.trim();

  const sys = `You are an expert photography assistant. The user shot a photo using the settings above and gives feedback.
Suggest specific corrected settings. Respect the user's ISO and shutter range limits strictly.
Reply concisely in plain text (no markdown). Format: cause (1-2 lines) → corrected values (specific numbers) → one tip.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: sys,
        messages: [{ role: 'user', content: ctx }],
      }),
    });
    const data = await resp.json();
    const answer = data.content?.map(c => c.text || '').join('') || tx.feedback.error;
    resultEl.innerHTML = `<div class="fb-label">${tx.feedback.resultLabel}</div>${answer}`;
    resultEl.className = 'feedback-result visible';
  } catch(e) {
    resultEl.innerHTML = `<div class="fb-label">Error</div>${tx.feedback.error}`;
    resultEl.className = 'feedback-result visible';
  }

  btn.disabled = false;
  btn.textContent = tx.feedback.send;
}

// ── SLIDER EVENTS ──────────────────────────────────────────────────────────

function bindSliders() {
  const bindings = [
    ['focal-slider',    'focal-val',    v => `${v}mm`,            v => { state.focalLength = v; }],
    ['aperture-slider', 'aperture-val', v => `f/${v.toFixed(1)}`, v => { state.aperture = v; }],
    ['speed-slider',    'speed-val',    v => `${v} km/h`,         v => { state.speedKmh = v; }],
    ['distance-slider', 'distance-val', v => `${v}m`,             v => { state.distance = v; }],
    ['custom-ev-slider','custom-ev-val',v => `EV ${v}`,           v => { state.customEV = v; }],
  ];
  bindings.forEach(([sid, vid, fmt, setter]) => {
    const s = q('#' + sid);
    if (!s) return;
    s.addEventListener('input', () => {
      const v = parseFloat(s.value);
      q('#' + vid).textContent = fmt(v);
      setter(v);
      saveState();
      renderResults();
    });
  });
}

// ── RESET ──────────────────────────────────────────────────────────────────

function resetState() {
  if (!confirm(t().resetConfirm)) return;
  state = { ...DEFAULT_STATE, lang: state.lang };
  saveState();
  renderAll();
}

// ── PWA INSTALL ────────────────────────────────────────────────────────────

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('lc_install_dismissed')) {
    q('#install-banner').classList.add('show');
  }
});

// ── INIT ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  load();
  bindSliders();
  renderAll();

  qq('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang;
      saveState(); applyLang(); renderAll();
    });
  });

  q('#gear-btn').addEventListener('click', openModal);
  q('#modal-close').addEventListener('click', closeModal);
  q('#modal').addEventListener('click', e => { if (e.target === q('#modal')) closeModal(); });
  q('#save-profile-btn').addEventListener('click', saveProfileFromModal);

  q('#cpl-toggle').addEventListener('click', () => {
    state.cpl = !state.cpl;
    saveState(); renderFilters(); renderResults();
  });

  q('#feedback-toggle-row').addEventListener('click', () => {
    state.feedbackOpen = !state.feedbackOpen;
    saveState(); renderFeedbackToggle();
  });
  q('#feedback-send-btn').addEventListener('click', sendFeedback);
  q('#reset-btn').addEventListener('click', resetState);

  q('#install-btn').addEventListener('click', async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
    q('#install-banner').classList.remove('show');
  });
  q('#install-dismiss').addEventListener('click', () => {
    localStorage.setItem('lc_install_dismissed', '1');
    q('#install-banner').classList.remove('show');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
