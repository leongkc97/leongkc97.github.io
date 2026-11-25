const root = document.documentElement;
root.classList.add('js');
const kick = { x: 0, y: 0 };   // visual shove on the pixel cursor when Pixel KC's attacks land

// Theme: dark by default, light remembered per visitor (the <head> script applies it before paint).
const themeBtn = document.getElementById('theme');
const showThemeLabel = () => { themeBtn.textContent = root.dataset.theme === 'light' ? 'Dark mode' : 'Light mode'; };
showThemeLabel();
themeBtn.addEventListener('click', () => {
    const light = root.dataset.theme !== 'light';
    if (light) root.dataset.theme = 'light'; else delete root.dataset.theme;
    try { localStorage.theme = light ? 'light' : 'dark'; } catch (e) {}
    showThemeLabel();
});

// shortcut: only stops casual F12 / right-click; DevTools still opens from the browser menu and the code is public on GitHub, so this is no real protection.
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => {
    const devtools = e.key === 'F12'
        || ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code))
        || ((e.ctrlKey || e.metaKey) && e.code === 'KeyU');
    if (devtools) e.preventDefault();
});

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

// Pixel cursor: fading pixel trail + a square that spins on links. Mouse only, and off for reduced motion.
if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
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

    const LIFE = 650;               // ms an ink stroke takes to fade
    const pts = [];
    let mx = 0, my = 0, rx = 0, ry = 0;

    addEventListener('pointermove', e => {
        if (root.classList.contains('away')) { rx = e.clientX; ry = e.clientY; }
        root.classList.remove('away');
        mx = e.clientX; my = e.clientY;
        pts.push({ x: mx, y: my, t: performance.now() });
    });
    root.addEventListener('mouseleave', () => root.classList.add('away'));
    document.addEventListener('pointerover', e => ring.classList.toggle('hot', !!e.target.closest('a, button')));
    addEventListener('pointerdown', () => ring.classList.add('press'));
    addEventListener('pointerup', () => ring.classList.remove('press'));

    (function frame(now) {
        while (pts.length && now - pts[0].t > LIFE) pts.shift();
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.fillStyle = getComputedStyle(root).getPropertyValue('--red');   // follows the theme toggle
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i];
            const k = 1 - (now - b.t) / LIFE;        // 1 = fresh, 0 = gone
            const s = k > 0.5 ? 8 : 4;               // pixels shrink as they fade
            ctx.globalAlpha = k * 0.7;
            // fill the gap between samples on a 4px grid so fast moves stay continuous
            const steps = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y) / 4 | 0);
            for (let j = 0; j < steps; j++) {
                const x = Math.round((a.x + (b.x - a.x) * j / steps) / 4) * 4;
                const y = Math.round((a.y + (b.y - a.y) * j / steps) / 4) * 4;
                ctx.fillRect(x - s / 2, y - s / 2, s, s);
            }
        }
        dot.style.transform = `translate(${mx + kick.x}px, ${my + kick.y}px)`;
        rx += (mx + kick.x - rx) * 0.18;
        ry += (my + kick.y - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(frame);
    })(performance.now());
}

