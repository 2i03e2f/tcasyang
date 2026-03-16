// ============================================================
//  TCAS69 — main.js
// ============================================================

// ===== PARTICLE SYSTEM =====
(function() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, mouse = { x: -999, y: -999 };
  const PARTICLE_COUNT = 80;
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : Math.random() * H;
      this.vx   = (Math.random() - 0.5) * 0.5;
      this.vy   = (Math.random() - 0.5) * 0.5;
      this.bvx  = this.vx; // base velocity x
      this.bvy  = this.vy; // base velocity y
      this.r    = Math.random() * 1.5 + 0.5;
      this.a    = Math.random() * 0.4 + 0.1;
    }
    update() {
      const dx   = mouse.x - this.x;
      const dy   = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const REPEL = 100;
      if (dist < REPEL) {
        const force = (REPEL - dist) / REPEL;
        this.vx -= (dx / dist) * force * 1.2;
        this.vy -= (dy / dist) * force * 1.2;
      }
      // ค่อยๆ drift กลับไปที่ base velocity แทนที่จะหยุดนิ่ง
      this.vx += (this.bvx - this.vx) * 0.02;
      this.vy += (this.bvy - this.vy) * 0.02;
      this.vx *= 0.995;
      this.vy *= 0.995;
      this.x  += this.vx;
      this.y  += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,180,200,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawLines() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(120,120,160,${0.12 * (1 - dist/MAX_DIST)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ===== 3D TILT =====
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const cx   = rect.width  / 2;
    const cy   = rect.height / 2;
    const rx   = ((y - cy) / cy) * 6;
    const ry   = ((x - cx) / cx) * -6;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    card.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// ===== HAMBURGER =====
function toggleMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.classList.toggle('open');
  menu.classList.toggle('open');
}

function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
}

// Ensure mobile dropdown closes when window resizes back to desktop
window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 646px)').matches) {
    closeMenu();
  }
});

// sync mobile menu active state
function syncMobileActive(id) {
  document.querySelectorAll('.mobile-menu a').forEach(a => a.classList.remove('active'));
  const idx = ['home', 'rounds', 'calc', 'unis'].indexOf(id);
  const links = document.querySelectorAll('.mobile-menu a');
  if (links[idx]) links[idx].classList.add('active');
}

// ===== TOGGLE GROUP =====
function setToggle(groupId, btn, val) {
  document.querySelectorAll(`#${groupId} .tgl-btn`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // หา hidden input ที่ตรงกัน เช่น of-status-group → of-status
  const hiddenId = groupId.replace('-group', '');
  const hidden = document.getElementById(hiddenId);
  if (hidden) hidden.value = val;
}

// custom checkbox sync
function initChkItems() {
  document.querySelectorAll('.chk-item').forEach(label => {
    const cb = label.querySelector('input[type="checkbox"]');
    if (!cb) return;
    // sync initial state
    if (cb.checked) label.classList.add('checked');
    label.addEventListener('click', () => {
      cb.checked = !cb.checked;
      label.classList.toggle('checked', cb.checked);
    });
  });
}
document.addEventListener('DOMContentLoaded', initChkItems);

// ===== ICON HELPER =====
function icon(name, size = 16, cls = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name} ${cls}" data-lucide="${name}"></svg>`;
}
// init lucide icons ที่สร้างก่อน DOMContentLoaded
function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

// ===== LANG POPUP =====
function toggleLang(e) {
  e.stopPropagation();
  const popup = document.getElementById('lang-popup');
  popup.classList.toggle('open');
}

// ปิด popup เมื่อคลิกนอก
document.addEventListener('click', () => {
  const popup = document.getElementById('lang-popup');
  if (popup) popup.classList.remove('open');
});

// ===== NAV =====
const navLinks = document.querySelectorAll('nav a');
const pages    = ['home', 'rounds', 'calc', 'unis'];

function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  navLinks.forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  navLinks[pages.indexOf(id)].classList.add('active');
  syncMobileActive(id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'unis' && !uLoaded) loadU();
  if (id === 'calc') checkImportBtn();
}

// ===== CALC TABS =====
function switchTab(id, btn) {
  document.querySelectorAll('.calc-sub').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
  if (id === 'check') checkImportBtn();
}

// ===== SCORE KEYS =====
const scoreKeys = [
  'gpax',
  'tgat1', 'tgat2', 'tgat3',
  'tpat1', 'tpat2', 'tpat3', 'tpat4', 'tpat5',
  'al61',  'al62',  'al63',  'al64',  'al65',
  'al66',  'al70',  'al82',  'al85',
];

const scoreLabels = [
  'GPAX',
  'TGAT1', 'TGAT2', 'TGAT3',
  'TPAT1', 'TPAT2', 'TPAT3', 'TPAT4', 'TPAT5',
  'A-Level 61', 'A-Level 62', 'A-Level 63', 'A-Level 64', 'A-Level 65',
  'A-Level 66', 'A-Level 70', 'A-Level 82', 'A-Level 85',
];

const scoreMax = {
  gpax: 4,
  tgat1: 100, tgat2: 100, tgat3: 100,
  tpat1: 100, tpat2: 100, tpat3: 100, tpat4: 100, tpat5: 100,
  al61: 100, al62: 100, al63: 100, al64: 100, al65: 100,
  al66: 100, al70: 100, al82: 100, al85: 100,
};

let savedScores = {};

function lbl(k, v) {
  const el = document.getElementById('lv-' + k);
  if (el) el.textContent = v || '-';
}

function saveScores() {
  scoreKeys.forEach(k => {
    const el = document.getElementById('s-' + k);
    if (el) savedScores[k] = parseFloat(el.value) || 0;
  });
}

function hasAnyScore() {
  return scoreKeys.some(k => {
    const el = document.getElementById('s-' + k);
    return el && parseFloat(el.value) > 0;
  });
}

function checkImportBtn() {
  const btn = document.getElementById('import-btn');
  if (btn) btn.style.display = hasAnyScore() ? 'block' : 'none';
}

function importScores() {
  scoreKeys.forEach(k => {
    const src = document.getElementById('s-' + k);
    const dst = document.getElementById('c-' + k);
    if (src && dst) dst.value = src.value;
  });
}

// ===== MANUAL CALC =====
const weightLabels = {
  gpax:'GPAX', tgat1:'TGAT1', tgat2:'TGAT2', tgat3:'TGAT3',
  tpat1:'TPAT1', tpat2:'TPAT2', tpat3:'TPAT3', tpat4:'TPAT4', tpat5:'TPAT5',
  al61:'A-Lv 61', al62:'A-Lv 62', al63:'A-Lv 63', al64:'A-Lv 64',
  al65:'A-Lv 65', al66:'A-Lv 66', al70:'A-Lv 70', al82:'A-Lv 82', al85:'A-Lv 85',
};

