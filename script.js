/* ═══════════════════════════════════════════
   HEXALABSTUDIO — script.js v4.0
═══════════════════════════════════════════ */

// ── CUSTOM CURSOR ──────────────────────────
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mX = window.innerWidth/2, mY = window.innerHeight/2;
let rX = mX, rY = mY;

if (cursor && cursorRing) {
  document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    cursor.style.left = `${mX}px`;
    cursor.style.top  = `${mY}px`;
  }, { passive: true });

  // Ring lags behind
  (function ringLoop() {
    rX += (mX - rX) * 0.1;
    rY += (mY - rY) * 0.1;
    cursorRing.style.left = `${rX}px`;
    cursorRing.style.top  = `${rY}px`;
    requestAnimationFrame(ringLoop);
  })();

  document.querySelectorAll('a,button,.map-tab,.stat-card,.project-card,.hero-img-frame')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

// ── GRID CANVAS BACKGROUND ─────────────────
const bgCanvas = document.getElementById('bg-canvas');
if (bgCanvas) {
  const bc = bgCanvas.getContext('2d');
  const resize = () => { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; drawGrid(); };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function drawGrid() {
    bc.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    const step = 64;
    bc.strokeStyle = 'rgba(0,240,255,0.04)';
    bc.lineWidth = 1;
    for (let x = 0; x <= bgCanvas.width; x += step) {
      bc.beginPath(); bc.moveTo(x, 0); bc.lineTo(x, bgCanvas.height); bc.stroke();
    }
    for (let y = 0; y <= bgCanvas.height; y += step) {
      bc.beginPath(); bc.moveTo(0, y); bc.lineTo(bgCanvas.width, y); bc.stroke();
    }
    bc.fillStyle = 'rgba(0,240,255,0.07)';
    for (let x = 0; x <= bgCanvas.width; x += step) {
      for (let y = 0; y <= bgCanvas.height; y += step) {
        bc.beginPath(); bc.arc(x, y, 1.5, 0, Math.PI * 2); bc.fill();
      }
    }
  }
}

// ── PARTICLE CANVAS (cyan/violet energy) ───
const ptCanvas = document.getElementById('pt-canvas');
if (ptCanvas) {
  const pc = ptCanvas.getContext('2d');
  ptCanvas.width  = window.innerWidth;
  ptCanvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    ptCanvas.width  = window.innerWidth;
    ptCanvas.height = window.innerHeight;
  }, { passive: true });

  const COLORS = ['#00f0ff', '#6b2fff', '#8f5fff', '#00c4d4', '#ffe066'];
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * ptCanvas.width;
      this.y    = ptCanvas.height + 10;
      this.vx   = (Math.random() - 0.5) * 0.8;
      this.vy   = -(0.4 + Math.random() * 1.6);
      this.size = 0.8 + Math.random() * 2.5;
      this.col  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life = 0;
      this.max  = 120 + Math.random() * 180;
      this.wobble = Math.random() * Math.PI * 2;
    }
    tick() {
      this.wobble += 0.03;
      this.x += this.vx + Math.sin(this.wobble) * 0.3;
      this.y += this.vy;
      this.life++;
      if (this.life > this.max || this.y < -10) this.reset();
    }
    draw() {
      const p = this.life / this.max;
      const a = p < 0.15 ? p / 0.15 : 1 - ((p - 0.15) / 0.85);
      pc.save();
      pc.globalAlpha = a * 0.6;
      pc.shadowBlur  = 8;
      pc.shadowColor = this.col;
      pc.fillStyle   = this.col;
      pc.beginPath();
      pc.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      pc.fill();
      pc.restore();
    }
  }

  const particles = Array.from({ length: 60 }, () => {
    const p = new Particle();
    p.life = Math.random() * p.max;
    return p;
  });

  (function ptLoop() {
    pc.clearRect(0, 0, ptCanvas.width, ptCanvas.height);
    particles.forEach(p => { p.tick(); p.draw(); });
    requestAnimationFrame(ptLoop);
  })();
}

// ── SCROLL PROGRESS ────────────────────────
const progressBar = document.getElementById('scroll-progress-bar');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = h > 0 ? `${(scrollY / h) * 100}%` : '0%';
}, { passive: true });

