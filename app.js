/* ── FIELD CALC — app.js ────────────────────────────────────────────── */

const { SUBJECTS, SCENES, GOALS, ND_FILTERS, calculate, fmtShutter } = window.FC;

// ── STATE ──────────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  scene: 'beach',
  customEV: 13,
  subjectId: 'person_walk',
  speedKmh: 5,
  goalId: 'freeze',
  focalLength: 50,
  distance: 5,
  aperture: 8,
  nd: '없음',
  cpl: false,
  feedbackOpen: false,
};

const DEFAULT_PROFILE = {
  body: '',
  lenses: '',
  maxAperture: '',
  ownedFilters: [],
  maxISO: 6400,
};

let state   = { ...DEFAULT_STATE };
let profile = { ...DEFAULT_PROFILE };

// ── STORAGE ────────────────────────────────────────────────────────────────

function loadStorage() {
  try {
    const s = localStorage.getItem('fc_state');
    const p = localStorage.getItem('fc_profile');
    if (s) state   = { ...DEFAULT_STATE,   ...JSON.parse(s) };
    if (p) profile = { ...DEFAULT_PROFILE, ...JSON.parse(p) };
  } catch(e) {}
}
function saveState()   { localStorage.setItem('fc_state',   JSON.stringify(state)); }
function saveProfile() { localStorage.setItem('fc_profile', JSON.stringify(profile)); }

// ── HELPERS ────────────────────────────────────────────────────────────────

function getEV() {
  if (state.scene === 'custom') return state.customEV;
  return SCENES.find(s => s.id === state.scene)?.ev ?? 13;
}
function getNDStops() {
  return ND_FILTERS.find(f => f.label === state.nd)?.stops ?? 0;
}
function getSubject() {
  return SUBJECTS.find(s => s.id === state.subjectId);
}

// ── CALCULATE & RENDER RESULTS ─────────────────────────────────────────────

function renderResults() {
  const res = calculate({
    subjectId: state.subjectId,
    speedKmh: state.speedKmh,
    goalId: state.goalId,
    focalLength: state.focalLength,
    distance: state.distance,
    ev: getEV(),
    ndStops: getNDStops(),
    cpl: state.cpl,
    aperture: state.aperture,
  });

  q('#res-shutter').textContent  = res.shutterFmt;
  q('#res-iso').textContent      = res.iso;
  q('#res-aperture').textContent = `f/${res.aperture.toFixed(1)}`;
  q('#res-base-shutter').textContent = res.shutterBaseFmt;
  q('#res-filter-stops').textContent = res.totalStops > 0
    ? `-${res.totalStops.toFixed(1)} stop` : '없음';
  q('#res-exp-comp').textContent = res.expComp === 0
    ? '±0' : `${res.expComp > 0 ? '+' : ''}${res.expComp.toFixed(1)}`;

  const warn = q('#res-warning');
  if (res.warning) {
    warn.textContent = '⚠ ' + res.warning;
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }
}

// ── RENDER UI ──────────────────────────────────────────────────────────────

function renderAll() {
  renderScenes();
  renderSubjects();
  renderGoals();
  renderFilters();
  renderSliders();
  renderResults();
  renderProfileBadge();
  renderFeedback();
}

function renderScenes() {
  const wrap = q('#scene-grid');
  wrap.innerHTML = SCENES.map(s => `
    <button class="scene-btn ${state.scene === s.id ? 'active' : ''}"
            data-scene="${s.id}">
      <span class="icon">${s.icon}</span>
      <span class="label">${s.label}</span>
      ${s.ev !== null ? `<span class="ev-val">EV ${s.ev}</span>` : ''}
    </button>
  `).join('');

  // custom EV input
  const customRow = q('#custom-ev-row');
  customRow.style.display = state.scene === 'custom' ? 'block' : 'none';

  wrap.querySelectorAll('.scene-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.scene = btn.dataset.scene;
      saveState(); renderAll();
    });
  });
}

function renderSubjects() {
  const wrap = q('#subject-pills');
  wrap.innerHTML = SUBJECTS.map(s => `
    <button class="pill ${state.subjectId === s.id ? 'active' : ''}"
            data-id="${s.id}">${s.icon} ${s.label}</button>
  `).join('');

  q('#speed-row').style.display = state.subjectId === 'static' ? 'none' : 'block';
  q('#distance-row').style.display = state.subjectId === 'static' ? 'none' : 'block';

  wrap.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.subjectId = btn.dataset.id;
      const sub = SUBJECTS.find(s => s.id === state.subjectId);
      state.speedKmh = sub.speed;
      saveState(); renderAll();
    });
  });
}

function renderGoals() {
  const wrap = q('#goal-list');
  wrap.innerHTML = GOALS.map(g => `
    <button class="goal-row ${state.goalId === g.id ? 'active' : ''}" data-id="${g.id}">
      <div>
        <div class="goal-name">${g.label}</div>
        <div class="goal-desc">${g.desc}</div>
      </div>
      <div class="goal-dot"></div>
    </button>
  `).join('');
  wrap.querySelectorAll('.goal-row').forEach(btn => {
    btn.addEventListener('click', () => {
      state.goalId = btn.dataset.id;
      saveState(); renderAll();
    });
  });
}

