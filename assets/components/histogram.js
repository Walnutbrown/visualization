(() => {
  "use strict";
  const I = window.Illustrate;
  const scale = (domain, start, end) => value => start + (value - domain[0]) / (domain[1] - domain[0]) * (end - start);
  I.histogramBins = config => {
    if (Array.isArray(config.bins)) {
      if (!config.bins.length) throw new Error("bins가 비어 있습니다.");
      config.bins.forEach((bin, i) => {
        I.number(bin.from, "bins.from"); I.number(bin.to, "bins.to"); I.number(bin.count, "bins.count");
        if (bin.to <= bin.from || bin.count < 0) throw new Error("구간은 from < to, count ≥ 0이어야 합니다.");
        if (i && bin.from !== config.bins[i - 1].to) throw new Error("구간은 빈틈 없이 이어져야 합니다(앞 구간의 to = 다음 구간의 from).");
        const width = config.bins[0].to - config.bins[0].from;
        if (Math.abs((bin.to - bin.from) - width) > 1e-9 * width) throw new Error("개수를 표시하는 히스토그램의 구간 너비는 같아야 합니다.");
      });
      return config.bins.map(bin => ({from: bin.from, to: bin.to, count: bin.count}));
    }
    if (!Array.isArray(config.values) || !config.values.length) throw new Error("values 또는 bins가 필요합니다.");
    config.values.forEach(value => I.number(value, "values"));
    const width = I.number(config.binWidth, "binWidth");
    if (width <= 0) throw new Error("binWidth는 0보다 커야 합니다.");
    const low = Math.min(...config.values), high = Math.max(...config.values);
    const start = config.start === undefined ? Math.floor(low / width) * width : I.number(config.start, "start");
    if (start > low) throw new Error("start가 최솟값보다 큽니다.");
    // Bins are [from, to) and the last one is closed; the tolerance keeps edge values (0.3 with width 0.1) out of the lower bin.
    const count = Math.max(1, Math.ceil((high - start) / width - 1e-9));
    const bins = Array.from({length: count}, (_, i) => ({from: start + i * width, to: start + (i + 1) * width, count: 0}));
    config.values.forEach(value => { bins[Math.min(count - 1, Math.floor((value - start) / width + 1e-9))].count += 1; });
    return bins;
  };
  I.register("histogram", root => {
    const config = I.config(root), bins = I.histogramBins(config), unit = config.unit || "";
    const markers = config.markers || [];
    // Counts get whole-number ticks: the top of the axis rounds up to a multiple of 4 steps.
    const xd = [bins[0].from, bins.at(-1).to], peak = Math.max(...bins.map(bin => bin.count)), yMax = Number.isInteger(peak) ? Math.max(4, Math.ceil(peak / 4) * 4) : peak || 1;
    markers.forEach(marker => {
      I.number(marker.x, "markers.x");
      if (marker.x < xd[0] || marker.x > xd[1] || typeof marker.label !== "string") throw new Error("marker에는 구간 범위 안의 x와 label이 필요합니다.");
    });
    const range = bin => `${I.format(bin.from)}–${I.format(bin.to)}${unit}`;
    I.watch(root, width => {
      const top = 22 + markers.length * 18, bottom = top + 194, height = bottom + 56;
      const x = scale(xd, 49, width - 14), y = scale([0, yMax], bottom, top);
      const svg = I.svg(width, height, config.title, config.description || bins.map(bin => `${range(bin)}: ${I.format(bin.count)}`).join(", "));
      for (let i = 0; i <= 4; i++) {
        const value = yMax * i / 4;
        svg.append(I.svgEl("line", {x1: 49, x2: width - 14, y1: y(value), y2: y(value), class: "iv-grid"}));
        I.text(svg, [I.format(value)], 42, y(value) + 4, {"text-anchor": "end", "font-size": 12});
      }
      const barWidth = x(bins[0].to) - x(bins[0].from), showCounts = bins.length <= 15 && barWidth >= 22;
      bins.forEach((bin, i) => {
        const group = I.svgEl("g", {"data-key": String(i)});
        group.append(I.svgEl("rect", {x: x(bin.from), y: y(bin.count), width: x(bin.to) - x(bin.from), height: bottom - y(bin.count), class: "iv-bin"}));
        if (showCounts && bin.count) I.text(group, [I.format(bin.count)], (x(bin.from) + x(bin.to)) / 2, y(bin.count) - 6, {"text-anchor": "middle", "font-size": 12});
        group.append(I.svgEl("title", {}, `${range(bin)}: ${I.format(bin.count)}`));
        svg.append(group);
      });
      const edges = [...bins.map(bin => bin.from), xd[1]], every = Math.max(1, Math.ceil(edges.length * 44 / (width - 63)));
      edges.forEach((edge, i) => { if (i % every === 0) I.text(svg, [I.format(edge)], x(edge), bottom + 21, {"text-anchor": "middle", "font-size": 12}); });
      svg.append(I.svgEl("path", {d: `M49,${top} V${bottom} H${width - 14}`, class: "iv-axis", fill: "none"}));
      markers.forEach((marker, i) => {
        const mx = x(marker.x), labelY = 30 + i * 18;
        svg.append(I.svgEl("line", {x1: mx, x2: mx, y1: labelY + 4, y2: bottom, class: "iv-marker"}));
        I.text(svg, [`${marker.label} ${I.format(marker.x)}${unit}`], mx, labelY, {"text-anchor": mx > width * .6 ? "end" : "start", "font-size": 12});
      });
      I.text(svg, [config.yLabel || "개수"], 49, 12, {"font-size": 12});
      I.text(svg, [config.xLabel || "값"], width - 14, height - 8, {"text-anchor": "end", "font-size": 12});
      I.mount(root, svg);
    });
  });
})();