// ── REVEAL ─────────────────────────────────
const revEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revEls.forEach(el => obs.observe(el));
} else {
  revEls.forEach(el => el.classList.add('in-view'));
}

// ── NAV TOGGLE ─────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('main-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const o = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!o));
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false');
  }));
}

// ── YEAR ───────────────────────────────────
document.querySelectorAll('#current-year').forEach(el => el.textContent = new Date().getFullYear());

// ── HUD CLOCK ──────────────────────────────
const hudClock = document.querySelector('.hud-clock');
if (hudClock) {
  const tick = () => {
    const n = new Date();
    const pad = v => String(v).padStart(2,'0');
    hudClock.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  };
  tick(); setInterval(tick, 1000);
}

// ── TYPEWRITER ─────────────────────────────
document.querySelectorAll('.hud-type').forEach(el => {
  const txt = el.textContent; el.textContent = '';
  let i = 0;
  const type = () => { if (i < txt.length) { el.textContent += txt[i++]; setTimeout(type, 35 + Math.random() * 25); } };
  setTimeout(type, 500 + Math.random() * 400);
});

// ── COUNTDOWN ──────────────────────────────
const cdWrap = document.querySelector('[data-countdown]');
if (cdWrap) {
  const target = new Date(); target.setDate(target.getDate() + 60); target.setHours(0,0,0,0);
  const dEl = cdWrap.querySelector('[data-cd-days]');
  const hEl = cdWrap.querySelector('[data-cd-hours]');
  const mEl = cdWrap.querySelector('[data-cd-mins]');
  const sEl = cdWrap.querySelector('[data-cd-secs]');
  const p = v => String(v).padStart(2,'0');
  const upd = () => {
    const d = Math.max(0, target - Date.now());
    if (dEl) dEl.textContent = p(Math.floor(d/86400000));
    if (hEl) hEl.textContent = p(Math.floor((d%86400000)/3600000));
    if (mEl) mEl.textContent = p(Math.floor((d%3600000)/60000));
    if (sEl) sEl.textContent = p(Math.floor((d%60000)/1000));
  };
  upd(); setInterval(upd, 1000);
}

// ── STAT COUNTER ───────────────────────────
const statNums = document.querySelectorAll('.stat-num[data-target]');
const coObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const suf = el.dataset.suffix || '';
    const pre = el.dataset.prefix || '';
    const isInt = Number.isInteger(target);
    const dur = 1800, t0 = performance.now();
    const run = now => {
      const prog = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 4);
      el.textContent = pre + (isInt ? Math.floor(ease*target) : (ease*target).toFixed(1)) + suf;
      if (prog < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
    coObs.unobserve(el);
  });
}, { threshold: 0.5 });
statNums.forEach(el => coObs.observe(el));

// ── MAPS TABS ──────────────────────────────
const mapsData = {
  aldea: {
    title: 'Aldea Aclamada', type: 'CQC · CONTROL',
    desc: 'Combates tácticos en calles estrechas, rutas laterales y control de posiciones elevadas. La densidad del mapa favorece las granadas y el juego de esquinas cerradas.',
    traits: ['🏘️ Urbano','⚔️ CQC','🎯 Control de zona','📐 Altura táctica']
  },
  industrias: {
    title: 'Industrias Inodoras', type: 'MID · PRECISIÓN',
    desc: 'Escenario industrial con líneas largas para duelos de precisión y rotaciones rápidas. Ideal para rifles y francotiradores con posiciones estratégicas.',
    traits: ['🏭 Industrial','🎯 Larga distancia','🔄 Rotaciones','🔫 Sniper']
  },
  barrio: {
    title: 'Barrio Buenavista', type: 'MID · FLANQUEO',
    desc: 'Mapa urbano de ritmo medio con flanqueos constantes y zonas de alto riesgo/recompensa. Múltiples alturas, callejones secretos y rutas alternativas.',
    traits: ['🌆 Urbano','⚡ Flanqueos','🏆 Alto riesgo','🗺️ Multiruta']
  },
  granero: {
    title: 'Granero Grietoso', type: 'ABIERTO · DINÁMICO',
    desc: 'Ambiente rural abierto con enfrentamientos dinámicos entre cobertura natural y estructuras agrícolas. Visibilidad larga y peleas en campo abierto.',
    traits: ['🌾 Rural','🏔️ Campo abierto','🌿 Cobertura','💨 Movilidad']
  }
};
const progMap = { aldea:'25%', industrias:'50%', barrio:'75%', granero:'100%' };