function renderWeights() {
  const filled = scoreKeys.filter(k => {
    const el = document.getElementById('s-' + k);
    return el && parseFloat(el.value) > 0;
  });
  const container = document.getElementById('weight-rows');

  // ซ่อน quick-btns bar เดิม (ไม่ใช้แล้ว)
  const qb = document.getElementById('quick-btns');
  if (qb) qb.style.display = 'none';

  if (!filled.length) {
    container.innerHTML = '<div class="w-empty">กรุณากรอกคะแนนก่อน</div>';
    document.getElementById('wtotal').textContent = '0%';
    document.getElementById('wtrow').className = 'wtotal ok';
    return;
  }
  const existing = {};
  scoreKeys.forEach(k => {
    const el = document.getElementById('w-' + k);
    if (el) existing[k] = el.value;
  });

  const pcts = [10,20,30,40,50,60,70,80,90,100];
  container.innerHTML = filled.map(k => `
    <div class="wrow-block">
      <div class="wrow">
        <span class="wname">${weightLabels[k]}</span>
        <input type="number" class="winput nospinner" id="w-${k}" value="${existing[k]||0}" oninput="upW()">
        <span class="wpct">%</span>
      </div>
      <div class="wrow-btns">
        ${pcts.map(p => `<button class="quick-pct-btn" onclick="setW('${k}',${p})">${p}%</button>`).join('')}
      </div>
    </div>
  `).join('');
  upW();
}

function setW(k, pct) {
  const el = document.getElementById('w-' + k);
  if (el) { el.value = pct; upW(); }
}

function applyQuickPct(pct) {
  const filled = scoreKeys.filter(k => document.getElementById('w-' + k));
  if (!filled.length) return;
  const each = Math.floor(pct / filled.length);
  const rem  = pct - each * filled.length;
  filled.forEach((k, i) => {
    const el = document.getElementById('w-' + k);
    if (el) el.value = each + (i === 0 ? rem : 0);
  });
  upW();
}

function upW() {
  const filled = scoreKeys.filter(k => document.getElementById('w-' + k));
  const t = filled.reduce((s, k) => s + (parseFloat(document.getElementById('w-' + k)?.value) || 0), 0);
  document.getElementById('wtotal').textContent = t + '%';
  document.getElementById('wtrow').className = 'wtotal ' + (Math.round(t) === 100 ? 'ok' : 'err');
}

