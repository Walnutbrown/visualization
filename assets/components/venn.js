(() => {
  "use strict";
  const I = window.Illustrate;
  I.vennRegions = config => {
    const sets = config.sets;
    if (!Array.isArray(sets) || sets.length < 2 || sets.length > 3) throw new Error("sets에는 집합 2개 또는 3개가 필요합니다. 더 많으면 행렬이나 막대로 표현하세요.");
    const ids = sets.map(set => set.id);
    if (sets.some(set => typeof set.id !== "string" || typeof set.label !== "string") || new Set(ids).size !== ids.length) throw new Error("집합마다 중복되지 않는 id와 label이 필요합니다.");
    const seen = new Set();
    return (config.regions || []).map(region => {
      if (!Array.isArray(region.sets) || region.sets.some(id => !ids.includes(id)) || new Set(region.sets).size !== region.sets.length) throw new Error("region.sets에는 sets의 id만 중복 없이 넣습니다.");
      if (!region.sets.length && !config.universe) throw new Error("어느 집합에도 속하지 않는 영역에는 universe가 필요합니다.");
      const members = ids.filter(id => region.sets.includes(id)), signature = members.join("&");
      if (seen.has(signature)) throw new Error(`같은 영역이 두 번 있습니다: ${signature || "바깥"}`);
      seen.add(signature);
      const names = members.map(id => sets[ids.indexOf(id)].label);
      const name = !names.length ? "어느 집합에도 속하지 않음" : names.length === ids.length ? `${names.join("·")} 모두에 속함` : `${names.join("·")}에만 속함`;
      return {members, key: region.key ?? (signature || "outside"), name, text: region.text, highlight: Boolean(region.highlight)};
    });
  };
  I.register("venn", root => {
    const config = I.config(root), regions = I.vennRegions(config), sets = config.sets, n = sets.length;
    if (config.universe !== undefined && typeof config.universe !== "string") throw new Error("universe는 전체집합 이름 문자열입니다.");
    I.watch(root, width => {
      const pad = config.universe ? 30 : 0, r = Math.min(110, (width - 40) / 3.4), s = n === 3 ? .62 * r : .6 * r;
      const cx = width / 2, cy = pad + 34 + r + (n === 3 ? s / 2 : 0);
      const centers = n === 2 ? [[cx - s, cy], [cx + s, cy]] : [[cx - .866 * s, cy - s / 2], [cx + .866 * s, cy - s / 2], [cx, cy + s]];
      const height = centers.reduce((max, [, y]) => Math.max(max, y + r), 0) + (n === 3 ? 34 : 14) + (config.universe ? 14 : 0);
      const highlighted = regions.filter(region => region.highlight).map(region => region.name);
      const svg = I.svg(width, height, config.title, config.description || `${sets.map(set => set.label).join(", ")}의 관계.${highlighted.length ? ` 강조: ${highlighted.join(", ")}.` : ""}`);
      const defs = I.svgEl("defs"), clips = centers.map(([x, y]) => {
        const id = I.id(), clip = I.svgEl("clipPath", {id});
        clip.append(I.svgEl("circle", {cx: x, cy: y, r})); defs.append(clip); return id;
      });
      svg.append(defs);
      if (config.universe) {
        svg.append(I.svgEl("rect", {x: 1, y: 1, width: width - 2, height: height - 2, class: "iv-universe"}));
        I.text(svg, [config.universe], 12, 22, {"font-size": 13});
      }
      const inside = (x, y, i) => (x - centers[i][0]) ** 2 + (y - centers[i][1]) ** 2 <= r * r;
      regions.forEach(region => {
        const included = sets.map(set => region.members.includes(set.id));
        const maskId = I.id(), mask = I.svgEl("mask", {id: maskId});
        mask.append(I.svgEl("rect", {x: 0, y: 0, width, height, fill: "#fff"}));
        centers.forEach(([x, y], i) => { if (!included[i]) mask.append(I.svgEl("circle", {cx: x, cy: y, r, fill: "#000"})); });
        defs.append(mask);
        const group = I.svgEl("g", {"data-key": region.key});
        let shape = I.svgEl("rect", {x: 1, y: 1, width: width - 2, height: height - 2, mask: `url(#${maskId})`, class: region.highlight ? "iv-region iv-on" : "iv-region"});
        included.forEach((on, i) => { if (on) { const wrap = I.svgEl("g", {"clip-path": `url(#${clips[i]})`}); wrap.append(shape); shape = wrap; } });
        group.append(shape, I.svgEl("title", {}, region.text ? `${region.name}: ${region.text}` : region.name));
        if (region.text) {
          // Label sits at the centroid of grid samples inside the region; the outside region uses the top-right corner.
          let sx = 0, sy = 0, count = 0;
          for (let x = cx - 2 * r; x <= cx + 2 * r && region.members.length; x += r / 12)
            for (let y = cy - 2 * r; y <= cy + 2 * r; y += r / 12)
              if (included.every((on, i) => on === inside(x, y, i))) { sx += x; sy += y; count += 1; }
          const lines = I.wrap(region.text, region.members.length ? r * .8 : width / 3);
          const [lx, ly, anchor] = count ? [sx / count, sy / count - (lines.length - 1) * 9.5 + 5, "middle"] : [width - 12, 22, "end"];
          I.text(group, lines, lx, ly, {"text-anchor": anchor, ...(region.highlight ? {"font-weight": 500} : {})});
        }
        svg.append(group);
      });
      centers.forEach(([x, y], i) => {
        svg.append(I.svgEl("circle", {cx: x, cy: y, r, class: "iv-set"}));
        const below = n === 3 && i === 2;
        I.text(svg, [sets[i].label], x, below ? y + r + 22 : y - r - 10, {"text-anchor": "middle", "font-weight": 500});
      });
      I.mount(root, svg);
    });
  });
})();
