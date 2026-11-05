(() => {
  "use strict";
  const I = window.Illustrate = {};
  let sequence = 0;
  I.id = () => `illustrate-${++sequence}`;
  I.el = (tag, attrs = {}, text = null) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== null) node.textContent = text;
    return node;
  };
  I.svgEl = (tag, attrs = {}, text = null) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== null) node.textContent = text;
    return node;
  };
  I.svg = (width, height, title, description) => {
    const titleId = I.id(), descId = I.id();
    const svg = I.svgEl("svg", {viewBox: `0 0 ${width} ${height}`, role: "img", "aria-labelledby": `${titleId} ${descId}`});
    svg.append(I.svgEl("title", {id: titleId}, title), I.svgEl("desc", {id: descId}, description));
    return svg;
  };
  I.number = (value, name) => {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${name}: 유한한 수가 필요합니다.`);
    return value;
  };
  I.domain = (values, name) => {
    if (!Array.isArray(values) || values.length !== 2) throw new Error(`${name}: [최솟값, 최댓값]이 필요합니다.`);
    values.forEach(value => I.number(value, name));
    if (values[0] >= values[1]) throw new Error(`${name}: 최댓값이 최솟값보다 커야 합니다.`);
    return values;
  };
  I.format = (value, digits = 2) => new Intl.NumberFormat("ko-KR", {maximumFractionDigits: digits}).format(value);
  I.config = root => {
    const source = root.querySelector(':scope > script[type="application/json"]');
    if (!source) throw new Error("부품의 JSON 설정이 없습니다.");
    const config = JSON.parse(source.textContent);
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("설정은 JSON 객체여야 합니다.");
    if (typeof config.title !== "string" || !config.title.trim()) throw new Error("title을 지정하세요.");
    return config;
  };
  I.mount = (root, content) => {
    content.classList.add("iv-render");
    root.querySelector(":scope > .iv-render")?.remove();
    root.prepend(content);
    const fallback = root.querySelector(":scope > [data-fallback]");
    if (fallback) fallback.hidden = true;
    root.classList.add("iv-ready");
    root.dispatchEvent(new CustomEvent("illustrate:render", {bubbles: true}));
  };
  I.error = (root, error) => {
    root.querySelector(":scope > .iv-render")?.remove();
    const fallback = root.querySelector(":scope > [data-fallback]");
    if (fallback) fallback.hidden = false;
    root.querySelector(":scope > .iv-error")?.remove();
    root.append(I.el("p", {class: "iv-error", role: "alert"}, `시각화 확인 필요: ${error.message}`));
    console.error("illustrate", error);
  };
  I.watch = (root, draw) => {
    let previous = -1;
    const update = () => {
      const width = Math.max(260, Math.floor(root.clientWidth - 32));
      if (width === previous) return;
      previous = width;
      try { draw(width); } catch (error) { I.error(root, error); }
    };
    update();
    if (window.ResizeObserver) {
      let frame;
      new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }).observe(root);
    }
  };
  I.wrap = (text, width, font = 14) => {
    // shortcut: wrapping estimates glyph widths; use measured text metrics if mixed-script labels overflow.
    // Breaks between words (Korean 어절) first; only a word longer than the line is split by character.
    const measure = word => [...word].reduce((sum, char) => sum + (/[\u0000-\u007f]/.test(char) ? font * .58 : font), 0);
    const lines = []; let line = "", used = 0;
    for (const word of String(text).split(/\s+/).filter(Boolean)) {
      const size = measure(word), gap = line ? font * .3 : 0;
      if (line && used + gap + size <= width) { line += " " + word; used += gap + size; continue; }
      if (line) lines.push(line);
      line = ""; used = 0;
      if (size <= width) { line = word; used = size; continue; }
      for (const char of word) {
        const charSize = measure(char);
        if (line && used + charSize > width) { lines.push(line); line = ""; used = 0; }
        line += char; used += charSize;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  };
  I.text = (svg, lines, x, y, attrs = {}) => {
    const text = I.svgEl("text", {x, y, ...attrs});
    lines.forEach((line, i) => text.append(I.svgEl("tspan", {x, dy: i ? 19 : 0}, line)));
    svg.append(text); return text;
  };
  I.register = (name, render) => {
    document.querySelectorAll(`[data-illustrate~="${name}"]`).forEach(root => {
      try { render(root); } catch (error) { I.error(root, error); }
    });
  };
})();
