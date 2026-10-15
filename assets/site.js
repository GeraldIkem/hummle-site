// Hummle website behaviour. No third-party code, no tracking, nothing stored.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Hero: the page reads itself, and you choose the reader ----------
const VOICES = [
  { id: 'mara', name: 'Mara', accent: 'North American English', title: 'The Letter', text: 'The kettle had gone cold an hour ago, and still she sat by the window, turning the letter over in her hands. Some news arrives quietly. This was that kind: gentle on the page, and impossible to put down.' },
  { id: 'elias', name: 'Elias', accent: 'North American English', title: 'Dawn', text: 'He checked the map one last time, then folded it away. Forty miles of open road, one tank of fuel, and a promise he intended to keep. “We leave at dawn,” he said. “Not a minute later.”' },
  { id: 'june', name: 'June', accent: 'Canadian English', title: 'The Robot', text: 'June laughed before she could stop herself. “You built a robot to water your plants? Theo, you own one cactus.” Still, she leaned closer, curious, as the little machine whirred to life.' },
  { id: 'theo', name: 'Theo', accent: 'North American English', title: 'Lights Out', text: 'Nobody moved. The lights flickered once, twice, and then the hum of the generator died. Theo let the silence stretch. “Okay,” he said quietly. “Everyone stay exactly where you are.”' },
  { id: 'nadia', name: 'Nadia', accent: 'Southern British English', title: 'Too Neat', text: 'The evidence was neat. Too neat. Nadia set the photograph down and studied it the way she studied people: patiently, from every angle, waiting for the one detail that refused to belong.' },
  { id: 'idris', name: 'Idris', accent: 'Nigerian English', title: 'Rain in July', text: 'My grandfather told stories the way rain falls in July: slowly at first, then all at once. “Sit down,” he would say, smiling. “This one is long, and every word of it is true.”' },
  { id: 'clara', name: 'Clara', accent: 'British English', title: 'Two Cups', text: 'Clara poured two cups and slid one across the table. “You’ve been avoiding me,” she said, not unkindly. “So let’s have it. What did you break, and how much is it going to cost?”' },
  { id: 'arthur', name: 'Arthur', accent: 'British English', title: 'The Lighthouse', text: 'The old lighthouse had outlasted three keepers and a war. Arthur climbed its stairs each evening, one hand on the rail, counting the steps aloud. He did it not because he might forget, but because they deserved it.' },
  { id: 'sade', name: 'Sade', accent: 'Nigerian English', title: 'Nine O’Clock', text: 'Sade closed the shop at nine, as always, and counted the till by lamplight. Outside, the street was soft with rain. Then someone knocked, twice and politely, and she knew exactly who it was.' },
  { id: 'luca', name: 'Luca', accent: 'North American English', title: 'Together', text: 'Luca kept his voice low. “If we do this, we do it together. No secrets, no running.” He held out his hand, waited, and felt the tension leave his shoulders when she finally took it.' },
];

(() => {
  const root = document.querySelector('[data-reader]');
  if (!root) return;
  const script = root.querySelector('[data-script]');
  const playBtn = root.querySelector('[data-play]');
  const facesList = root.querySelector('[data-faces]');
  const PACE = { subtle: { word: 250, pause: 0.75 }, natural: { word: 270, pause: 1 }, dramatic: { word: 300, pause: 1.7 } };
  let voice = 0, words = [], i = 0, timer = null, paused = false, chosen = false, visible = true, expr = 'natural';

  function setText(v) {
    script.textContent = '';
    v.text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { script.append(part); return; }
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = part;
      script.append(s);
    });
    words = [...script.querySelectorAll('.w')];
    root.querySelector('[data-title]').textContent = v.title;
    root.querySelector('[data-name]').textContent = v.name;
    root.querySelector('[data-accent]').textContent = v.accent;
    const face = root.querySelector('[data-face]');
    face.src = `voices/${v.id}-sm.webp`;
    i = 0;
    paint();
  }
  function paint() { words.forEach((w, k) => { w.classList.toggle('read', k < i); w.classList.toggle('now', k === i); }); }
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(step, ms); }
  function step() {
    if (paused || !visible) return;
    const w = words[i] ? words[i].textContent : '';
    const p = PACE[expr];
    i += 1;
    if (i > words.length) {
      // End of the passage: a breath, then the next reader (unless you picked one).
      if (!chosen) { voice = (voice + 1) % VOICES.length; select(voice, false); }
      else { i = 0; paint(); }
      schedule(1500);
      return;
    }
    paint();
    const pause = /[.?!”]$/.test(w) ? 700 : /[,;:]$/.test(w) ? 330 : 0;
    schedule(p.word + pause * p.pause);
  }
  function select(n, byUser) {
    voice = n;
    if (byUser) chosen = true;
    setText(VOICES[n]);
    facesList.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === n)));
  }
  function setPaused(p) {
    paused = p;
    root.classList.toggle('paused', p);
    playBtn.setAttribute('aria-label', p ? 'Play the demo' : 'Pause the demo');
    if (!p) schedule(200); else clearTimeout(timer);
  }

  // Reader faces
  VOICES.forEach((v, n) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `${v.name}, ${v.accent}`);
    b.setAttribute('aria-pressed', String(n === 0));
    b.innerHTML = `<img src="voices/${v.id}-sm.webp" alt="" width="52" height="52">`;
    b.addEventListener('click', () => { select(n, true); if (!reduce) { setPaused(false); } });
    li.append(b);
    facesList.append(li);
  });
  root.querySelector('[data-cast]').hidden = false;

  root.querySelectorAll('[data-expr]').forEach((b) => b.addEventListener('click', () => {
    expr = b.dataset.expr;
    root.dataset.expr = expr;
    root.querySelectorAll('.seg [data-expr]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  playBtn.addEventListener('click', () => setPaused(!paused));

  select(0, false);
  if (reduce) {
    // Still frame: the first sentence is read, nothing moves.
    const end = words.findIndex((w) => /[.?!]$/.test(w.textContent));
    i = end + 1; paint();
    root.classList.add('paused');
    playBtn.hidden = true;
    return;
  }
  // Stop when the hero is off screen or the tab is hidden.
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !paused) schedule(300); }).observe(root);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible && !paused) schedule(300); });
  schedule(900);
})();

