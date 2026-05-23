// ���� LUX COMPASS 쨌 app.js ����������������������������������������������������������������������������������������������������

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
  maxISO: 100000,
  ownedFilters: ['ND8', 'ND64', 'ND1000', 'CPL'],
};

let state   = { ...DEFAULT_STATE };
let profile = { ...DEFAULT_PROFILE };

// ���� STORAGE ��������������������������������������������������������������������������������������������������������������������������������

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

// ���� HELPERS ��������������������������������������������������������������������������������������������������������������������������������

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

// ���� LANGUAGE ������������������������������������������������������������������������������������������������������������������������������

function applyLang() {
  const tx = t();
  document.documentElement.lang = state.lang;

  // static text
  q('#app-tagline').textContent  = tx.tagline;
  q('#app-subtitle').textContent = tx.subtitle;
  q('#gear-btn-label').textContent = tx.gearBtn;
  q('#lbl-scene').textContent    = tx.sections.scene;
  q('#lbl-subject').textContent  = tx.sections.subject;
  q('#lbl-goal').textContent     = tx.sections.goal;
  q('#lbl-lens').textContent     = tx.sections.lens;
  q('#lbl-filter').textContent   = tx.sections.filter;
  q('#lbl-results').textContent  = tx.sections.results;
  q('#lbl-feedback').textContent = tx.sections.feedback;
  q('#lbl-feedback-sub').textContent = tx.sections.feedbackSub;
  q('#cpl-label').textContent    = tx.cpl;
  q('#lbl-res-shutter').textContent  = tx.results.shutter;
  q('#lbl-res-iso').textContent      = tx.results.iso;
  q('#lbl-res-aperture').textContent = tx.results.aperture;
  q('#lbl-res-base').textContent     = tx.results.baseShutter;
  q('#lbl-res-stops').textContent    = tx.results.filterStops;
  q('#lbl-res-comp').textContent     = tx.results.expComp;
  q('#res-note').innerHTML = tx.results.note.map(n => `쨌 ${n}`).join('<br>');
  q('#feedback-text').placeholder = tx.feedback.placeholder;
  q('#feedback-send-btn').textContent = tx.feedback.send;
  q('#reset-btn').textContent     = tx.reset;

  // sliders
  q('#lbl-focal').textContent    = tx.sliders.focalLength;
  q('#lbl-distance').textContent = tx.sliders.distance;
  q('#lbl-aperture').textContent = tx.sliders.aperture;
  q('#lbl-speed').textContent    = tx.sliders.speed;
  q('#lbl-customev').textContent = tx.sliders.customEV;

  // profile modal
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

  // lang buttons
  qq('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === state.lang);
  });
}

// ���� RENDER ����������������������������������������������������������������������������������������������������������������������������������

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
      ${label === 'ND8' ? label + ' ��' : label}
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
  const ndStops = getNDStops();
  const res = calculate({
    subjectId: state.subjectId,
    speedKmh:  state.speedKmh,
    goalId:    state.goalId,
    focalLength: state.focalLength,
    distance:  state.distance,
    ev:        getEV(),
    ndStops,
    cpl:       state.cpl,
    aperture:  state.aperture,
    maxISO:    profile.maxISO || 12800,
  });

  q('#res-shutter').textContent  = res.shutterFmt;
  q('#res-iso').textContent      = res.iso.toLocaleString();
  q('#res-aperture').textContent = `f/${res.aperture.toFixed(1)}`;
  q('#res-base').textContent     = res.shutterBaseFmt;
  q('#res-stops').textContent    = res.totalStops > 0
    ? `-${res.totalStops.toFixed(1)} stop` : '��';
  q('#res-comp').textContent     = res.expComp === 0
    ? '짹0' : `${res.expComp > 0 ? '+' : ''}${res.expComp.toFixed(1)}`;

  const warn = q('#res-warning');
  if (res.warnHigh) {
    warn.textContent = '�� ' + tx.warnings.isoHigh;
    warn.style.display = 'block';
  } else if (res.warnLow) {
    warn.textContent = '�� ' + tx.warnings.isoLow;
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }
}

function renderFeedbackToggle() {
  q('#feedback-body').className = 'feedback-body' + (state.feedbackOpen ? ' open' : '');
  q('#feedback-arrow').textContent = state.feedbackOpen ? '��' : '��';
}

function renderGearBtn() {
  const has = profile.body || profile.lenses;
  q('#gear-dot').style.display = has ? 'block' : 'none';
  q('#gear-profile-name').textContent = has
    ? (profile.body || '').split(' ').slice(-1)[0] : '';
}

// ���� PROFILE MODAL ��������������������������������������������������������������������������������������������������������������������

