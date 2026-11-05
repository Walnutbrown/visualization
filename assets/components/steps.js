(() => {
  "use strict";
  const I = window.Illustrate;
  // Attributes that glide between steps; anything else (text, colour, class) switches halfway.
  const GLIDE = /^(x|y|cx|cy|r|rx|ry|x1|y1|x2|y2|width|height|d|points|transform|stroke-width)$/;
  const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
  // Numbers blend only when the text around them matches (same path commands, same transform functions).
  I.mix = (a, b, t) => {
    if (a.replace(NUMBER, "#") !== b.replace(NUMBER, "#")) return t < .5 ? a : b;
    const to = b.match(NUMBER) || [];
    let i = 0;
    return a.replace(NUMBER, value => String(+(Number(value) + (Number(to[i++]) - Number(value)) * t).toFixed(2)));
  };
  // Scrub: one stage drawn from the step SVGs. Pointer, slider and arrow keys move a continuous position between steps,
  // and each element glides from its drawing in one step to the element with the same data-key in the next.
  const scrub = (root, frames) => {
    const pictures = frames.map(frame => frame.querySelector(":scope > svg"));
    if (pictures.some(svg => !svg)) throw new Error("data-scrub 단계마다 직접 자식 svg가 하나 필요합니다.");
    const keyed = pictures.map(svg => new Map([...svg.querySelectorAll("[data-key]")].map(node => [node.dataset.key, node])));
    const stage = pictures[0].cloneNode(true), live = new Map();
    const adopt = node => [node, ...node.querySelectorAll("[data-key]")].forEach(n => { if (n.dataset.key && !live.has(n.dataset.key)) live.set(n.dataset.key, n); });
    adopt(stage);
    // A key that first appears in a later step joins the stage on top and stays invisible until then.
    keyed.forEach(map => map.forEach((node, key) => { if (!live.has(key)) { const copy = node.cloneNode(true); stage.append(copy); adopt(copy); } }));
    if (!live.size) throw new Error("data-scrub 그림에는 단계 사이에서 이어질 data-key 요소가 필요합니다.");
    const last = frames.length - 1, reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slider = I.el("input", {type: "range", min: 0, max: last, step: .01, value: 0, "aria-label": "단계"});
    const status = I.el("output", {"aria-live": "polite", "aria-atomic": "true"}), controls = I.el("div", {class: "iv-controls"});
    let position = 0, goal = 0, shown = -1, motion = 0;
    const opacity = node => node ? Number(node.getAttribute("opacity") ?? 1) : 0;
    const render = next => {
      position = Math.max(0, Math.min(next, last));
      const i = Math.min(Math.floor(position), last - 1), t = position - i;
      live.forEach((node, key) => {
        const a = keyed[i].get(key), b = keyed[i + 1].get(key), from = a || b, to = b || a;
        if (!from) { node.setAttribute("opacity", 0); return; }
        new Set([...from.getAttributeNames(), ...to.getAttributeNames()]).forEach(name => {
          if (name === "opacity" || name === "data-key") return;
          const va = from.getAttribute(name), vb = to.getAttribute(name);
          const value = va !== null && vb !== null && GLIDE.test(name) ? I.mix(va, vb, t) : t < .5 ? va : vb;
          if (value === null) node.removeAttribute(name); else node.setAttribute(name, value);
        });
        node.setAttribute("opacity", +(opacity(a) + (opacity(b) - opacity(a)) * t).toFixed(3));
        const source = t < .5 ? from : to;
        if (node.localName === "text" && node.innerHTML !== source.innerHTML) node.innerHTML = source.innerHTML;
      });
      slider.value = position;
      const near = Math.round(position);
      if (near === shown) return;
      shown = near;
      frames.forEach((frame, k) => { frame.hidden = k !== near; });
      status.textContent = `${near + 1}/${frames.length}단계: ${frames[near].dataset.title || "단계"}`;
      slider.setAttribute("aria-valuetext", status.textContent);
    };
    const glide = target => {
      cancelAnimationFrame(motion);
      goal = Math.max(0, Math.min(target, last));
      if (reduced.matches) { render(goal); return; }
      const from = position;
      let begin = null;
      const step = now => {
        begin ??= now;
        const k = Math.min(1, (now - begin) / 400);
        render(from + (goal - from) * (1 - (1 - k) ** 3));
        if (k < 1) motion = requestAnimationFrame(step);
      };
      motion = requestAnimationFrame(step);
    };
    const follow = value => { cancelAnimationFrame(motion); render(value); goal = position; };
    // Near each step the drawing holds still, so a resting cursor lands on an exact step.
    stage.addEventListener("pointermove", event => {
      const box = stage.getBoundingClientRect(), along = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)) * last;
      const i = Math.min(Math.floor(along), last - 1);
      follow(i + Math.max(0, Math.min(1, (along - i - .15) / .7)));
    });
    slider.addEventListener("input", () => follow(Number(slider.value)));
    slider.addEventListener("keydown", event => {
      const forward = {ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1}[event.key];
      if (!forward) return;
      event.preventDefault();
      glide(forward > 0 ? Math.floor(goal + 1e-6) + 1 : Math.ceil(goal - 1e-6) - 1);
    });
    stage.classList.add("iv-stage");
    // Never draw larger than designed, so labels keep their written size on wide screens.
    if (stage.viewBox?.baseVal?.width) stage.style.maxWidth = `${stage.viewBox.baseVal.width}px`;
    controls.append(slider, status);
    root.prepend(stage, controls, I.el("p", {class: "iv-legend"}, "그림 위에서 커서를 좌우로 움직이거나 끌면 단계 사이가 이어집니다."));
    root.classList.add("iv-scrub", "iv-ready");
    render(0);
  };
  I.register("steps", root => {
    const frames = [...root.querySelectorAll(":scope > [data-step]")];
    if (frames.length < 2) throw new Error("단계 그림에는 data-step 영역이 두 개 이상 필요합니다.");
    if (root.dataset.scrub === "true") return scrub(root, frames);
    let current = 0, timer = null;
    const controls = I.el("div", {class: "iv-controls"});
    const previous = I.el("button", {type: "button"}, "이전"), next = I.el("button", {type: "button"}, "다음");
    const status = I.el("output", {"aria-live": "polite", "aria-atomic": "true"});
    const play = I.el("button", {type: "button", "aria-pressed": "false"}, "재생");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { clearInterval(timer); timer = null; play.textContent = "재생"; play.setAttribute("aria-pressed", "false"); };
    const show = index => {
      current = Math.max(0, Math.min(index, frames.length - 1));
      frames.forEach((frame, i) => { frame.hidden = i !== current; });
      previous.disabled = current === 0; next.disabled = current === frames.length - 1;
      status.textContent = `${current + 1}/${frames.length}단계: ${frames[current].dataset.title || "단계"}`;
      if (next.disabled) stop();
    };
    previous.addEventListener("click", () => { stop(); show(current - 1); });
    next.addEventListener("click", () => { stop(); show(current + 1); });
    play.addEventListener("click", () => {
      if (timer) { stop(); return; }
      if (current === frames.length - 1) show(0);
      play.textContent = "정지"; play.setAttribute("aria-pressed", "true");
      timer = setInterval(() => show(current + 1), 1600);
    });
    controls.append(previous, next, status);
    if (root.dataset.playback === "true") {
      controls.append(play);
      const respectMotion = () => { if (reduced.matches) stop(); play.disabled = reduced.matches; play.title = reduced.matches ? "모션 축소 설정: 이전·다음 버튼을 사용하세요." : ""; };
      reduced.addEventListener("change", respectMotion); respectMotion();
    }
    root.prepend(controls);
    root.addEventListener("keydown", event => {
      if (event.target.closest("input, textarea, select, .math-block") || event.ctrlKey || event.metaKey || event.altKey) return;
      if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); stop(); show(current + (event.key === "ArrowLeft" ? -1 : 1)); }
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
    show(0); root.classList.add("iv-ready");
  });
})();
