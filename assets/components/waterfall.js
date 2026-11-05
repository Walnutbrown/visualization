(() => {
  "use strict";
  const I = window.Illustrate;
  const scale = (domain, start, end) => value => start + (value - domain[0]) / (domain[1] - domain[0]) * (end - start);
  const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  I.waterfallRows = steps => {
    if (!Array.isArray(steps) || steps.length < 2) throw new Error("steps에 두 단계 이상이 필요합니다.");
    let running = 0;
    return steps.map((step, i) => {
      if (typeof step.label !== "string" || !step.label.trim()) throw new Error("단계마다 label이 필요합니다.");
      const key = step.key ?? step.label;
      if (step.total) {
        if (i === 0) running = I.number(step.value, `${step.label}.value`);
        else if (step.value !== undefined && !close(I.number(step.value, `${step.label}.value`), running)) throw new Error(`${step.label}: 입력한 합계는 ${step.value}, 앞 단계까지 누적한 값은 ${running}입니다. 값을 확인하세요.`);
        return {label: step.label, key, total: true, start: 0, end: running, value: running};
      }
      if (i === 0) throw new Error("첫 단계는 total: true인 시작 값이어야 합니다.");
      const start = running;
      running += I.number(step.value, `${step.label}.value`);
      return {label: step.label, key, total: false, start, end: running, value: step.value};
    });
  };
  const signed = (row, unit) => (row.total ? I.format(row.value) : `${row.value < 0 ? "−" : "+"}${I.format(Math.abs(row.value))}`) + unit;
  I.register("waterfall", root => {
    const config = I.config(root), rows = I.waterfallRows(config.steps), unit = config.unit || "";
    const ends = rows.flatMap(row => [row.start, row.end]);
    const domain = [Math.min(0, ...ends), Math.max(0, ...ends)];
    if (domain[0] === domain[1]) domain[1] = 1;
    I.watch(root, width => {
      const labelWidth = Math.min(160, width * .34), x = scale(domain, labelWidth + 12, width - 75);
      const labels = rows.map(row => I.wrap(row.label, labelWidth - 12));
      const heights = labels.map(lines => Math.max(44, lines.length * 19 + 14));
      const valueLabel = config.xLabel ? I.wrap(config.xLabel, width - labelWidth - 87) : [];
      const start = 34, end = start + heights.reduce((a, b) => a + b, 0);
      const svg = I.svg(width, end + 38 + valueLabel.length * 19, config.title,
        config.description || rows.map(row => `${row.label} ${signed(row, unit)}`).join(", "));
      [["iv-mark", "합계"], ["iv-mark iv-up", "증가"], ["iv-mark iv-down", "감소"]].forEach(([cls, name], i) => {
        svg.append(I.svgEl("rect", {x: i * 76, y: 4, width: 14, height: 14, class: cls}));
        I.text(svg, [name], i * 76 + 20, 16, {"font-size": 12});
      });
      svg.append(I.svgEl("line", {x1: x(0), x2: x(0), y1: start, y2: end + 10, class: "iv-axis"}));
      let top = start;
      rows.forEach((row, i) => {
        const y = top + heights[i] / 2, group = I.svgEl("g", {"data-key": row.key});
        I.text(group, labels[i], 0, y - (labels[i].length - 1) * 9.5 + 5, row.total ? {"font-weight": 500} : {});
        const cls = row.total ? "iv-mark" : row.value < 0 ? "iv-mark iv-down" : "iv-mark iv-up";
        group.append(I.svgEl("rect", {x: Math.min(x(row.start), x(row.end)), y: y - 10, width: Math.max(1, Math.abs(x(row.end) - x(row.start))), height: 20, class: cls}));
        I.text(group, [signed(row, unit)], width - 67, y + 5, {"font-size": 13});
        group.append(I.svgEl("title", {}, `${row.label}: ${signed(row, unit)} (누적 ${I.format(row.end)}${unit})`));
        // Connector runs from this bar's bottom edge to the next bar's top edge at the running total.
        if (i < rows.length - 1) svg.append(I.svgEl("line", {x1: x(row.end), x2: x(row.end), y1: y + 10, y2: top + heights[i] + heights[i + 1] / 2 - 10, class: "iv-connector"}));
        svg.append(group); top += heights[i];
      });
      [...new Set([domain[0], 0, domain[1]])].forEach(value => I.text(svg, [I.format(value)], x(value), end + 32, {"text-anchor": "middle", "font-size": 12}));
      if (valueLabel.length) I.text(svg, valueLabel, (x(domain[0]) + x(domain[1])) / 2, end + 54, {"text-anchor": "middle"});
      I.mount(root, svg);
    });
  });
})();
