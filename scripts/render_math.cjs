"use strict";
const fs = require("node:fs");
const katex = require("../assets/vendor/katex/katex.min.js");

try {
  const expressions = JSON.parse(fs.readFileSync(0, "utf8"));
  const output = expressions.map(({tex, display}) => katex.renderToString(tex, {
    displayMode: display, output: "htmlAndMathml", throwOnError: true,
    trust: ({command}) => { throw new Error(`${command}: 외부 자원·HTML 명령은 수식에 사용할 수 없습니다.`); },
    strict: "error", maxExpand: 1000, maxSize: 20,
  }));
  process.stdout.write(JSON.stringify(output));
} catch (error) {
  process.stderr.write(`수식 렌더링 실패: ${error.message}\n`);
  process.exitCode = 1;
}