function calc() {
  let scores = {}, weights = {}, wt = 0;

  scoreKeys.forEach(k => {
    scores[k]  = parseFloat(document.getElementById('s-' + k)?.value) || 0;
    weights[k] = parseFloat(document.getElementById('w-' + k)?.value) || 0;
    wt += weights[k];
  });

  if (Math.round(wt) !== 100) {
    showToast('น้ำหนักรวมต้องเท่ากับ 100%', { type: 'error' });
    return;
  }

  let total = 0;
  const items = [];

  scoreKeys.forEach((k, i) => {
    const norm   = k === 'gpax' ? (scores[k] / 4) * 100 : scores[k];
    const contrib = (norm * weights[k]) / 100;
    total += contrib;
    if (weights[k] > 0) {
      items.push({ name: scoreLabels[i], score: scores[k], max: scoreMax[k], w: weights[k], contrib, norm });
    }
  });

  document.getElementById('rbig').textContent = total.toFixed(2);
  document.getElementById('result').classList.add('show');

  document.getElementById('rbreak').innerHTML = items.map(x =>
    `<div class="bitem">
      <div class="bname">${x.name}</div>
      <div class="bval">${x.score}</div>
      <div class="bcontrib">+${x.contrib.toFixed(2)}</div>
    </div>`
  ).join('');

  document.getElementById('rbars').innerHTML = items.map(x =>
    `<div class="bar-wrap">
      <div class="bar-lbl"><span>${x.name} (${x.w}%)</span><span>${x.score}/${x.max}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, x.norm)}%"></div></div>
    </div>`
  ).join('');

  document.getElementById('rnote').textContent =
    total >= 80 ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-lucide=\"star\"></svg> ยอดเยี่ยม — คะแนนสูงมาก' :
    total >= 60 ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-lucide=\"thumbs-up\"></svg> ดี — คะแนนอยู่ในระดับดี' :
    total >= 40 ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-lucide=\"book-open\"></svg> พอใช้ได้ — ยังมีเวลาพัฒนา' :
                  '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-lucide=\"zap\"></svg> ยังมีโอกาส — ตั้งใจเตรียมสอบให้ดี';

  setTimeout(() => document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

function showToast(message, { type = 'info', duration = 2400 } = {}) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast show ' + (type ? `toast-${type}` : '');
  clearTimeout(el._toastTimeout);
  el._toastTimeout = setTimeout(() => el.classList.remove('show'), duration);
}

// ===== CHECK MODE =====
let uniList  = [];
let facList  = [];
let progList = [];
let samplePrograms = [];

fetch('programs.json')
  .then(r => r.json())
  .then(data => {
    // normalize keys: a_lv_61 → al61, tgat → tgat (ไม่เปลี่ยน)
    const norm = k => k.replace(/^a_lv_/, 'al');
    samplePrograms = data.map(p => ({
      ...p,
      scores:    Object.fromEntries(Object.entries(p.scores || {}).map(([k,v]) => [norm(k), v])),
      ly_scores: (() => {
        const raw = p.ly_scores || {};
        const calSubjects = (raw.cal_subject_name || '').trim().split(/\s+/).filter(Boolean);
        const calSum = raw.cal_score_sum || 0;
        // กรอง cal_ keys ออก แล้ว normalize
        let filtered = Object.fromEntries(
          Object.entries(raw)
            .filter(([k]) => !['cal_type','cal_score_sum','cal_subject_name'].includes(k))
            .map(([k,v]) => [norm(k), v])
        );
        // ถ้าว่างและมี cal_subject_name ให้ build จากนั้น
        if (!Object.keys(filtered).length && calSubjects.length && calSum) {
          const each = Math.round(calSum / calSubjects.length * 100) / 100;
          filtered = Object.fromEntries(calSubjects.map(s => [norm(s), each]));
        }
        return filtered;
      })(),
    }));
    uniList  = [...new Set(samplePrograms.map(p => p.university_name_th))].sort();
    facList  = [...new Set(samplePrograms.map(p => p.group_field_th).filter(Boolean))].sort();
    progList = [...new Set(samplePrograms.map(p => p.program_name_th))].sort();
  });

// dynamic filter SearchableDropdowns (สร้างใหม่ทุกครั้งที่เปลี่ยนโหมด)
let _sdUni = null, _sdFacFilter = null, _sdProg = null;

function onModeChange(mode) {
  const filters     = document.getElementById('check-filters');
  const scoreCard   = document.getElementById('check-score-card');
  const subjectCard = document.getElementById('check-subject-card');

  scoreCard.style.display   = mode === '6' ? 'none' : 'block';
  subjectCard.style.display = mode === '6' ? 'block' : 'none';

  filters.innerHTML = '';

  if (mode === '2') {
    filters.innerHTML = '<div class="sd-wrap" id="sd-f-uni" style="min-width:220px;flex:1"></div><input type="hidden" id="f-uni">';
    _sdUni = new SearchableDropdown('sd-f-uni', 'f-uni', 'เลือกมหาวิทยาลัย');
    _sdUni.setOptions(uniList);
  } else if (mode === '3') {
    filters.innerHTML = '<div class="sd-wrap" id="sd-f-fac" style="min-width:220px;flex:1"></div><input type="hidden" id="f-fac">';
    _sdFacFilter = new SearchableDropdown('sd-f-fac', 'f-fac', 'เลือกคณะ');
    _sdFacFilter.setOptions(facList);
  } else if (mode === '4') {
    filters.innerHTML = '<div class="sd-wrap" id="sd-f-uni" style="min-width:200px;flex:1"></div><input type="hidden" id="f-uni">'
                      + '<div class="sd-wrap" id="sd-f-fac" style="min-width:200px;flex:1"></div><input type="hidden" id="f-fac">';
    _sdUni = new SearchableDropdown('sd-f-uni', 'f-uni', 'เลือกมหาวิทยาลัย');
    _sdUni.setOptions(uniList);
    _sdFacFilter = new SearchableDropdown('sd-f-fac', 'f-fac', 'เลือกคณะ');
    _sdFacFilter.setOptions(facList);
  } else if (mode === '5') {
    filters.innerHTML = '<div class="sd-wrap" id="sd-f-uni" style="min-width:180px;flex:1"></div><input type="hidden" id="f-uni">'
                      + '<div class="sd-wrap" id="sd-f-fac" style="min-width:180px;flex:1"></div><input type="hidden" id="f-fac">'
                      + '<div class="sd-wrap" id="sd-f-prog" style="min-width:180px;flex:1"></div><input type="hidden" id="f-prog">';
    _sdUni = new SearchableDropdown('sd-f-uni', 'f-uni', 'เลือกมหาวิทยาลัย');
    _sdUni.setOptions(uniList);
    _sdFacFilter = new SearchableDropdown('sd-f-fac', 'f-fac', 'เลือกคณะ');
    _sdFacFilter.setOptions(facList);
    _sdProg = new SearchableDropdown('sd-f-prog', 'f-prog', 'เลือกสาขา');
    _sdProg.setOptions(progList);
  }

  document.getElementById('check-results').innerHTML = '';
  document.getElementById('output-filters').style.display = 'none';
  document.getElementById('page-bar').style.display = 'none';
  document.getElementById('page-bar-top').style.display = 'none';
  _allResults = [];
  _filteredCache = [];
}

const subjectNames = {
  gpax:'GPAX', tgat1:'TGAT1', tgat2:'TGAT2', tgat3:'TGAT3',
  tgat:'TGAT',
  tpat1:'TPAT1', tpat2:'TPAT2', tpat3:'TPAT3', tpat4:'TPAT4', tpat5:'TPAT5',
  al61:'A-Lv 61', al62:'A-Lv 62', al63:'A-Lv 63', al64:'A-Lv 64',
  al65:'A-Lv 65', al66:'A-Lv 66', al70:'A-Lv 70', al81:'A-Lv 81',
  al82:'A-Lv 82', al83:'A-Lv 83', al84:'A-Lv 84', al85:'A-Lv 85',
  al86:'A-Lv 86', al87:'A-Lv 87', al88:'A-Lv 88', al89:'A-Lv 89',
};

const scoreNameTHMap = {
  gpax:  'GPAX',
  tgat:  'TGAT (รวม)',
  tgat1: 'TGAT1 ภาษาอังกฤษ',
  tgat2: 'TGAT2 การคิดเชิงเหตุผล',
  tgat3: 'TGAT3 สมรรถนะการทำงาน',
  tpat1: 'TPAT1 วิชาเฉพาะแพทย์',
  tpat2: 'TPAT2 วิชาเฉพาะศิลปะ',
  tpat3: 'TPAT3 วิชาเฉพาะวิศวะ',
  tpat4: 'TPAT4 วิชาเฉพาะครู',
  tpat5: 'TPAT5 วิชาเฉพาะสถาปัตย์',
  a_lv_61: 'ALEVEL คณิตศาสตร์ประยุกต์ 1',
  a_lv_62: 'ALEVEL คณิตศาสตร์ประยุกต์ 2',
  a_lv_63: 'ALEVEL วิทยาศาสตร์ประยุกต์',
  a_lv_64: 'ALEVEL ฟิสิกส์',
  a_lv_65: 'ALEVEL เคมี',
  a_lv_66: 'ALEVEL ชีววิทยา',
  a_lv_70: 'ALEVEL สังคมศึกษา',
  a_lv_81: 'ALEVEL ภาษาไทย',
  a_lv_82: 'ALEVEL ภาษาอังกฤษ',
  a_lv_83: 'ALEVEL ภาษาฝรั่งเศส',
  a_lv_84: 'ALEVEL ภาษาเยอรมัน',
  a_lv_85: 'ALEVEL ภาษาญี่ปุ่น',
  a_lv_86: 'ALEVEL ภาษาเกาหลี',
  a_lv_87: 'ALEVEL ภาษาจีน',
  a_lv_88: 'ALEVEL ภาษาบาลี',
  a_lv_89: 'ALEVEL ภาษาสเปน',
  al61: 'ALEVEL คณิตศาสตร์ประยุกต์ 1',
  al62: 'ALEVEL คณิตศาสตร์ประยุกต์ 2',
  al63: 'ALEVEL วิทยาศาสตร์ประยุกต์',
  al64: 'ALEVEL ฟิสิกส์',
  al65: 'ALEVEL เคมี',
  al66: 'ALEVEL ชีววิทยา',
  al70: 'ALEVEL สังคมศึกษา',
  al81: 'ALEVEL ภาษาไทย',
  al82: 'ALEVEL ภาษาอังกฤษ',
  al83: 'ALEVEL ภาษาฝรั่งเศส',
  al84: 'ALEVEL ภาษาเยอรมัน',
  al85: 'ALEVEL ภาษาญี่ปุ่น',
  al86: 'ALEVEL ภาษาเกาหลี',
  al87: 'ALEVEL ภาษาจีน',
  al88: 'ALEVEL ภาษาบาลี',
  al89: 'ALEVEL ภาษาสเปน',
};

function scoreNameTH(k) {
  return scoreNameTHMap[k] || subjectNames[k] || k;
}

function criteriaText(scores, min_gpax, min_total) {
  const parts = Object.entries(scores).map(([k,w]) => `${subjectNames[k]||k} ${w}%`);
  return `GPAX ≥ ${min_gpax} &nbsp;|&nbsp; ${parts.join(' + ')} &nbsp;|&nbsp; คะแนนรวมขั้นต่ำ ${min_total}`;
}

function normalizeScoreKey(k) {
  return k.replace(/^a_lv_/, 'al').replace(/^alevel/, 'al');
}

function scoresEqual(a, b) {
  if (!a || !b) return false;
  const normA = {};
  const normB = {};
  Object.entries(a).forEach(([k,v]) => { normA[normalizeScoreKey(k)] = parseFloat(v); });
  Object.entries(b).forEach(([k,v]) => { normB[normalizeScoreKey(k)] = parseFloat(v); });
  const keysA = Object.keys(normA).sort();
  const keysB = Object.keys(normB).sort();
  if (keysA.join(',') !== keysB.join(',')) return false;
  return keysA.every(k => normA[k] === normB[k]);
}

function calcChance(score, minS, maxS) {
  if (!minS || !maxS || maxS <= minS) return null;
  return Math.max(0, Math.min(100, Math.round((score - minS) / (maxS - minS) * 100)));
}

// เก็บ result list ไว้ใช้กับ filter + pagination
let _allResults = [];
let _currentMode = '1';

function checkCriteria() {
  const mode = document.getElementById('check-mode').value;
  _currentMode = mode;
  const st   = {};
  const allKeys = [...scoreKeys, 'al81','al83','al84','al86','al87','al88','al89'];

  if (mode === '6') {
    allKeys.forEach(k => {
      const ck = document.getElementById('ck-' + k);
      st[k] = ck && ck.checked ? 100 : 0;
    });
    // ถ้าไม่ติ๊กอะไรเลยให้หยุด
    const anyChecked = allKeys.some(k => st[k] > 0);
    if (!anyChecked) {
      document.getElementById('check-results').innerHTML = '<div class="check-empty">กรุณาเลือกวิชาที่มีคะแนนอย่างน้อย 1 วิชา</div>';
      return;
    }
    st.gpax = 99;
  } else {
    allKeys.forEach(k => { st[k] = parseFloat(document.getElementById('c-' + k)?.value) || 0; });
  }

  const tgatFilled = [st.tgat1, st.tgat2, st.tgat3].filter(v => v > 0);
  st.tgat = tgatFilled.length ? tgatFilled.reduce((a, b) => a + b, 0) / tgatFilled.length : 0;

  const filterUni  = document.getElementById('f-uni')?.value  || '';
  const filterFac  = document.getElementById('f-fac')?.value  || '';
  const filterProg = document.getElementById('f-prog')?.value || '';

  let programs = samplePrograms.filter(p => {
    if (filterUni  && p.university_name_th !== filterUni)  return false;
    if (filterFac && p.group_field_th !== filterFac)  return false;
    if (filterProg && p.program_name_th    !== filterProg) return false;
    return true;
  });

  const results = [];

  programs.forEach(prog => {
    let ok = true;
    if (mode !== '6' && st.gpax < prog.min_gpax) ok = false;
    const reqKeys = Object.keys(prog.scores);
    const hasReq  = reqKeys.some(k => (st[k] || 0) > 0);
    if (!hasReq) return;

    const missing = reqKeys.filter(k => (st[k] || 0) === 0);
    if (missing.length) ok = false;

    let total = 0;
    if (mode !== '6') {
      reqKeys.forEach(k => { total += (st[k] || 0) * (prog.scores[k] / 100); });
      if (ok && prog.min_total && total < prog.min_total) ok = false;
    }

    const scoresChanged = !scoresEqual(prog.scores, prog.ly_scores || {});
    const changed = scoresChanged;
    const chance  = mode !== '6' ? calcChance(total, prog.ly_min_score, prog.ly_max_score) : null;
    results.push({ ...prog, total, changed, status: ok ? 'pass' : 'fail', chance });
  });

  if (!results.length) {
    document.getElementById('check-results').innerHTML = '<div class="check-empty">ไม่พบข้อมูลที่ตรงกัน</div>';
    document.getElementById('output-filters').style.display = 'none';
    document.getElementById('page-bar').style.display = 'none';
    document.getElementById('page-bar-top').style.display = 'none';
    return;
  }

  _allResults = results.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'pass' ? -1 : 1;
  });

  // populate output filter dropdowns
  const types    = [...new Set(results.map(r => r.program_type_name_th).filter(Boolean))].sort();
  const campuses = [...new Set(results.map(r => r.campus_name_th).filter(v => v && v.trim()))].sort();
  const facRaw = [...new Set(results.map(r => r.group_field_th).filter(Boolean))].sort();
  const facs = facRaw;

  populateSelect('of-type',   types,    'ทุกประเภท');
  populateSelect('of-campus', campuses, 'ทุกวิทยาเขต');
  populateSelect('of-fac',    facs,     'ทุกคณะ');

  document.getElementById('output-filters').style.display = 'block';
  applyFilters();
}

