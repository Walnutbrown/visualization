// 항상 포함되는 페이지 모듈: 굴절 감지, 스크롤 등장, 단원 바 슬라이더. 컴포넌트와 무관하다.
(() => {
  // 굴절(backdrop-filter: url())은 Chromium만 그린다.
  if (window.chrome) document.documentElement.dataset.lens = 'on';
  const nav = document.querySelector('main > nav[aria-label]');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('main > *:not(nav)').forEach(el => { el.classList.add('reveal'); io.observe(el); });
  // 포인터를 따라 하이라이트가 움직인다.
  document.addEventListener('pointermove', e => {
    const box = e.target.closest?.('.archive-home a') || document.querySelector('.page-slider'); if (!box) return; const r = box.getBoundingClientRect();
    box.style.setProperty('--mx', (e.clientX - r.left) + 'px'); box.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  if (!nav) return;

  // 슬라이더: 스크롤(화면 위 40% 지점)과 클릭으로 현재 단원 아래로 한 덩어리 이동한다.
  const sl = document.createElement('div'); sl.className = 'page-slider'; nav.prepend(sl);
  const links = [...nav.querySelectorAll('a[href^="#"]')].map(a => ({ a, t: document.getElementById(a.getAttribute('href').slice(1)) })).filter(x => x.t);
  let cur = null, shown = false, lock = false, tick = false;
  const go = x => {
    const r = x.a.getBoundingClientRect(), n = nav.getBoundingClientRect();
    sl.style.transitionDuration = shown ? '.5s, .5s, .3s, .2s' : '0s, 0s, .3s, .2s';
    sl.style.width = r.width + 'px'; sl.style.height = (r.height - 8) + 'px';
    sl.style.transform = `translate(${r.left - n.left}px, 4px)`;
    shown = true; sl.classList.add('on');
  };
  const pick = x => {
    if (x === cur) return;
    cur = x; links.forEach(l => l.a.classList.toggle('is-now', l === x));
    if (x) go(x); else { sl.classList.remove('on'); shown = false; }
  };
  const place = () => {
    if (lock) return;
    let hit = null; links.forEach(x => { if (x.t.getBoundingClientRect().top <= innerHeight * .4) hit = x; });
    pick(hit);
  };
  // 클릭하면 스크롤이 끝날 때까지 중간 단원 감지를 잠가 알약이 깜빡이지 않게 한다.
  nav.addEventListener('click', e => {
    const x = links.find(l => l.a === e.target.closest('a')); if (!x) return;
    lock = true; pick(x);
    const done = () => { lock = false; place(); };
    addEventListener('scrollend', done, { once: true }); setTimeout(done, 1600);
  });
  nav.addEventListener('pointerdown', () => sl.classList.add('press'));
  addEventListener('pointerup', () => sl.classList.remove('press'));
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; place(); }); } }, { passive: true });
  addEventListener('resize', () => { cur = null; shown = false; place(); });
  place();
})();
