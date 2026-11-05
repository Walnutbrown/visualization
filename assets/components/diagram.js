(() => {
  "use strict";
  const I = window.Illustrate;
  I.register("diagram", root => {
    const config = I.config(root), ids = new Map();
    if (!Array.isArray(config.layers) || !config.layers.length || !Array.isArray(config.links)) throw new Error("layers와 links 배열이 필요합니다.");
    config.layers.forEach((layer, level) => {
      if (!Array.isArray(layer) || !layer.length) throw new Error("빈 계층은 사용할 수 없습니다.");
      layer.forEach(node => {
        if (typeof node.id !== "string" || ids.has(node.id) || typeof node.label !== "string") throw new Error("노드에는 중복되지 않는 id와 label이 필요합니다.");
        ids.set(node.id, {level, label: node.label});
      });
    });
    config.links.forEach(link => {
      if (!ids.has(link.from) || !ids.has(link.to)) throw new Error("연결 대상 노드가 없습니다.");
      if (ids.get(link.from).level >= ids.get(link.to).level) throw new Error("기본 관계도는 앞 계층에서 뒤 계층으로 연결합니다. 순환 관계는 별도 SVG로 표현하세요.");
    });
    I.watch(root, available => {
      const description = config.description || config.links.map(link => `${ids.get(link.from).label || link.from} ${link.label || "→"} ${ids.get(link.to).label || link.to}`).join(". ");
      if (config.layers.some(layer => layer.length * 145 + 24 > available) && config.links.length) {
        const definitions = new Map(config.layers.flat().map(node => [node.id, node]));
        const boxWidth = (available - 70) / 2;
        const rows = config.links.map(link => {
          const from = definitions.get(link.from), to = definitions.get(link.to);
          const left = I.wrap(from.label, boxWidth - 20), right = I.wrap(to.label, boxWidth - 20);
          return {link, from, to, left, right, height: Math.max(left.length, right.length) * 19 + 38};
        });
        const height = rows.reduce((sum, row) => sum + row.height + 22, 0);
        const svg = I.svg(available, height, config.title, description);
        let y = 0;
        rows.forEach(row => {
          const rightX = available - boxWidth, middle = y + row.height / 2;
          for (const [node, lines, x] of [[row.from, row.left, 0], [row.to, row.right, rightX]]) {
            const group = I.svgEl("g", {"data-key": node.id});
            group.append(I.svgEl("rect", {x, y, width: boxWidth, height: row.height, rx: 3, class: "iv-node"}));
            I.text(group, lines, x + boxWidth / 2, middle - (lines.length - 1) * 9.5 + 5, {"text-anchor": "middle"});
            svg.append(group);
          }
          const arrowY = middle + (row.link.label ? 14 : 0);
          svg.append(I.svgEl("path", {d: `M${boxWidth + 7},${arrowY} H${rightX - 8} M${rightX - 15},${arrowY - 5} L${rightX - 8},${arrowY} L${rightX - 15},${arrowY + 5}`, class: "iv-edge", fill: "none"}));
          if (row.link.label) I.text(svg, I.wrap(row.link.label, 56, 13), available / 2, middle - 10, {"text-anchor": "middle", "font-size": 13});
          y += row.height + 22;
        });
        I.mount(root, svg); return;
      }
      const width = Math.max(available, Math.max(...config.layers.map(layer => layer.length)) * 145 + 24);
      let top = 20;
      const nodes = [];
      config.layers.forEach(layer => {
        const nodeWidth = Math.min(240, (width - 24 - 20 * (layer.length - 1)) / layer.length);
        const total = layer.length * nodeWidth + (layer.length - 1) * 20;
        const prepared = layer.map(node => ({...node, lines: I.wrap(node.label, nodeWidth - 24)}));
        const height = Math.max(...prepared.map(node => node.lines.length * 19 + 30), 60);
        prepared.forEach((node, index) => {
          const position = {...node, x: (width - total) / 2 + index * (nodeWidth + 20), y: top, width: nodeWidth, height};
          ids.set(node.id, {...ids.get(node.id), ...position}); nodes.push(position);
        });
        top += height + 76;
      });
      const svg = I.svg(width, top - 56, config.title, description), markerId = I.id();
      const marker = I.svgEl("marker", {id: markerId, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse"});
      marker.append(I.svgEl("path", {d: "M0,0 L10,5 L0,10 z", class: "iv-arrow"}));
      const defs = I.svgEl("defs"); defs.append(marker); svg.append(defs);
      config.links.forEach(link => {
        const from = ids.get(link.from), to = ids.get(link.to), x1 = from.x + from.width / 2, x2 = to.x + to.width / 2;
        const y1 = from.y + from.height, y2 = to.y, middle = (y1 + y2) / 2;
        svg.append(I.svgEl("path", {d: `M${x1},${y1} V${middle} H${x2} V${y2 - 3}`, class: "iv-edge", "marker-end": `url(#${markerId})`, fill: "none"}));
        if (link.label) I.text(svg, I.wrap(link.label, 100, 13), (x1 + x2) / 2 + (x1 === x2 ? 10 : 0), middle - 9, {"text-anchor": x1 === x2 ? "start" : "middle", "font-size": 13});
      });
      nodes.forEach(node => {
        const group = I.svgEl("g", {"data-key": node.id});
        group.append(I.svgEl("rect", {x: node.x, y: node.y, width: node.width, height: node.height, rx: 3, class: "iv-node"}));
        I.text(group, node.lines, node.x + node.width / 2, node.y + (node.height - (node.lines.length - 1) * 19) / 2 + 5, {"text-anchor": "middle"});
        svg.append(group);
      });
      const scroll = I.el("div", {class: "iv-scroll", tabindex: "0", role: "region", "aria-label": config.title});
      svg.style.minWidth = `${width}px`; scroll.append(svg); I.mount(root, scroll);
    });
  });
})();