function renderFilters() {
  // ND
  const ndWrap = q('#nd-buttons');
  ndWrap.innerHTML = ND_FILTERS.map(f => `
    <button class="filter-btn ${state.nd === f.label ? 'active' : ''}"
            data-nd="${f.label}">${f.label}</button>
  `).join('');
  ndWrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.nd = btn.dataset.nd;
      saveState(); renderResults();
      renderFilters();
    });
  });

  // CPL
  const cplToggle = q('#cpl-toggle');
  cplToggle.className = 'toggle' + (state.cpl ? ' on' : '');
  q('#cpl-label').className = 'toggle-label' + (state.cpl ? ' on' : '');
}

function renderSliders() {
  setupSlider('focal-slider', 'focal-val', state.focalLength, v => `${v}mm`, v => {
    state.focalLength = v; saveState(); renderResults();
  });
  setupSlider('aperture-slider', 'aperture-val', state.aperture, v => `f/${v.toFixed(1)}`, v => {
    state.aperture = v; saveState(); renderResults();
  });
  setupSlider('speed-slider', 'speed-val', state.speedKmh, v => `${v} km/h`, v => {
    state.speedKmh = v; saveState(); renderResults();
  });
  setupSlider('distance-slider', 'distance-val', state.distance, v => `${v}m`, v => {
    state.distance = v; saveState(); renderResults();
  });
  setupSlider('custom-ev-slider', 'custom-ev-val', state.customEV, v => `EV ${v}`, v => {
    state.customEV = v; saveState(); renderResults();
  });
}

function setupSlider(sliderId, valId, value, fmt, onChange) {
  const slider = q('#' + sliderId);
  const valEl  = q('#' + valId);
  if (!slider || !valEl) return;
  slider.value = value;
  valEl.textContent = fmt(value);
  slider.oninput = () => {
    const v = parseFloat(slider.value);
    valEl.textContent = fmt(v);
    onChange(v);
  };
}

function renderFeedback() {
  const body = q('#feedback-body');
  if (body) body.className = 'feedback-body' + (state.feedbackOpen ? ' open' : '');
  const arrow = q('#feedback-arrow');
  if (arrow) arrow.textContent = state.feedbackOpen ? '▲' : '▼';
}

function renderProfileBadge() {
  const badge = q('#profile-badge');
  const gearBtn = q('#gear-btn');
  if (!badge) return;

  const hasProfile = profile.body || profile.lenses;
  gearBtn.className = 'gear-btn' + (hasProfile ? ' has-profile' : '');

  if (hasProfile) {
    badge.style.display = 'block';
    badge.innerHTML = `
      ${profile.body ? `<span>바디</span> ${profile.body}<br>` : ''}
      ${profile.lenses ? `<span>렌즈</span> ${profile.lenses}<br>` : ''}
      ${profile.ownedFilters.length ? `<span>필터</span> ${profile.ownedFilters.join(', ')}` : ''}
    `;
  } else {
    badge.style.display = 'none';
  }
}

// ── PROFILE MODAL ──────────────────────────────────────────────────────────

function openModal() {
  q('#modal').className = 'modal-overlay open';
  renderModal();
}
function closeModal() {
  q('#modal').className = 'modal-overlay';
}
function renderModal() {
  q('#prof-body').value      = profile.body || '';
  q('#prof-lenses').value    = profile.lenses || '';
  q('#prof-maxap').value     = profile.maxAperture || '';
  q('#prof-maxiso').value    = profile.maxISO || 6400;

  const fchecks = q('#filter-checklist');
  const FILTER_OPTIONS = ['ND2','ND4','ND8','ND16','ND64','ND100','ND400','ND1000','CPL'];
  fchecks.innerHTML = FILTER_OPTIONS.map(f => `
    <button class="filter-check ${profile.ownedFilters.includes(f) ? 'on' : ''}"
            data-filter="${f}">${f}</button>
  `).join('');
  fchecks.querySelectorAll('.filter-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      if (profile.ownedFilters.includes(f)) {
        profile.ownedFilters = profile.ownedFilters.filter(x => x !== f);
        btn.className = 'filter-check';
      } else {
        profile.ownedFilters.push(f);
        btn.className = 'filter-check on';
      }
    });
  });
}

function saveProfileFromModal() {
  profile.body         = q('#prof-body').value.trim();
  profile.lenses       = q('#prof-lenses').value.trim();
  profile.maxAperture  = q('#prof-maxap').value.trim();
  profile.maxISO       = parseInt(q('#prof-maxiso').value) || 6400;
  saveProfile();
  closeModal();
  renderProfileBadge();
}

// ── FEEDBACK ──────────────────────────────────────────────────────────────