function openModal() {
  q('#modal').className = 'modal-overlay open';
  renderModal();
}
function closeModal() {
  q('#modal').className = 'modal-overlay';
}

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
      profile.presetId = preset.id;
      if (preset.id !== 'custom') {
        profile.body        = preset.body;
        profile.lenses      = preset.lenses;
        profile.maxAperture = preset.maxAperture;
        profile.maxISO      = preset.maxISO;
        // update focal slider range
        if (preset.focalMin && preset.focalMax) {
          state.focalLength = preset.focalMin;
        }
      }
      renderModal();
    });
  });

  // Custom fields
  const isCustom = profile.presetId === 'custom';
  q('#custom-fields').style.display = isCustom ? 'block' : 'none';
  q('#preset-summary').style.display = isCustom ? 'none' : 'block';

  if (!isCustom) {
    const preset = LEICA_PRESETS.find(p => p.id === profile.presetId);
    q('#preset-summary').innerHTML = `
      <div class="summary-row"><span>Body</span>${preset.body}</div>
      <div class="summary-row"><span>Lens</span>${preset.lenses}</div>
      <div class="summary-row"><span>Aperture</span>${preset.maxAperture}</div>
      <div class="summary-row"><span>Max ISO</span>${preset.maxISO.toLocaleString()}</div>
    `;
  }

  q('#prof-body').value   = profile.body || '';
  q('#prof-lenses').value = profile.lenses || '';
  q('#prof-maxap').value  = profile.maxAperture || '';
  q('#prof-maxiso').value = profile.maxISO || 6400;

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

function saveProfileFromModal() {
  const isCustom = profile.presetId === 'custom';
  if (isCustom) {
    profile.body        = q('#prof-body').value.trim();
    profile.lenses      = q('#prof-lenses').value.trim();
    profile.maxAperture = q('#prof-maxap').value.trim();
    profile.maxISO      = parseInt(q('#prof-maxiso').value) || 6400;
  }
  saveProfile(); closeModal(); renderAll();
}

// ���� FEEDBACK ������������������������������������������������������������������������������������������������������������������������������

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
    maxISO:      profile.maxISO,
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
${profile.body    ? `- Body: ${profile.body}` : ''}
${profile.lenses  ? `- Lens: ${profile.lenses}` : ''}
${profile.maxAperture ? `- Max aperture: ${profile.maxAperture}` : ''}
${profile.maxISO  ? `- Practical max ISO: ${profile.maxISO}` : ''}
${profile.ownedFilters?.length ? `- Owned filters: ${profile.ownedFilters.join(', ')}` : ''}

User feedback: "${text}"
Response language: ${state.lang === 'ko' ? 'Korean' : state.lang === 'ja' ? 'Japanese' : state.lang === 'pl' ? 'Polish' : 'English'}
`.trim();

  const sys = `You are an expert photography assistant. The user shot a photo using the settings above and gives feedback.
Suggest specific corrected settings. Respect the gear limitations (max aperture, max ISO, owned filters).
Reply concisely in plain text (no markdown). Format: cause (1-2 lines) �� corrected values (specific numbers) �� one tip.`;

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

// ���� SLIDER EVENTS ��������������������������������������������������������������������������������������������������������������������

function bindSliders() {
  const bindings = [
    ['focal-slider',    'focal-val',    v => `${v}mm`,         v => { state.focalLength = v; }],
    ['aperture-slider', 'aperture-val', v => `f/${v.toFixed(1)}`, v => { state.aperture = v; }],
    ['speed-slider',    'speed-val',    v => `${v} km/h`,      v => { state.speedKmh = v; }],
    ['distance-slider', 'distance-val', v => `${v}m`,          v => { state.distance = v; }],
    ['custom-ev-slider','custom-ev-val',v => `EV ${v}`,        v => { state.customEV = v; }],
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

// ���� RESET ������������������������������������������������������������������������������������������������������������������������������������

function resetState() {
  if (!confirm(t().resetConfirm)) return;
  state = { ...DEFAULT_STATE, lang: state.lang };
  saveState();
  renderAll();
}

// ���� PWA INSTALL ������������������������������������������������������������������������������������������������������������������������

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('lc_install_dismissed')) {
    q('#install-banner').classList.add('show');
  }
});

// ���� INIT ��������������������������������������������������������������������������������������������������������������������������������������

document.addEventListener('DOMContentLoaded', () => {
  load();
  bindSliders();
  renderAll();

  // Lang switcher
  qq('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang;
      saveState(); applyLang(); renderAll();
    });
  });

  // Gear modal
  q('#gear-btn').addEventListener('click', openModal);
  q('#modal-close').addEventListener('click', closeModal);
  q('#modal').addEventListener('click', e => { if (e.target === q('#modal')) closeModal(); });
  q('#save-profile-btn').addEventListener('click', saveProfileFromModal);

  // CPL
  q('#cpl-toggle').addEventListener('click', () => {
    state.cpl = !state.cpl;
    saveState(); renderFilters(); renderResults();
  });

  // Feedback
  q('#feedback-toggle-row').addEventListener('click', () => {
    state.feedbackOpen = !state.feedbackOpen;
    saveState(); renderFeedbackToggle();
  });
  q('#feedback-send-btn').addEventListener('click', sendFeedback);

  // Reset
  q('#reset-btn').addEventListener('click', resetState);

  // Install
  q('#install-btn').addEventListener('click', async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
    q('#install-banner').classList.remove('show');
  });
  q('#install-dismiss').addEventListener('click', () => {
    localStorage.setItem('lc_install_dismissed', '1');
    q('#install-banner').classList.remove('show');
  });

  // SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
