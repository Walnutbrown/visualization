(() => {
  "use strict";
  const I = window.Illustrate;
  const models = {
    linear: {parameters: {a: {label: "기울기 a", min: -2, max: 2, step: .25, value: 1}, b: {label: "절편 b", min: -4, max: 4, step: .5, value: 0}}, calculate: (x, p) => p.a * x + p.b, equation: p => `y = ${I.format(p.a)}x ${p.b < 0 ? "−" : "+"} ${I.format(Math.abs(p.b))}`},
    exponential: {parameters: {a: {label: "처음 크기 a", min: .5, max: 3, step: .5, value: 1}, k: {label: "변화율 k", min: -.5, max: .5, step: .1, value: .2}}, calculate: (x, p) => p.a * Math.exp(p.k * x), equation: p => `y = ${I.format(p.a)} × exp(${I.format(p.k)}x)`}
  };
  I.register("model", root => {
    const config = I.config(root), model = models[config.model];
    if (!model) throw new Error("model은 linear 또는 exponential입니다. 다른 모델은 검증한 별도 계산 코드가 필요합니다.");
    if (config.parameters && (typeof config.parameters !== "object" || Array.isArray(config.parameters) || Object.keys(config.parameters).some(key => !Object.hasOwn(model.parameters, key)))) throw new Error("지원하지 않는 매개변수가 있습니다.");
    const domain = I.domain(config.xDomain || [-4, 4], "xDomain"), parameters = {}, values = {}, defaults = {};
    for (const [key, base] of Object.entries(model.parameters)) {
      const parameter = {...base, ...config.parameters?.[key]};
      ["min", "max", "step", "value"].forEach(field => I.number(parameter[field], `${key}.${field}`));
      if (parameter.min >= parameter.max || parameter.step <= 0 || parameter.value < parameter.min || parameter.value > parameter.max) throw new Error(`${key}: 범위·간격·기본값을 확인하세요.`);
      const position = (parameter.value - parameter.min) / parameter.step;
      if (Math.abs(position - Math.round(position)) > 1e-8) throw new Error(`${key}: 기본값을 간격에 맞추세요.`);
      parameters[key] = parameter; values[key] = defaults[key] = parameter.value;
    }
    const points = p => Array.from({length: 101}, (_, i) => {
      const x = domain[0] + (domain[1] - domain[0]) * i / 100;
      return {x, y: I.number(model.calculate(x, p), "모델 출력")};
    });
    const keys = Object.keys(parameters), corners = [];
    for (const first of [parameters[keys[0]].min, parameters[keys[0]].max]) for (const second of [parameters[keys[1]].min, parameters[keys[1]].max]) corners.push(...points({[keys[0]]: first, [keys[1]]: second}).map(d => d.y));
    let low = Math.min(...corners), high = Math.max(...corners);
    const padding = Math.max((high - low) * .08, .1);
    const yDomain = I.domain(config.yDomain || [low - padding, high + padding], "yDomain");
    if (yDomain[0] > low || yDomain[1] < high) throw new Error("yDomain은 매개변수 범위 전체의 결과를 포함해야 합니다.");
    const probe = config.probe ?? domain[0] + (domain[1] - domain[0]) * .75;
    I.number(probe, "probe");
    if (probe < domain[0] || probe > domain[1]) throw new Error("probe는 xDomain 안에 있어야 합니다.");
    // cases: 원자료 사례의 입력값(x) 목록. 슬라이더를 움직일 때마다 표의 현재 값을 같은 계산식으로 다시 구한다.
    const cases = config.cases ?? [];
    if (!Array.isArray(cases) || cases.some(x => !Number.isFinite(x) || x < domain[0] || x > domain[1])) throw new Error("cases는 xDomain 안의 숫자 목록이어야 합니다.");
    const table = I.el("table", {class: "iv-model-cases"}), body = I.el("tbody");
    if (config.caseTitle || config.caseSource) table.append(I.el("caption", {}, [config.caseTitle, config.caseSource && `출처: ${config.caseSource}`].filter(Boolean).join(" · ")));
    const head = I.el("tr");
    for (const text of [config.xLabel || "x", `처음 ${config.yLabel || "y"}`, `현재 ${config.yLabel || "y"}`]) head.append(I.el("th", {scope: "col"}, text));
    const thead = I.el("thead"); thead.append(head); table.append(thead, body);
    const panel = I.el("div"), controls = I.el("div", {class: "iv-model-controls"}), plot = I.el("div"), outputs = new Map(), inputs = new Map();
    const summary = I.el("output", {class: "iv-model-summary", "aria-live": "polite", "aria-atomic": "true"});
    const reset = I.el("button", {type: "button"}, "초기화");
    let width = 320;
    const reference = points(defaults);
    const draw = () => {
      // The probe x joins the curve's points so the probe on the plot reads the same value as the summary.
      const data = [...points(values), {x: probe, y: model.calculate(probe, values)}].sort((a, b) => a.x - b.x);
      plot.replaceChildren(I.plot({kind: "line", title: config.title, description: config.description, data, reference, probe, xDomain: domain, yDomain, xLabel: config.xLabel || "x", yLabel: config.yLabel || "y"}, width));
      summary.textContent = `${model.equation(values)}, x = ${I.format(probe)} → y = ${I.format(model.calculate(probe, values))}`;
      body.replaceChildren(...cases.map(x => { const row = I.el("tr"); row.append(I.el("td", {}, I.format(x)), I.el("td", {}, I.format(model.calculate(x, defaults))), I.el("td", {class: "iv-case-now"}, I.format(model.calculate(x, values)))); return row; }));
      for (const [key, output] of outputs) output.textContent = I.format(values[key]);
    };
    for (const [key, parameter] of Object.entries(parameters)) {
      const id = I.id(), row = I.el("div", {class: "iv-control-row"});
      const input = I.el("input", {id, type: "range", min: parameter.min, max: parameter.max, step: parameter.step, value: parameter.value, "data-parameter": key});
      const output = I.el("output", {for: id}); outputs.set(key, output); inputs.set(key, input);
      input.addEventListener("input", () => { values[key] = Number(input.value); draw(); });
      row.append(I.el("label", {for: id}, parameter.label), input, output); controls.append(row);
    }
    reset.addEventListener("click", () => { for (const key of keys) { values[key] = defaults[key]; inputs.get(key).value = defaults[key]; } draw(); });
    controls.append(reset); panel.append(controls, plot, summary, ...(cases.length ? [table] : []), I.el("p", {class: "iv-legend"}, "실선은 현재 값, 점선은 처음 값입니다. 축 범위는 고정입니다."));
    I.mount(root, panel);
    I.watch(root, nextWidth => { width = nextWidth; draw(); });
  });
})();