async function sendFeedback() {
  const text = q('#feedback-text').value.trim();
  if (!text) return;

  const btn = q('#feedback-send-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>분석 중...';

  const resultEl = q('#feedback-result');
  resultEl.className = 'feedback-result';

  // Build context
  const res = calculate({
    subjectId: state.subjectId,
    speedKmh: state.speedKmh,
    goalId: state.goalId,
    focalLength: state.focalLength,
    distance: state.distance,
    ev: getEV(),
    ndStops: getNDStops(),
    cpl: state.cpl,
    aperture: state.aperture,
  });

  const subject = SUBJECTS.find(s => s.id === state.subjectId);
  const goal    = GOALS.find(g => g.id === state.goalId);
  const scene   = SCENES.find(s => s.id === state.scene);

  const context = `
현재 촬영 설정:
- 장면: ${scene?.label ?? '커스텀'} (EV ${getEV()})
- 피사체: ${subject?.label} (${state.speedKmh} km/h)
- 목표: ${goal?.label}
- 계산 결과: 셔터 ${res.shutterFmt} / ISO ${res.iso} / f/${res.aperture.toFixed(1)}
- 필터: ND ${state.nd}${state.cpl ? ' + CPL' : ''} (총 ${res.totalStops.toFixed(1)} stop)
- 초점거리: ${state.focalLength}mm / 피사체 거리: ${state.distance}m
${profile.body ? `- 바디: ${profile.body}` : ''}
${profile.lenses ? `- 렌즈: ${profile.lenses}` : ''}
${profile.maxAperture ? `- 최대 조리개: ${profile.maxAperture}` : ''}
${profile.ownedFilters.length ? `- 보유 필터: ${profile.ownedFilters.join(', ')}` : ''}
${profile.maxISO ? `- 실용 최대 ISO: ${profile.maxISO}` : ''}

사용자 피드백: "${text}"
`.trim();

  const systemPrompt = `당신은 사진 촬영 전문가입니다. 사용자가 위 설정으로 촬영한 결과물에 대한 피드백을 주면, 
구체적인 설정 수정값을 제안하세요. 보유 장비 한계를 반드시 고려하세요.
응답은 간결하게, 한국어로, 마크다운 없이 일반 텍스트로만 작성하세요.
형식: 원인 1~2줄 → 수정값 (셔터/ISO/조리개/필터 구체적 수치) → 추가 팁 1줄`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: context }],
      }),
    });
    const data = await resp.json();
    const answer = data.content?.map(c => c.text || '').join('') || '응답을 받지 못했습니다.';
    resultEl.innerHTML = `<div class="feedback-result-label">AI 제안</div>${answer}`;
    resultEl.className = 'feedback-result visible';
  } catch(e) {
    resultEl.innerHTML = `<div class="feedback-result-label">오류</div>네트워크 오류가 발생했습니다.`;
    resultEl.className = 'feedback-result visible';
  }

  btn.disabled = false;
  btn.textContent = '수정값 요청 →';
}

// ── RESET ─────────────────────────────────────────────────────────────────

function resetState() {
  if (!confirm('설정을 초기화할까요? 장비 프로파일은 유지됩니다.')) return;
  state = { ...DEFAULT_STATE };
  saveState();
  renderAll();
}

// ── UTILS ──────────────────────────────────────────────────────────────────

function q(sel) { return document.querySelector(sel); }

// ── PWA INSTALL ────────────────────────────────────────────────────────────

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('fc_install_dismissed')) {
    q('#install-banner').className = 'install-banner show';
  }
});

// ── INIT ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  renderAll();

  // Gear / profile
  q('#gear-btn').addEventListener('click', openModal);
  q('#modal-close').addEventListener('click', closeModal);
  q('#modal').addEventListener('click', e => { if (e.target === q('#modal')) closeModal(); });
  q('#save-profile-btn').addEventListener('click', saveProfileFromModal);

  // CPL toggle
  q('#cpl-toggle').addEventListener('click', () => {
    state.cpl = !state.cpl;
    saveState(); renderFilters(); renderResults();
  });

  // Feedback toggle
  q('#feedback-toggle-row').addEventListener('click', () => {
    state.feedbackOpen = !state.feedbackOpen;
    saveState(); renderFeedback();
  });

  // Feedback send
  q('#feedback-send-btn').addEventListener('click', sendFeedback);

  // Reset
  q('#reset-btn').addEventListener('click', resetState);

  // Custom EV
  q('#custom-ev-slider').addEventListener('input', () => {
    const v = parseFloat(q('#custom-ev-slider').value);
    state.customEV = v;
    q('#custom-ev-val').textContent = `EV ${v}`;
    saveState(); renderResults();
  });

  // Install banner
  q('#install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    q('#install-banner').className = 'install-banner';
  });
  q('#install-dismiss').addEventListener('click', () => {
    localStorage.setItem('fc_install_dismissed', '1');
    q('#install-banner').className = 'install-banner';
  });

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
