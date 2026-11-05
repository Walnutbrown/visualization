(() => {
  "use strict";
  const I = window.Illustrate;
  const extent = values => {
    let low = Math.min(...values), high = Math.max(...values);
    if (low === high) { low -= 1; high += 1; }
    return [low, high];
  };
  const scale = (domain, start, end) => value => start + (value - domain[0]) / (domain[1] - domain[0]) * (end - start);
  // Ticks sit on 1, 2 or 5 × 10ⁿ so a label is never a rounded stand-in for the gridline under it.
  const tickStep = ([low, high]) => {
    const raw = (high - low) / 4, power = 10 ** Math.floor(Math.log10(raw)), error = raw / power;
    return power * (error >= Math.sqrt(50) ? 10 : error >= Math.sqrt(10) ? 5 : error >= Math.sqrt(2) ? 2 : 1);
  };
  const digits = step => Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  I.ticks = domain => {
    const step = tickStep(domain), values = [];
    for (let i = Math.ceil(domain[0] / step - 1e-9); i * step <= domain[1] + step * 1e-9; i++) values.push(+(i * step).toFixed(digits(step)));
    return {values, digits: digits(step)};
  };
  // Automatic ranges widen to the nearest ticks so both axis ends are labelled.
  const nice = domain => {
    const step = tickStep(domain), round = value => +value.toFixed(digits(step));
    return [round(Math.floor(domain[0] / step + 1e-9) * step), round(Math.ceil(domain[1] / step - 1e-9) * step)];
  };
  const path = (data, x, y) => data.map((d, i) => `${i ? "L" : "M"}${x(d.x)},${y(d.y)}`).join(" ");
  // Reference lines must carry a label: an unlabelled line leaves the reader guessing (annotation-design).
  I.chartMarkers = (markers, axes) => markers.map(marker => {
    const keys = Object.keys(axes).filter(key => marker?.[key] !== undefined);
    if (keys.length !== 1 || typeof marker.label !== "string" || !marker.label.trim()) throw new Error(`marker마다 ${Object.keys(axes).join(" 또는 ")} 하나와 label이 필요합니다.`);
    const at = I.number(marker[keys[0]], `markers.${keys[0]}`), [low, high] = axes[keys[0]];
    if (at < low || at > high) throw new Error("marker가 축 범위 밖에 있습니다.");
    return {axis: keys[0], at, label: marker.label};
  });
  // A probe follows the pointer (or arrow keys) along the line, so the reader feels how y moves with x.
  // It snaps to the nearest given point and never invents values between observations; a model passes dense points.
  const probe = (svg, config, data, x, invert, y, width, height) => {
    const start = config.probe === undefined ? null : I.number(config.probe, "probe");
    if (start !== null && (start < data[0].x || start > data.at(-1).x)) throw new Error("probe는 데이터의 x 범위 안에 있어야 합니다.");
    const nearest = value => data.reduce((best, d, i) => Math.abs(d.x - value) < Math.abs(data[best].x - value) ? i : best, 0);
    const readout = I.svgEl("tspan"), label = I.svgEl("text", {"font-size": 13}), dot = I.svgEl("g"), slide = I.svgEl("g", {class: "iv-probe", "aria-hidden": "true"});
    label.append(readout);
    dot.append(I.svgEl("circle", {r: 6, class: "iv-probe-dot"}), label);
    slide.append(I.svgEl("line", {y1: 18, y2: height - 56, class: "iv-probe-line"}), dot);
    svg.append(slide);
    svg.setAttribute("tabindex", "0"); svg.setAttribute("data-probe", "");
    let index = null, frame = 0;
    const show = next => {
      // Glide only from a visible spot; appearing should not fly in from the corner.
      slide.setAttribute("class", index === null ? "iv-probe" : "iv-probe iv-glide");
      index = next;
      slide.setAttribute("visibility", index === null ? "hidden" : "visible");
      if (index === null) return;
      // The readout sits on the side of the point the line does not run into, like point labels.
      const d = data[index], px = x(d.x), py = y(d.y), left = px > width * .6, neighbor = data[index + (left ? -1 : 1)];
      const below = py < 44 || (py < height - 90 && neighbor && neighbor.y > d.y);
      slide.setAttribute("style", `transform: translate(${px}px, 0)`);
      dot.setAttribute("style", `transform: translate(0, ${py}px)`);
      label.setAttribute("x", left ? -12 : 12); label.setAttribute("y", below ? 22 : -12); label.setAttribute("text-anchor", left ? "end" : "start");
      readout.textContent = `${I.format(d.x, 3)} → ${I.format(d.y, 3)}`;
    };
    const rest = () => show(start === null ? null : nearest(start));
    svg.addEventListener("pointermove", event => {
      const at = event.clientX;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { const box = svg.getBoundingClientRect(); show(nearest(invert((at - box.left) * width / box.width))); });
    });
    svg.addEventListener("pointerleave", event => { if (event.pointerType === "mouse") { cancelAnimationFrame(frame); rest(); } });
    svg.addEventListener("focus", () => { if (index === null) show(nearest(start ?? data[0].x)); });
    svg.addEventListener("blur", rest);
    svg.addEventListener("keydown", event => {
      const moves = {ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, Home: -Infinity, End: Infinity};
      if (!(event.key in moves)) return;
      event.preventDefault();
      show(Math.max(0, Math.min(data.length - 1, (index ?? 0) + moves[event.key])));
    });
    rest();
  };
  I.plot = (config, width) => {
    const data = config.data, markers = config.markers ?? [];
    if (!["bar", "line", "scatter"].includes(config.kind)) throw new Error("chart.kind는 bar, line, scatter 중 하나입니다.");
    if (!Array.isArray(data) || !data.length) throw new Error("표시할 데이터가 없습니다.");
    if (!Array.isArray(markers)) throw new Error("markers는 배열이어야 합니다.");
    for (const name of ["xLabel", "yLabel"]) if (config[name] !== undefined && typeof config[name] !== "string") throw new Error(`${name}: 이름은 문자열이어야 합니다.`);
    const along = key => markers.map(marker => marker?.[key]).filter(Number.isFinite);
    if (config.kind === "bar") {
      data.forEach(d => { I.number(d.value, "value"); if (typeof d.label !== "string") throw new Error("막대마다 label이 필요합니다."); });
      const values = [0, ...data.map(d => d.value), ...along("value")];
      const domain = config.valueDomain ? I.domain(config.valueDomain, "valueDomain") : [Math.min(...values), Math.max(...values)];
      if (domain[0] === domain[1]) domain[1] = 1;
      if (domain[0] > 0 || domain[1] < 0 || data.some(d => d.value < domain[0] || d.value > domain[1])) throw new Error("막대 축은 0과 모든 값을 포함해야 합니다.");
      const refs = I.chartMarkers(markers, {value: domain});
      const labelWidth = Math.min(160, width * .34), x = scale(domain, labelWidth + 12, width - 71);
      const labels = data.map(d => I.wrap(d.label, labelWidth - 12));
      const heights = labels.map(lines => Math.max(44, lines.length * 19 + 14));
      const heading = config.yLabel ? I.wrap(config.yLabel, labelWidth - 12) : [];
      const valueLabel = config.xLabel ? I.wrap(config.xLabel, width - labelWidth - 83) : [];
      const start = (heading.length ? heading.length * 19 + 10 : 0) + refs.length * 18;
      const end = start + heights.reduce((a, b) => a + b, 0);
      const height = end + 38 + valueLabel.length * 19;
      const svg = I.svg(width, height, config.title, config.description || data.map(d => `${d.label}: ${d.value}${config.unit || ""}`).join(". "));
      if (heading.length) I.text(svg, heading, 0, 14);
      svg.append(I.svgEl("line", {x1: x(0), x2: x(0), y1: start, y2: end + 10, class: "iv-axis"}));
      let top = start;
      data.forEach((d, i) => {
        const group = I.svgEl("g", {"data-key": d.key ?? d.label});
        const y = top + heights[i] / 2;
        I.text(group, labels[i], 0, y - (labels[i].length - 1) * 9.5 + 5);
        group.append(I.svgEl("rect", {x: Math.min(x(0), x(d.value)), y: y - 10, width: Math.abs(x(d.value) - x(0)), height: 20, class: "iv-mark"}));
        I.text(group, [I.format(d.value) + (config.unit || "")], width - 55, y + 5, {"font-size": 13});
        group.append(I.svgEl("title", {}, `${d.label}: ${d.value}${config.unit || ""}`));
        svg.append(group); top += heights[i];
      });
      refs.forEach((ref, i) => {
        const mx = x(ref.at), labelY = start - (refs.length - i) * 18 + 14;
        svg.append(I.svgEl("line", {x1: mx, x2: mx, y1: labelY + 4, y2: end + 10, class: "iv-marker"}));
        I.text(svg, [`${ref.label} ${I.format(ref.at)}${config.unit || ""}`], mx, labelY, {"text-anchor": mx > width * .6 ? "end" : "start", "font-size": 12});
      });
      [...new Set([domain[0], 0, domain[1]])].forEach(value => I.text(svg, [I.format(value)], x(value), end + 32, {"text-anchor": "middle", "font-size": 12}));
      if (valueLabel.length) I.text(svg, valueLabel, (x(domain[0]) + x(domain[1])) / 2, end + 54, {"text-anchor": "middle"});
      return svg;
    }
    data.forEach(d => { I.number(d.x, "x"); I.number(d.y, "y"); if (d.label !== undefined && typeof d.label !== "string") throw new Error("label은 문자열이어야 합니다."); });
    if (config.kind === "line" && data.some((d, i) => i && d.x < data[i - 1].x)) throw new Error("선 그래프의 x 값은 오름차순이어야 합니다.");
    const xd = I.domain(config.xDomain || nice(extent([...data.map(d => d.x), ...along("x")])), "xDomain");
    const yd = I.domain(config.yDomain || nice(extent([...data.map(d => d.y), ...along("y")])), "yDomain");
    if (data.some(d => d.x < xd[0] || d.x > xd[1] || d.y < yd[0] || d.y > yd[1])) throw new Error("축 범위 밖의 데이터가 있습니다.");
    const refs = I.chartMarkers(markers, {x: xd, y: yd});
    const height = 300, x = scale(xd, 49, width - 14), y = scale(yd, height - 56, 18);
    const svg = I.svg(width, height, config.title, config.description || `${config.xLabel || "x"}와 ${config.yLabel || "y"}의 관계. 원자료는 아래 표를 참고하세요.`);
    const xt = I.ticks(xd), yt = I.ticks(yd);
    yt.values.forEach(value => {
      svg.append(I.svgEl("line", {x1: 49, x2: width - 14, y1: y(value), y2: y(value), class: "iv-grid"}));
      I.text(svg, [I.format(value, yt.digits)], 42, y(value) + 4, {"text-anchor": "end", "font-size": 12});
    });
    xt.values.forEach(value => I.text(svg, [I.format(value, xt.digits)], x(value), height - 35, {"text-anchor": "middle", "font-size": 12}));
    svg.append(I.svgEl("path", {d: `M49,18 V${height - 56} H${width - 14}`, class: "iv-axis", fill: "none"}));
    if (xd[0] <= 0 && xd[1] >= 0) svg.append(I.svgEl("line", {x1: x(0), x2: x(0), y1: 18, y2: height - 56, class: "iv-axis", "data-zero-axis": "x"}));
    if (yd[0] <= 0 && yd[1] >= 0) svg.append(I.svgEl("line", {x1: 49, x2: width - 14, y1: y(0), y2: y(0), class: "iv-axis", "data-zero-axis": "y"}));
    I.text(svg, [config.yLabel || "y"], 49, 12, {"font-size": 12});
    I.text(svg, [config.xLabel || "x"], width - 14, height - 8, {"text-anchor": "end", "font-size": 12});
    refs.forEach(ref => svg.append(ref.axis === "y"
      ? I.svgEl("line", {x1: 49, x2: width - 14, y1: y(ref.at), y2: y(ref.at), class: "iv-marker"})
      : I.svgEl("line", {x1: x(ref.at), x2: x(ref.at), y1: 18, y2: height - 56, class: "iv-marker"})));
    // No clip: data outside the axes is rejected above, and clipping only cut edge dots in half.
    const marks = I.svgEl("g");
    if (config.reference) {
      config.reference.forEach(d => { I.number(d.x, "reference.x"); I.number(d.y, "reference.y"); });
      marks.append(I.svgEl("path", {d: path(config.reference, x, y), class: "iv-reference", fill: "none"}));
    }
    if (config.kind === "line") marks.append(I.svgEl("path", {d: path(data, x, y), class: "iv-line", fill: "none"}));
    data.forEach((d, i) => {
      if (config.kind === "line" && data.length > 24 && !d.label) return;
      const point = I.svgEl("circle", {cx: x(d.x), cy: y(d.y), r: 4.5, class: "iv-dot", "data-key": d.key ?? d.label ?? String(i)});
      point.append(I.svgEl("title", {}, `${d.label || ""} (${d.x}, ${d.y})`)); marks.append(point);
    });
    svg.append(marks);
    // Labels go on top of the marks, on the side of the point the line does not continue into.
    data.forEach((d, i) => {
      if (!d.label) return;
      const px = x(d.x), py = y(d.y), left = px > width * .6, neighbor = data[i + (left ? -1 : 1)];
      let ly = config.kind === "line" && neighbor && neighbor.y > d.y ? py + 20 : py - 10;
      if (ly < 30) ly = py + 20; else if (ly > height - 60) ly = py - 10;
      I.text(svg, [d.label], px + (left ? -8 : 8), ly, {"text-anchor": left ? "end" : "start", "font-size": 12});
    });
    refs.forEach((ref, i) => {
      const label = [`${ref.label} ${I.format(ref.at)}`];
      if (ref.axis === "y") { I.text(svg, label, width - 14, y(ref.at) - 6, {"text-anchor": "end", "font-size": 12}); return; }
      const mx = x(ref.at), end = mx > width * .6;
      I.text(svg, label, mx + (end ? -4 : 4), 30 + i * 16, {"text-anchor": end ? "end" : "start", "font-size": 12});
    });
    if (config.kind === "line") probe(svg, config, data, x, scale([49, width - 14], xd[0], xd[1]), y, width, height);
    return svg;
  };
  I.register("chart", root => {
    const config = I.config(root);
    I.watch(root, width => I.mount(root, I.plot(config, width)));
  });
})();