// ===== SEARCHABLE DROPDOWN =====
class SearchableDropdown {
  constructor(wrapId, hiddenId, defaultLabel) {
    this.wrap         = document.getElementById(wrapId);
    this.hidden       = document.getElementById(hiddenId);
    this.defaultLabel = defaultLabel;
    this.options      = [];
    this.value        = '';
    this._build();
  }

  _build() {
    this.wrap.innerHTML = `
      <button class="sd-trigger" type="button">${this.defaultLabel}</button>
      <div class="sd-panel">
        <input class="sd-search" placeholder="พิมพ์เพื่อค้นหา...">
        <div class="sd-list"></div>
      </div>`;
    this.trigger = this.wrap.querySelector('.sd-trigger');
    this.panel   = this.wrap.querySelector('.sd-panel');
    this.search  = this.wrap.querySelector('.sd-search');
    this.list    = this.wrap.querySelector('.sd-list');

    this.trigger.addEventListener('click', e => { e.stopPropagation(); this._toggle(); });
    this.search.addEventListener('input', () => this._render(this.search.value));
    document.addEventListener('click', () => this._close());
  }

  _toggle() {
    const open = this.panel.classList.contains('open');
    // ปิดทุก dropdown ก่อน
    document.querySelectorAll('.sd-panel.open').forEach(p => {
      p.classList.remove('open');
      p.closest('.sd-wrap')?.querySelector('.sd-trigger')?.classList.remove('open');
    });
    if (!open) {
      this.panel.classList.add('open');
      this.trigger.classList.add('open');
      this.search.value = '';
      this._render('');
      setTimeout(() => this.search.focus(), 50);
    }
  }

  _close() {
    this.panel.classList.remove('open');
    this.trigger.classList.remove('open');
  }