// ---------- Waveforms that grow when they come into view ----------
document.querySelectorAll('svg[data-wave]').forEach((svg) => {
  const hs = svg.dataset.wave.split(',').map(Number);
  const w = 300 / hs.length;
  svg.innerHTML = hs.map((h, k) => {
    const bh = Math.max(h * 2.2, 3);
    return `<rect x="${k * w + 1}" y="${30 - bh / 2}" width="${w - 3}" height="${bh}" rx="2" fill="${h ? svg.dataset.color : '#DED8D2'}" style="transition-delay:${k * 18}ms"/>`;
  }).join('');
});
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.4 });
  document.querySelectorAll('[data-inview]').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('[data-inview]').forEach((el) => el.classList.add('in'));
}

// ---------- Tabs (arrow keys move between them) ----------
document.querySelectorAll('[data-tabs]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function choose(t, focus) {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => choose(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') { e.preventDefault(); choose(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); choose(tabs[tabs.length - 1], true); }
      if (d) { e.preventDefault(); choose(tabs[(k + d + tabs.length) % tabs.length], true); }
    });
  });
});

// ---------- Sound mixer sliders ----------
document.querySelectorAll('[data-mixer] input[type="range"]').forEach((r) => {
  const out = r.parentElement.querySelector('output');
  r.addEventListener('input', () => { out.textContent = r.value; });
});

// ---------- Privacy: switch the internet off ----------
(() => {
  const house = document.querySelector('[data-house]');
  if (!house) return;
  const net = house.querySelector('[data-net]');
  const msg = house.querySelector('[data-net-msg]');
  net.addEventListener('change', () => {
    house.classList.toggle('offline', !net.checked);
    msg.textContent = net.checked
      ? 'Only used to download voices once, and for web pages you open yourself.'
      : 'Still reading. Hummle doesn’t need the internet to do its job.';
  });
})();

// ---------- The flock: drag the birds around ----------
document.querySelectorAll('[data-flock]').forEach((flock) => {
  let z = 5;
  flock.querySelectorAll('.fl').forEach((bird) => {
    bird.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      bird.setPointerCapture(e.pointerId);
      bird.style.zIndex = ++z;
      const box = flock.getBoundingClientRect();
      const startX = e.clientX - bird.offsetLeft, startY = e.clientY - bird.offsetTop;
      const move = (ev) => {
        const x = Math.min(Math.max(ev.clientX - startX, -20), box.width - bird.offsetWidth + 20);
        const y = Math.min(Math.max(ev.clientY - startY, -60), box.height - bird.offsetHeight + 10);
        bird.style.left = x + 'px';
        bird.style.top = y + 'px';
      };
      const up = () => { bird.removeEventListener('pointermove', move); bird.removeEventListener('pointerup', up); };
      bird.addEventListener('pointermove', move);
      bird.addEventListener('pointerup', up);
    });
  });
});

// ---------- Voices page: filter by who and by accent ----------
(() => {
  const bar = document.querySelector('[data-filters]');
  if (!bar) return;
  const cards = [...document.querySelectorAll('[data-tags]')];
  const count = document.querySelector('[data-count]');
  bar.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    bar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f;
    let n = 0;
    cards.forEach((c) => { const show = f === 'all' || c.dataset.tags.split(' ').includes(f); c.hidden = !show; if (show) n++; });
    if (count) count.textContent = `${n} of ${cards.length} voices shown`;
  }));
})();
