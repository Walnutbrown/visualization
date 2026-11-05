(() => {
  "use strict";
  const I = window.Illustrate;
  const SEQUENTIAL = [1, 2, 3, 4].map(i => [`var(--seq-${i})`, `var(--seq-ink-${i})`]);
  const DIVERGING = ["n2", "n1", "0", "p1", "p2"].map(i => [`var(--div-${i})`, `var(--div-ink-${i})`]);
  I.heatmapScale = config => {
    const values = config.values.flat().filter(value => value !== null);
    if (!values.length) throw new Error("값이 있는 셀이 없습니다.");
    const domain = config.domain ? I.domain(config.domain, "domain") : [Math.min(...values), Math.max(...values)];
    if (values.some(value => value < domain[0] || value > domain[1])) throw new Error("domain 밖의 값이 있습니다.");
    if (config.scale === "diverging") {
      const mid = config.midpoint === undefined ? 0 : I.number(config.midpoint, "midpoint");
      const reach = Math.max(Math.abs(domain[0] - mid), Math.abs(domain[1] - mid)) || 1;
      const cuts = [-.6, -.2, .2, .6].map(t => mid + t * reach);
      return {palette: DIVERGING, edges: [mid - reach, ...cuts, mid + reach], classOf: value => cuts.filter(cut => value > cut + 1e-12).length};
    }
    if (config.scale !== undefined && config.scale !== "sequential") throw new Error("scale은 sequential 또는 diverging입니다.");
    const span = domain[1] - domain[0] || 1;
    return {palette: SEQUENTIAL, edges: [0, 1, 2, 3, 4].map(i => domain[0] + span * i / 4), classOf: value => Math.min(3, Math.floor((value - domain[0]) / span * 4 + 1e-9))};
  };
  I.register("heatmap", root => {
    const config = I.config(root), {rows, columns, values} = config, unit = config.unit || "";
    if (!Array.isArray(rows) || !rows.length || !Array.isArray(columns) || !columns.length) throw new Error("rows와 columns 배열이 필요합니다.");
    if (![...rows, ...columns].every(label => typeof label === "string")) throw new Error("행·열 이름은 문자열이어야 합니다.");
    if (!Array.isArray(values) || values.length !== rows.length || values.some(row => !Array.isArray(row) || row.length !== columns.length)) throw new Error("values는 행 수 × 열 수 크기의 2차원 배열이어야 합니다.");
    values.flat().forEach(value => { if (value !== null) I.number(value, "values"); });
    const color = I.heatmapScale(config), showValues = config.showValues ?? rows.length * columns.length <= 144;
    I.watch(root, available => {
      const labelWidth = Math.min(140, available * .3), cell = Math.max(44, Math.min(72, (available - labelWidth) / columns.length));
      const width = labelWidth + cell * columns.length, heads = columns.map(name => I.wrap(name, cell - 6, 12));
      const headHeight = Math.max(...heads.map(lines => lines.length)) * 19 + (config.columnLabel ? 24 : 4);
      const rowLabels = rows.map(name => I.wrap(name, labelWidth - 10));
      const rowHeights = rowLabels.map(lines => Math.max(36, lines.length * 19 + 10));
      const gridBottom = headHeight + rowHeights.reduce((a, b) => a + b, 0);
      const svg = I.svg(width, gridBottom + 64, config.title, config.description || rows.map((row, r) => `${row}: ${columns.map((column, c) => `${column} ${values[r][c] === null ? "자료 없음" : I.format(values[r][c]) + unit}`).join(", ")}`).join(". "));
      if (config.columnLabel) I.text(svg, [config.columnLabel], labelWidth, 14, {"font-size": 12, "font-weight": 500});
      if (config.rowLabel) I.text(svg, [config.rowLabel], 0, headHeight - 8, {"font-size": 12, "font-weight": 500});
      heads.forEach((lines, c) => I.text(svg, lines, labelWidth + cell * (c + .5), headHeight - 8 - (lines.length - 1) * 19, {"text-anchor": "middle", "font-size": 12}));
      let top = headHeight;
      rows.forEach((row, r) => {
        const group = I.svgEl("g", {"data-key": row}), h = rowHeights[r];
        I.text(group, rowLabels[r], 0, top + h / 2 - (rowLabels[r].length - 1) * 9.5 + 5);
        values[r].forEach((value, c) => {
          const x = labelWidth + cell * c, label = `${row}, ${columns[c]}: ${value === null ? "자료 없음" : I.format(value) + unit}`;
          let mark;
          if (value === null) {
            mark = I.svgEl("rect", {x: x + 1, y: top + 1, width: cell - 2, height: h - 2, class: "iv-cell-empty"});
            group.append(mark);
            I.text(group, ["–"], x + cell / 2, top + h / 2 + 5, {"text-anchor": "middle", "font-size": 13});
          } else {
            const [fill, ink] = color.palette[color.classOf(value)];
            mark = I.svgEl("rect", {x, y: top, width: cell, height: h, class: "iv-cell", style: `fill: ${fill}`});
            group.append(mark);
            if (showValues) I.text(group, [I.format(value)], x + cell / 2, top + h / 2 + 5, {"text-anchor": "middle", "font-size": 13, style: `fill: ${ink}`});
          }
          mark.append(I.svgEl("title", {}, label));
        });
        svg.append(group); top += h;
      });
      // Legend as a binned scale: swatches with their boundary values underneath, like axis ticks.
      const swatch = Math.min(80, (width - 24) / color.palette.length);
      color.palette.forEach(([fill], i) => svg.append(I.svgEl("rect", {x: 12 + i * swatch, y: gridBottom + 16, width: swatch, height: 12, class: "iv-cell", style: `fill: ${fill}`})));
      color.edges.forEach((edge, i) => I.text(svg, [I.format(edge)], 12 + i * swatch, gridBottom + 46, {"text-anchor": "middle", "font-size": 12}));
      if (unit) I.text(svg, [`단위: ${unit}`], width, gridBottom + 62, {"text-anchor": "end", "font-size": 12});
      svg.style.maxWidth = `${width}px`;
      if (width > available) {
        svg.style.minWidth = `${width}px`;
        const scroll = I.el("div", {class: "iv-scroll", tabindex: "0", role: "region", "aria-label": `${config.title} (가로 스크롤)`});
        scroll.append(svg); I.mount(root, scroll);
      } else I.mount(root, svg);
    });
  });
})();
