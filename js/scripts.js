document.documentElement.classList.add('js');

document.getElementById('year').textContent = new Date().getFullYear();

// GitHub Pages sends Last-Modified on deploy, so this tracks the real last update.
document.getElementById('revised').textContent =
    new Date(document.lastModified).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

document.getElementById('print').addEventListener('click', () => window.print());

// Total experience, counted from Nov 2020 (Junior Business Analyst) so it stays current.
const tenureEl = document.getElementById('tenure');
const now = new Date();
const months = (now.getFullYear() - 2020) * 12 + now.getMonth() - 10;
const yrs = Math.floor(months / 12), mos = months % 12;
const tenureText = `${yrs} yrs` + (mos ? ` ${mos} mo${mos > 1 ? 's' : ''}` : '');
if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let n = 0;
    tenureEl.textContent = '0 yrs';
    const tick = setInterval(() => {
        if (++n >= yrs) { clearInterval(tick); tenureEl.textContent = tenureText; }
        else tenureEl.textContent = `${n} yrs`;
    }, 140);
} else {
    tenureEl.textContent = tenureText;
}

// Split the corrected line into words so it "writes in" one word at a time.
const ins = document.getElementById('ins');
const words = ins.textContent.trim().split(/\s+/);
ins.textContent = '';
words.forEach((w, i) => {
    const s = document.createElement('span');
    s.textContent = w;
    s.style.setProperty('--i', i);
    ins.append(s, ' ');
});

// Reveal sections and the sign-off as they scroll into view.
const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.sec, .signoff').forEach(el => io.observe(el));

// Red-pen cursor: fading ink trail + a ring that circles links. Mouse only, and off for reduced motion.
if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    const root = document.documentElement;
    const cv = document.createElement('canvas');
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    cv.className = 'ink'; ring.className = 'pen-ring'; dot.className = 'pen-dot';
    document.body.append(cv, ring, dot);
    root.classList.add('pen', 'away');

    const ctx = cv.getContext('2d');
    const size = () => {
        const r = devicePixelRatio || 1;
        cv.width = innerWidth * r; cv.height = innerHeight * r;
        ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    size();
    addEventListener('resize', size);

    let red;
    const readRed = () => { red = getComputedStyle(root).getPropertyValue('--red').trim(); };
    readRed();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readRed);

    const LIFE = 650;               // ms an ink stroke takes to fade
    const pts = [];
    let mx = 0, my = 0, rx = 0, ry = 0;

    addEventListener('pointermove', e => {
        if (root.classList.contains('away')) { rx = e.clientX; ry = e.clientY; }
        root.classList.remove('away');
        mx = e.clientX; my = e.clientY;
        pts.push({ x: mx, y: my, t: performance.now() });
        dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    root.addEventListener('mouseleave', () => root.classList.add('away'));
    document.addEventListener('pointerover', e => ring.classList.toggle('hot', !!e.target.closest('a, button')));
    addEventListener('pointerdown', () => ring.classList.add('press'));
    addEventListener('pointerup', () => ring.classList.remove('press'));

    (function frame(now) {
        while (pts.length && now - pts[0].t > LIFE) pts.shift();
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.strokeStyle = red;
        ctx.lineCap = 'round';
        for (let i = 1; i < pts.length; i++) {
            const k = 1 - (now - pts[i].t) / LIFE;   // 1 = fresh ink, 0 = gone
            ctx.globalAlpha = k * 0.55;
            ctx.lineWidth = 0.5 + k * 2.5;
            ctx.beginPath();
            ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
            ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
        }
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(frame);
    })(performance.now());
}

// Track changes: show or hide the reviewer markup.
const track = document.getElementById('track');
track.addEventListener('click', () => {
    const clean = document.body.classList.toggle('clean');
    track.setAttribute('aria-pressed', String(!clean));
});