  _render(q) {
    const items = q
      ? this.options.filter(o => o.toLowerCase().includes(q.toLowerCase()))
      : this.options;
    if (!items.length) {
      this.list.innerHTML = '<div class="sd-item no-res">ไม่พบ</div>';
      return;
    }
    this.list.innerHTML =
      `<div class="sd-item${this.value===''?' active':''}" data-val="">— ${this.defaultLabel} —</div>` +
      items.map(o => `<div class="sd-item${this.value===o?' active':''}" data-val="${o}" title="${o}">${o}</div>`).join('');
    this.list.querySelectorAll('.sd-item').forEach(el => {
      el.addEventListener('click', () => {
        this.value = el.dataset.val;
        this.hidden.value = this.value;
        this.trigger.textContent = this.value || this.defaultLabel;
        // re-add arrow
        this.trigger.style.paddingRight = '30px';
        this._close();
        applyFilters();
      });
    });
  }

  setOptions(opts) {
    // ถ้า value เดิมไม่อยู่ใน list ใหม่ ให้ reset
    if (this.value && !opts.includes(this.value)) {
      this.value = '';
      this.hidden.value = '';
      this.trigger.textContent = this.defaultLabel;
    }
    this.options = opts;
  }
}

// ===== SIMPLE DROPDOWN (no search) =====
class SimpleDropdown {
  constructor(wrapId, hiddenId, defaultLabel, onSelect) {
    this.wrap     = document.getElementById(wrapId);
    this.hidden   = document.getElementById(hiddenId);
    this.onSelect = onSelect || null;
    this.options  = []; // [{val, label}]
    this.value    = '';
    this.label    = defaultLabel;
    this._build();
  }

  _build() {
    this.wrap.innerHTML = `
      <button class="sd-trigger" type="button">${this.label}</button>
      <div class="sd-panel">
        <div class="sd-list"></div>
      </div>`;
    this.trigger = this.wrap.querySelector('.sd-trigger');
    this.panel   = this.wrap.querySelector('.sd-panel');
    this.list    = this.wrap.querySelector('.sd-list');

    this.trigger.addEventListener('click', e => { e.stopPropagation(); this._toggle(); });
    document.addEventListener('click', () => this._close());
  }

  _toggle() {
    const open = this.panel.classList.contains('open');
    document.querySelectorAll('.sd-panel.open').forEach(p => {
      p.classList.remove('open');
      p.closest('.sd-wrap')?.querySelector('.sd-trigger')?.classList.remove('open');
    });
    if (!open) {
      this.panel.classList.add('open');
      this.trigger.classList.add('open');
      this._render();
    }
  }

  _close() {
    this.panel.classList.remove('open');
    this.trigger.classList.remove('open');
  }

  _render() {
    this.list.innerHTML = this.options.map(o =>
      `<div class="sd-item${this.value===o.val?' active':''}" data-val="${o.val}">${o.label}</div>`
    ).join('');
    this.list.querySelectorAll('.sd-item').forEach(el => {
      el.addEventListener('click', () => {
        this.value = el.dataset.val;
        this.hidden.value = this.value;
        this.trigger.textContent = el.textContent;
        this._close();
        if (this.onSelect) this.onSelect(this.value);
      });
    });
  }

  setOptions(opts) { // opts = [{val, label}]
    this.options = opts;
  }
}

// init mode dropdown
const _modeOpts = [
  { val:'1', label:'1 — ใส่คะแนน · แสดงทุกมหาวิทยาลัย ทุกคณะ/สาขา' },
  { val:'2', label:'2 — ใส่คะแนน · เลือกมหาวิทยาลัยที่สนใจ' },
  { val:'3', label:'3 — ใส่คะแนน · เลือกคณะที่สนใจ (ทุกมหาวิทยาลัย)' },
  { val:'4', label:'4 — ใส่คะแนน · เลือกมหาวิทยาลัย + คณะที่สนใจ' },
  { val:'5', label:'5 — ใส่คะแนน · เลือกมหาวิทยาลัย + คณะ + สาขา' },
  { val:'6', label:'6 — ไม่ใส่คะแนน · เลือกวิชาที่มี เพื่อดูคณะที่ตรงเกณฑ์' },
];
const _sdMode = new SimpleDropdown('sd-mode-wrap', 'check-mode', '1 — ใส่คะแนน · แสดงทุกมหาวิทยาลัย ทุกคณะ/สาขา', (val) => {
  onModeChange(val);
});
_sdMode.value = '1';
_sdMode.setOptions(_modeOpts);

// init searchable dropdowns
const _sdType   = new SearchableDropdown('sd-type',   'of-type',   'ทุกประเภท');
const _sdCampus = new SearchableDropdown('sd-campus', 'of-campus', 'ทุกวิทยาเขต');
const _sdFac    = new SearchableDropdown('sd-fac',    'of-fac',    'ทุกคณะ');

function populateSelect(id, options, defaultLabel) {
  // id = 'of-type' | 'of-campus' | 'of-fac' → route to searchable dropdown
  if (id === 'of-type')   { _sdType.setOptions(options);   return; }
  if (id === 'of-campus') { _sdCampus.setOptions(options); return; }
  if (id === 'of-fac')    { _sdFac.setOptions(options);    return; }
  // fallback สำหรับ select ปกติ
  const sel = document.getElementById(id);
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = `<option value="">— ${defaultLabel} —</option>` +
    options.map(o => `<option value="${o}"${o===cur?' selected':''}>${o}</option>`).join('');
}

function applyFilters() {
  const status  = document.getElementById('of-status')?.value  || '';
  const changed = document.getElementById('of-changed')?.value || '';
  const type    = document.getElementById('of-type')?.value    || '';
  const campus  = document.getElementById('of-campus')?.value  || '';
  const fac     = document.getElementById('of-fac')?.value     || '';

  let filtered = _allResults.filter(r => {
    if (status  === 'pass'    && r.status  !== 'pass')    return false;
    if (status  === 'fail'    && r.status  !== 'fail')    return false;
    if (changed === 'changed' && !r.changed)               return false;
    if (changed === 'same'    && r.changed)                return false;
    if (type    && r.program_type_name_th !== type)        return false;
    if (campus  && r.campus_name_th       !== campus)      return false;
    if (fac && r.group_field_th !== fac)         return false;
    return true;
  });

  const pass = filtered.filter(r => r.status === 'pass').length;
  const fail = filtered.filter(r => r.status === 'fail').length;
  document.getElementById('of-summary').textContent =
    `พบ ${filtered.length} สาขา (ผ่าน ${pass} / ไม่ผ่าน ${fail})`;

  renderPage(1, filtered);
}