// Pixel KC: a little sprite of me (glasses, blue tee, backpack) wandering the bottom of the page. Click him.
(() => {
    const TOP = [
        '....hhhhhh....',
        '...hhhhhhhhh..',
        '..hhhhhhhhhhh.',
        '..hhhhhsssssh.',
        '..hhhsssssss..',
        '..hhsggggggg..',
        '..hhsglegleg..',
        '...hsggggggg..',
        '...sssssssss..',
        '....ssssmss...',
        '.....ssss.....',
        '...kbbbbbbb...',
        '..kkbbbbbbbb..',
        '..kkbbbbbbbbs.',
        '..kkbbbbbbb.s.',
        '...kbbbbbbb...',
        '....ppppppp...',
    ];
    const STAND = TOP.concat(['....ppp.ppp...', '....ppp.ppp...', '...ooo..ooo...']);
    const WALK = TOP.concat(['...ppp...ppp..', '..ppp.....ppp.', '..oo.......oo.']);
    const PAL = { h: '#2b1d16', s: '#f0c08a', g: '#151515', l: '#bcd8ff', e: '#151515',
                  m: '#b5523b', k: '#1c1c1c', b: '#2f5bd8', p: '#2a2a3a', o: '#111' };
    const W = 16, H = 22, S = 3;   // 14x20 sprite + 1-cell outline, drawn at 3px per cell
    const LINES = ["hi, I'm KC!", '6 yrs of XP and counting', "psst... I'm open to work",
                   'I turn meetings into specs', 'try light mode, top right'];
    const HURT = ['ouch!', 'hey!!', 'not the glasses!', 'I will tell HR', 'that was a P1 bug'];
    const TAUNT = ['take this bug!', 'scope creep!', 'catch this change request!', 'new requirement incoming!'];
    const MAX_HP = 10;

    const cv = document.createElement('canvas');
    const bubble = document.createElement('div');
    const hpBar = document.createElement('div');
    const hint = document.createElement('div');
    cv.className = 'buddy'; bubble.className = 'bubble'; hpBar.className = 'hp'; hint.className = 'hint';
    hpBar.append(document.createElement('i'));
    hint.append(document.createElement('b'), 'press to attack me');
    [cv, bubble, hpBar, hint].forEach(el => el.setAttribute('aria-hidden', 'true'));
    document.body.append(cv, bubble, hpBar, hint);
    let hintW = 0;   // cached width; reset when it can change
    addEventListener('resize', () => { hintW = 0; });
    document.fonts.ready.then(() => { hintW = 0; });
    const dpr = devicePixelRatio || 1;
    cv.width = W * S * dpr; cv.height = H * S * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(S * dpr, 0, 0, S * dpr, 0, 0);

    const draw = (rows, blink, tint) => {
        const on = (x, y) => (rows[y] || '')[x] > '.';   // any letter is a filled cell
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = getComputedStyle(root).getPropertyValue('--ink');   // outline follows the theme
        for (let y = -1; y <= rows.length; y++)
            for (let x = -1; x <= 14; x++)
                if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)))
                    ctx.fillRect(x + 1, y + 1, 1, 1);
        rows.forEach((row, y) => [...row].forEach((c, x) => {
            if (c === '.') return;
            ctx.fillStyle = tint || PAL[blink && c === 'e' ? 'g' : c];
            ctx.fillRect(x + 1, y + 1, 1, 1);
        }));
    };

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = innerWidth * 0.7, dir = -1, y = 0, vy = 0, target = x;
    let state = 'idle', until = performance.now() + 2000, last = performance.now();
    let nextBlink = 0, blinkUntil = 0, sayUntil = 0;
    let hp = MAX_HP, ko = false, angryUntil = 0, nextShot = 0, nextRegen = 0, flashUntil = 0, kvx = 0;
    let px = -1e4, py = -1e4;   // last pointer position, for aiming
    const shots = [];
    const pick = list => list[Math.floor(Math.random() * list.length)];

    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; });
    addEventListener('pointerdown', e => { px = e.clientX; py = e.clientY; });

    const say = text => { bubble.textContent = text; bubble.classList.add('show'); sayUntil = performance.now() + 2600; };
    const jump = () => { if (!still && y === 0) vy = 420; };
    const showHp = () => {
        hpBar.firstChild.style.width = hp / MAX_HP * 100 + '%';
        hpBar.firstChild.style.background = hp > 5 ? 'var(--green)' : hp > 2 ? '#ffcc33' : 'var(--red)';
        hpBar.classList.toggle('show', hp < MAX_HP);
    };
    // floating damage number
    const pop = (text, cx, cy, cls) => {
        const d = document.createElement('div');
        d.className = 'pop ' + cls; d.textContent = text;
        d.style.left = cx + 'px'; d.style.top = cy + 'px';
        document.body.append(d);
        setTimeout(() => d.remove(), 800);
    };
    const shoot = () => {
        const sx = x + W * S / 2, sy = innerHeight - 74 - y;   // from his hands
        const d = Math.hypot(px - sx, py - sy) || 1;
        const el = document.createElement('div');
        el.className = 'shot';
        document.body.append(el);
        shots.push({ el, x: sx, y: sy, vx: (px - sx) / d * 320, vy: (py - sy) / d * 320, t: 0 });
        say(pick(TAUNT));
    };

    cv.addEventListener('click', e => {
        if (ko) return;
        hint.classList.add('gone');
        const crit = Math.random() < 0.2, dmg = crit ? 3 : 1;
        hp = Math.max(0, hp - dmg);
        showHp();
        flashUntil = performance.now() + 120;
        angryUntil = performance.now() + 6000;
        nextShot = Math.max(nextShot, performance.now() + 500);   // small grace before he fires back
        pop(crit ? `-${dmg} CRIT!` : `-${dmg}`, e.clientX, e.clientY - 24, crit ? 'crit' : '');
        if (!still) { kvx = (x + W * S / 2 > e.clientX ? 1 : -1) * 260; jump(); }
        if (hp > 0) return say(pick(HURT));
        ko = true; angryUntil = 0;
        say('ok ok you win... hire me?');
        setTimeout(() => { hp = MAX_HP; ko = false; showHp(); say('respawned. round 2?'); }, 5000);
    });
    setTimeout(() => say(LINES[0]), 3500);

    (function tick(now) {
        const dt = Math.min(50, now - last) / 1000; last = now;
        const maxX = innerWidth - W * S - 8;
        const angry = !ko && !still && now < angryUntil;
        if (angry) {
            // stand and fight: face the cursor and throw bugs at it
            state = 'idle'; until = angryUntil;
            dir = px > x + W * S / 2 ? 1 : -1;
            if (now > nextShot) { shoot(); nextShot = now + 1100 + Math.random() * 600; }
        } else if (!ko && hp < MAX_HP && now > nextRegen) {
            hp++; showHp(); nextRegen = now + 1000;   // heals when left alone
        }
        if (ko) state = 'idle';
        if (!still && !ko && state === 'idle' && now > until) { target = 8 + Math.random() * (maxX - 8); state = 'walk'; }
        if (state === 'walk') {
            const d = target - x;
            dir = Math.sign(d) || dir;
            x += dir * Math.min(Math.abs(d), 70 * dt);
            if (Math.abs(d) < 1) {
                state = 'idle'; until = now + 1500 + Math.random() * 3500;
                if (Math.random() < 0.3) say(pick(LINES));
                else if (Math.random() < 0.3) jump();
            }
        }
        x += kvx * dt; kvx *= 0.88;   // knockback
        x = Math.max(8, Math.min(x, maxX));

        for (let i = shots.length - 1; i >= 0; i--) {
            const s = shots[i];
            s.x += s.vx * dt; s.y += s.vy * dt; s.t += dt;
            s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${Math.floor(s.t * 8) * 45}deg)`;
            const hit = Math.hypot(s.x - px, s.y - py) < 18;
            if (hit) {
                kick.x += s.vx / 320 * 18; kick.y += s.vy / 320 * 18;
                pop('-1', px, py - 28, 'ouch');
                root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');   // restart the shake
            }
            if (hit || s.t > 2.5) { s.el.remove(); shots.splice(i, 1); }
        }
        kick.x *= 0.86; kick.y *= 0.86;
        if (y > 0 || vy > 0) { vy -= 1500 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = 0; }
        if (now > nextBlink) { blinkUntil = now + 140; nextBlink = now + 2500 + Math.random() * 3000; }
        if (now > sayUntil) bubble.classList.remove('show');

        const walking = state === 'walk' && y === 0 && Math.floor(now / 160) % 2;
        draw(walking ? WALK : STAND, now < blinkUntil || ko, now < flashUntil ? '#ffffff' : null);
        cv.style.transform = ko
            ? `translate(${x}px, 12px) rotate(${dir * -90}deg)`   // knocked out, lying down
            : `translate(${x}px, ${-y}px) scaleX(${dir})`;
        const bx = Math.max(90, Math.min(x + W * S / 2, innerWidth - 90));   // keep the bubble on screen
        bubble.style.transform = `translate(${bx}px, ${-y}px) translateX(-50%)`;
        hpBar.style.transform = `translate(${x + W * S / 2}px, ${-y}px) translateX(-50%)`;
        // hint stays fully on screen; its arrow slides to keep pointing at him
        if (!hintW) hintW = hint.offsetWidth;
        const cx = x + W * S / 2;
        const hx = Math.max(hintW / 2 + 6, Math.min(cx, innerWidth - hintW / 2 - 6));
        hint.style.transform = `translate(${hx - hintW / 2}px, 0)`;
        hint.style.setProperty('--ax', cx - hx + hintW / 2 + 'px');
        requestAnimationFrame(tick);
    })(last);
})();

// Track changes: show or hide the reviewer markup.
const track = document.getElementById('track');
track.addEventListener('click', () => {
    const clean = document.body.classList.toggle('clean');
    track.setAttribute('aria-pressed', String(!clean));
});