const mapTabs  = document.querySelectorAll('.map-tab');
const mapTitle = document.getElementById('map-title');
const mapDesc  = document.getElementById('map-description');
const mapType  = document.querySelector('.map-type-tag');
const mapTraits= document.querySelector('.map-traits');
const mapFill  = document.getElementById('map-progress-fill');
const keys = Object.keys(mapsData);
let idx = 0;

function setMap(key) {
  const d = mapsData[key]; if (!d) return;
  mapTabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  const active = document.querySelector(`.map-tab[data-map="${key}"]`);
  if (active) { active.classList.add('active'); active.setAttribute('aria-selected','true'); }
  if (mapTitle) { mapTitle.style.opacity='0'; mapDesc.style.opacity='0'; }
  setTimeout(() => {
    if (mapTitle) mapTitle.textContent = d.title;
    if (mapDesc)  mapDesc.textContent  = d.desc;
    if (mapType)  mapType.textContent  = d.type;
    if (mapTraits) mapTraits.innerHTML = d.traits.map(t=>`<span class="map-trait">${t}</span>`).join('');
    if (mapFill)  mapFill.style.width  = progMap[key];
    if (mapTitle) { mapTitle.style.opacity='1'; mapDesc.style.opacity='1'; }
  }, 160);
}

mapTabs.forEach(tab => tab.addEventListener('click', () => {
  clearInterval(mapCycle);
  idx = keys.indexOf(tab.dataset.map);
  setMap(tab.dataset.map);
}));

let mapCycle = setInterval(() => { idx = (idx+1)%keys.length; setMap(keys[idx]); }, 5000);

// ── PARALLAX HERO BG ───────────────────────
const heroBgImg = document.querySelector('.hero-bg img');
window.addEventListener('scroll', () => {
  if (heroBgImg) heroBgImg.style.transform = `translateY(${scrollY * 0.22}px)`;
}, { passive: true });

// ── HERO IMAGE TILT ────────────────────────
const heroFrame = document.querySelector('.hero-img-frame');
if (heroFrame && matchMedia('(pointer:fine)').matches) {
  heroFrame.addEventListener('mousemove', e => {
    const r = heroFrame.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    heroFrame.style.transform = `perspective(1000px) rotateX(${y*-10}deg) rotateY(${x*10}deg) scale(1.02)`;
  });
  heroFrame.addEventListener('mouseleave', () => { heroFrame.style.transform = ''; });
}

// ── LOGO MARK PARTICLE BURST on hover ──────
const logoMark = document.querySelector('.brand-logo');
if (logoMark && ptCanvas) {
  const pc2 = document.getElementById('pt-canvas').getContext('2d');
  logoMark.addEventListener('mouseenter', () => {
    const r = logoMark.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      // shoot mini particles outward — piggyback on ptCanvas
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      let x = cx, y = cy, life = 0, max = 40;
      const col = ['#00f0ff','#ffe066','#6b2fff'][Math.floor(Math.random()*3)];
      (function burst() {
        if (life++ > max) return;
        pc2.save();
        pc2.globalAlpha = (1 - life/max) * 0.85;
        pc2.shadowBlur = 10; pc2.shadowColor = col;
        pc2.fillStyle = col;
        pc2.beginPath();
        pc2.arc(x += vx * (1 - life/max), y += vy * (1 - life/max), 2.5*(1-life/max), 0, Math.PI*2);
        pc2.fill(); pc2.restore();
        requestAnimationFrame(burst);
      })();
    }
  });
}

// ── MAGNETIC BUTTONS ───────────────────────
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2)  * 0.3;
    const y = (e.clientY - r.top  - r.height/2) * 0.3;
    btn.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});