function renderPage(page, data) {
  const list = data || _allResults;
  const PER  = 20;
  const total = list.length;
  const pages = Math.ceil(total / PER);
  page = Math.max(1, Math.min(page, pages));

  const slice = list.slice((page-1)*PER, page*PER);
  const container = document.getElementById('check-results');

  // group pass/fail
  const passItems = slice.filter(r => r.status === 'pass');
  const failItems = slice.filter(r => r.status === 'fail');
  let html = '';
  if (passItems.length) {
    html += `<div class="cr-section-label">ผ่านเกณฑ์ ${passItems.length} สาขา (หน้า ${page})</div>`;
    passItems.forEach((p,i) => { html += renderCheckCard(p, i, 'pass', _currentMode); });
  }
  if (failItems.length) {
    html += `<div class="cr-section-label" style="margin-top:14px">ไม่ผ่านเกณฑ์ ${failItems.length} สาขา</div>`;
    failItems.forEach((p,i) => { html += renderCheckCard(p, i, 'fail', _currentMode); });
  }
  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
  const barTop = document.getElementById('page-bar-top');
  const barBot = document.getElementById('page-bar');
  if (pages <= 1) {
    barTop.style.display = 'none';
    barBot.style.display = 'none';
    return;
  }
  barTop.style.display = 'flex';
  barBot.style.display = 'flex';
  barTop.innerHTML = '';
  barBot.innerHTML = '';

  const addBtn = (bar, label, pg, disabled, active) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'pg-btn' + (active ? ' active' : '');
    btn.disabled = disabled;
    btn.onclick = () => { applyFilters_page(pg, list); };
    bar.appendChild(btn);
  };

  const renderBar = (bar) => {
    addBtn(bar, '«', 1, page===1, false);
    addBtn(bar, '‹', page-1, page===1, false);
    let start = Math.max(1, page-2), end = Math.min(pages, page+2);
    for (let i = start; i <= end; i++) addBtn(bar, i, i, false, i===page);
    addBtn(bar, '›', page+1, page===pages, false);
    addBtn(bar, '»', pages, page===pages, false);
  };

  renderBar(barTop);
  renderBar(barBot);
}

// helper เพื่อ pass list ไปกับ page change
let _filteredCache = [];
function applyFilters_page(pg, list) {
  renderPage(pg, list);
}

// override applyFilters เพื่อ cache list
const _applyFiltersOrig = applyFilters;
function applyFilters() {
  const status  = document.getElementById('of-status')?.value  || '';
  const changed = document.getElementById('of-changed')?.value || '';
  const type    = document.getElementById('of-type')?.value    || '';
  const campus  = document.getElementById('of-campus')?.value  || '';
  const fac     = document.getElementById('of-fac')?.value     || '';

  _filteredCache = _allResults.filter(r => {
    if (status  === 'pass'    && r.status  !== 'pass')    return false;
    if (status  === 'fail'    && r.status  !== 'fail')    return false;
    if (changed === 'changed' && !r.changed)               return false;
    if (changed === 'same'    && r.changed)                return false;
    if (type    && r.program_type_name_th !== type)        return false;
    if (campus  && r.campus_name_th       !== campus)      return false;
    if (fac && r.group_field_th !== fac)         return false;
    return true;
  });

  const pass = _filteredCache.filter(r => r.status === 'pass').length;
  const fail = _filteredCache.filter(r => r.status === 'fail').length;
  document.getElementById('of-summary').textContent =
    `พบ ${_filteredCache.length} สาขา (ผ่าน ${pass} / ไม่ผ่าน ${fail})`;

  renderPage(1, _filteredCache);
}

function renderCheckCard(p, i, status, mode) {
  const warnBadge   = p.changed ? `<span class="cr-warn-badge"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="alert-triangle"></svg> เกณฑ์เปลี่ยน</span>` : '';
  const criteriaStr = Object.entries(p.scores).map(([k,w]) => `${subjectNames[k]||k} ${w}%`).join(' · ');
  const scoreDisp   = (mode === '6' || status === 'fail') ? '—' : p.total.toFixed(2);
  const chanceHtml  = (p.chance !== null && p.chance !== undefined && mode !== '6')
    ? `<span class="cr-chance">${p.chance}%</span>` : '';
  const seatsHtml   = p.receive_student_number ? `รับ ${p.receive_student_number} คน` : '';
  const typeHtml    = p.program_type_name_th   ? p.program_type_name_th : '';
  const campusHtml  = p.campus_name_th         ? p.campus_name_th : '';
  const logoHtml    = p.logo
    ? `<img src="${p.logo}" style="width:36px;height:36px;object-fit:contain;border-radius:6px" onerror="this.outerHTML='<span style=font-size:22px>🏫</span>'">`
    : `<span style="font-size:22px">🏫</span>`;
  const pJson = JSON.stringify(p).replace(/"/g, '&quot;');
  return `<div class="cr-card ${status}" onclick="openResultModal(${pJson})">
    <div class="cr-logo">${logoHtml}</div>
    <div class="cr-info">
      <div class="cr-uni">${p.university_name_th} ${warnBadge}</div>
      <div class="cr-fac">${p.faculty_name_th} — ${p.program_name_th}</div>
      <div class="cr-criteria">GPAX ≥ ${p.min_gpax} · ${criteriaStr} · รวมขั้นต่ำ ${p.min_total}</div>
      <div class="cr-meta">
        ${seatsHtml  ? `<span class="cr-meta-item"><svg data-lucide="users" width="11" height="11"></svg> ${seatsHtml}</span>` : ''}
        ${chanceHtml ? `<span class="cr-meta-item"><svg data-lucide="target" width="11" height="11"></svg> โอกาส ${chanceHtml}</span>` : ''}
        ${typeHtml   ? `<span class="cr-meta-item"><svg data-lucide="tag" width="11" height="11"></svg> ${typeHtml}</span>` : ''}
        ${campusHtml ? `<span class="cr-meta-item"><svg data-lucide="map-pin" width="11" height="11"></svg> ${campusHtml}</span>` : ''}
      </div>
    </div>
    <div class="cr-score">${scoreDisp}</div>
  </div>`;
}

function openResultModal(p) {
  if (typeof p === 'string') p = JSON.parse(p);

  const logoHtml = p.logo
    ? `<img src="${p.logo}" style="width:100%;height:100%;object-fit:contain;padding:4px" onerror="this.outerHTML='<span style=font-size:22px>🏫</span>'">`
    : `<span style="font-size:22px">🏫</span>`;

  const uniId = p.university_id || '';
  // หา campus name จาก universities_data.json โดยใช้ location
  let campusName = '';
  const campusUniMatch = allU.find(u => u.university_id === uniId);
  if (campusUniMatch) {
    const campusMatch = campusUniMatch.campuses.find(c => c.location === p.campus_name_th);
    if (campusMatch) {
      campusName = campusMatch.name;
    }
  }
  const imageSrc = campusName ? `views/${uniId}_${campusName}.jpg` : `views/${uniId}.jpg`;
  document.getElementById('result-modal-cover').innerHTML =
    `<div style="width:100%;height:200px;overflow:hidden;position:relative;background:var(--surface2);border-radius:14px 14px 0 0;">
      <img src="${imageSrc}" style="width:100%;height:100%;object-fit:cover;display:block;"
        onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,var(--surface) 100%)"></div>
    </div>`;

  document.getElementById('rm-logo').innerHTML   = logoHtml;
  document.getElementById('rm-uni').textContent     = p.university_name_th;
  document.getElementById('rm-fac').textContent     = p.faculty_name_th;
  document.getElementById('rm-prog').textContent    = p.program_name_th;
  document.getElementById('rm-project').textContent = p.project_name_th || '';

  // tags — เพิ่ม project_name_th ถ้ามี
  const tags = [p.program_type_name_th, p.campus_name_th].filter(Boolean);
  document.getElementById('rm-tags').innerHTML = tags
    .map(t => `<span class="modal-tag">${t}</span>`).join('');

  // คะแนน
  document.getElementById('rm-score').textContent = p.total ? p.total.toFixed(2) : '—';
  const breakdown = Object.entries(p.scores).map(([k,w]) => `${scoreNameTH(k)}(${w}%)`).join(' · ');
  document.getElementById('rm-score-breakdown').textContent = breakdown;

  // โอกาส
  const chance = p.chance !== null && p.chance !== undefined ? p.chance + '%' : '—';
  document.getElementById('rm-chance').textContent = chance;

  // รับนักศึกษา
  document.getElementById('rm-seats').textContent = p.receive_student_number || '—';

  // ค่าเทอม
  document.getElementById('rm-cost').textContent = p.cost || 'ไม่มีข้อมูล';

  // เกณฑ์ปีนี้
  let criteriaHtml = '';
  if (p.min_gpax > 0) criteriaHtml += `GPAX ขั้นต่ำ: <b>${p.min_gpax}</b><br>`;
  criteriaHtml += Object.entries(p.scores).map(([k,w]) => `${scoreNameTH(k)}: <b>${w}%</b>`).join('<br>');
  if (p.min_total > 0) criteriaHtml += `<br>คะแนนรวมขั้นต่ำ: <b>${p.min_total}</b>`;
  document.getElementById('rm-criteria').innerHTML = criteriaHtml;

  // เกณฑ์ปีที่แล้ว
  const lyScores = p.ly_scores || {};

  let lyCriteriaHtml = '';
  if (Object.keys(lyScores).length) {
    lyCriteriaHtml = Object.entries(lyScores).map(([k,w]) => `${scoreNameTH(k)}: <b>${w}%</b>`).join('<br>');
  } else {
    lyCriteriaHtml = '<span style="color:var(--muted)">ไม่มีข้อมูลปีที่แล้ว</span>';
  }
  document.getElementById('rm-ly-criteria').innerHTML = lyCriteriaHtml;

  // คะแนนต่ำสุด/สูงสุด + รับกี่คน
  let lyStatsHtml = '';
  if (p.ly_min_score || p.ly_min_score_ds) {
    const orange = 'color:#f97316;font-weight:700';
    lyStatsHtml += `<div style="margin-bottom:4px"><b>คะแนนต่ำสุด / สูงสุด</b></div>`;
    if (p.ly_min_score && p.ly_max_score)
      lyStatsHtml += `<div>ครั้งที่ 1 &nbsp;<span style="${orange}">${p.ly_min_score.toFixed(4)}</span> / ${p.ly_max_score.toFixed(1)}</div>`;
    if (p.ly_min_score_ds && p.ly_max_score_ds)
      lyStatsHtml += `<div>ครั้งที่ 2 &nbsp;<span style="${orange}">${p.ly_min_score_ds.toFixed(4)}</span> / ${p.ly_max_score_ds.toFixed(1)}</div>`;
    if (p.ly_receive_number)
      lyStatsHtml += `<div style="margin-top:4px">จำนวนรับ &nbsp;<span style="color:#3b82f6;font-weight:700">${p.ly_receive_number}</span></div>`;
  }
  document.getElementById('rm-ly-stats').innerHTML = lyStatsHtml;

  document.getElementById('rm-warn').style.display = p.changed ? 'block' : 'none';

  // ปุ่ม
  document.getElementById('rm-mytcas-btn').href =
    `https://course.mytcas.com/programs/${p.program_id}`;

  // หาข้อมูลมหาลัยจาก uniData เพื่อลิงก์ไปหน้ามหาลัย
  const uniMatch = allU.find(u =>
    (u.name_th || u.university_name_th) === p.university_name_th
  );
  const uniBtn = document.getElementById('rm-uni-btn');
  if (uniMatch && uniMatch.link) {
    uniBtn.href = uniMatch.link;
    uniBtn.style.display = 'flex';
  } else {
    uniBtn.href = `https://www.google.com/search?q=${encodeURIComponent(p.university_name_th)}`;
    uniBtn.style.display = 'flex';
  }

  document.getElementById('result-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function closeResultModal(e) {
  if (e.target === document.getElementById('result-modal-overlay')) closeResultModalDirect();
}
function closeResultModalDirect() {
  const resultModalBody = document.querySelector('#result-modal .modal-body');
  if (resultModalBody) {
    resultModalBody.scrollTop = 0;
  }
  document.getElementById('result-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== UNIVERSITIES =====
// ===== UNIVERSITIES =====
let allU    = [];
let uLoaded = false;

fetch('universities_data.json')
  .then(r => r.json())
  .then(data => {
    allU = data;
    if (uLoaded) renderU(allU);
  });

function loadU() {
  uLoaded = true;
  if (allU.length) renderU(allU);
}

function renderU(list) {
  document.getElementById('ucount').textContent = 'พบ ' + list.length + ' สถาบัน';
  if (!list.length) {
    document.getElementById('ulist').innerHTML = '<div class="no-res">ไม่พบสถาบันที่ค้นหา</div>';
    return;
  }
  document.getElementById('ulist').innerHTML =
    '<div class="uni-grid">' +
    list.map((u, i) => {
      const idx = allU.indexOf(u);
      const logoHtml = `<img src="logos/${u.university_id}.png" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.outerHTML='<span style=font-size:20px>🏫</span>'">`;
      return `<div class="uitem" onclick="openModal(${idx})">
        <div class="ulogo">${logoHtml}</div>
        <div class="uname">${u.name_th}</div>
      </div>`;
    }).join('') +
    '</div>';
}

function filterU() {
  const q = document.getElementById('usearch').value.toLowerCase();
  renderU(allU.filter(u => u.name_th.toLowerCase().includes(q) || u.name_en.toLowerCase().includes(q)));
}

// ===== UNI MODAL =====
let _currentUni = null;

function openModal(idx) {
  _currentUni = allU[idx];
  if (!_currentUni) return;
  const u = _currentUni;
  const firstCampus = u.campuses[0];
  renderCampusSidebar(u, 0);
  renderModalContent(u, firstCampus);
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function updateCampusSelectorVisibility() {
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const sidebar = document.getElementById('campus-sidebar');
  const dropWrap = document.getElementById('campus-dropdown-wrap');

  if (!sidebar || !dropWrap) return;
  sidebar.style.display = isMobile ? 'none' : 'flex';
  dropWrap.style.display = isMobile ? 'block' : 'none';
}

function renderCampusSidebar(u, activeIdx) {
  const sidebar = document.getElementById('campus-sidebar');
  const dropWrap = document.getElementById('campus-dropdown-wrap');
  const hasCampuses = u.campuses.length > 1;

  if (!hasCampuses) {
    sidebar.innerHTML = '';
    sidebar.style.display = 'none';
    dropWrap.style.display = 'none';
    return;
  }

  // desktop sidebar
  sidebar.innerHTML = `
    <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding:0 4px">วิทยาเขต</div>
    ${u.campuses.map((c, i) => `
      <button class="campus-item ${i === activeIdx ? 'active' : ''}" onclick="switchCampus(${i})">
        <span class="campus-item-dot"></span>
        <div>
          <div style="font-size:13px;font-weight:600;color:inherit">${c.name}</div>
          <div style="font-size:11px;color:var(--muted)">${c.location}</div>
        </div>
      </button>
    `).join('')}
  `;

  // mobile dropdown
  const sdId = 'sd-campus-modal';
  // destroy old if exists
  document.getElementById(sdId).innerHTML = '';
  const sd = new SimpleDropdown(sdId, 'campus-modal-hidden', `${u.campuses[activeIdx].name} · ${u.campuses[activeIdx].location}`, (val) => {
    const i = Number(val);
    if (!Number.isNaN(i) && i >= 0 && i < u.campuses.length) switchCampus(i);
  });
  sd.setOptions(u.campuses.map((c, i) => ({ val: String(i), label: c.name + ' · ' + c.location })));
  sd.value = String(activeIdx);
  sd.trigger.textContent = u.campuses[activeIdx].name + ' · ' + u.campuses[activeIdx].location;

  // update visibility based on screen width
  updateCampusSelectorVisibility();

  window.addEventListener('resize', updateCampusSelectorVisibility);
}

function switchCampus(idx) {
  if (!_currentUni) return;
  const campus = _currentUni.campuses[idx];
  // update sidebar active
  document.querySelectorAll('.campus-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  // update dropdown selection (if visible)
  const sdTrigger = document.querySelector('#sd-campus-modal .sd-trigger');
  if (sdTrigger) {
    sdTrigger.textContent = `${campus.name} · ${campus.location}`;
    const hidden = document.getElementById('campus-modal-hidden');
    if (hidden) hidden.value = String(idx);
  }

  // update map + location only
  const mapQuery = Number.isFinite(campus.lat) && Number.isFinite(campus.lng)
    ? `${campus.lat},${campus.lng}`
    : `${_currentUni.name_th} ${campus.name}`;
  const mapQ = encodeURIComponent(mapQuery);

  document.getElementById('modal-map').innerHTML =
    `<iframe src="https://maps.google.com/maps?q=${mapQ}&t=&z=15&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy"></iframe>`;
  document.getElementById('modal-map-link').href =
    `https://www.google.com/maps/search/?api=1&query=${mapQ}`;
  document.getElementById('modal-cover').innerHTML =
    `<div style="width:100%;height:200px;overflow:hidden;position:relative;background:var(--surface2);border-radius:14px 14px 0 0;">
      <img src="views/${_currentUni.university_id}_${campus.name}.jpg" style="width:100%;height:100%;object-fit:cover;display:block;"
        onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,var(--surface) 100%)"></div>
    </div>`;
  // update location tag
  const tags = document.getElementById('modal-tags');
  const items = tags.querySelectorAll('.modal-tag');
  if (items.length >= 2) items[1].textContent = campus.location;
  // update founded, location, and desc in modal-info and modal-desc
  const infoItems = document.querySelectorAll('.modal-info-item');
  if (infoItems.length >= 4) {
    infoItems[0].querySelector('.modal-info-val').textContent = `พ.ศ. ${campus.founded}`;
    infoItems[2].querySelector('.modal-info-val').textContent = campus.location;
  }
  document.getElementById('modal-desc').textContent = campus.desc;
}

function renderModalContent(u, campus) {
  const logoHtml = `<img src="logos/${u.university_id}.png" style="width:100%;height:100%;object-fit:contain;padding:4px" onerror="this.outerHTML='<span style=font-size:22px>🏫</span>'">`;
  const mapQuery = Number.isFinite(campus.lat) && Number.isFinite(campus.lng)
    ? `${campus.lat},${campus.lng}`
    : `${u.name_th} ${campus.name}`;
  const mapQ = encodeURIComponent(mapQuery);

  document.getElementById('modal-cover').innerHTML =
    `<div style="width:100%;height:200px;overflow:hidden;position:relative;background:var(--surface2);border-radius:14px 14px 0 0;">
      <img src="views/${u.university_id}_${campus.name}.jpg" style="width:100%;height:100%;object-fit:cover;display:block;"
        onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,var(--surface) 100%)"></div>
    </div>`;

  document.getElementById('modal-logo').innerHTML    = logoHtml;
  document.getElementById('modal-name').textContent  = u.name_th;
  document.getElementById('modal-name-en').textContent = u.name_en;

  document.getElementById('modal-tags').innerHTML =
    [u.type, campus.location].filter(Boolean)
      .map(t => `<span class="modal-tag">${t}</span>`).join('');

  document.getElementById('modal-info').innerHTML = `
    <div class="modal-info-item"><div class="modal-info-label">ก่อตั้ง</div><div class="modal-info-val">พ.ศ. ${campus.founded}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">นักศึกษา</div><div class="modal-info-val">${u.students}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">ที่ตั้ง</div><div class="modal-info-val">${campus.location}</div></div>
    <div class="modal-info-item"><div class="modal-info-label">ประเภท</div><div class="modal-info-val">${u.type}</div></div>
  `;

  document.getElementById('modal-desc').textContent = campus.desc;

  document.getElementById('modal-map').innerHTML =
    `<iframe src="https://maps.google.com/maps?q=${mapQ}&t=&z=15&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy"></iframe>`;
  document.getElementById('modal-map-link').href =
    `https://www.google.com/maps/search/?api=1&query=${mapQ}`;
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}

function closeModalDirect() {
  const modalBody = document.getElementById('modal-body');
  if (modalBody) {
    modalBody.scrollTop = 0;
  }
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
});

// init Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
