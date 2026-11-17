const task = await taskSpace("issue-3 option A evidence");
const page = task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride", {
  width: 1200, height: 1250, deviceScaleFactor: 1, mobile: false,
});
await page.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await page.goto("file:///private/tmp/issue3-assets-a/issue-3/option-a/chart.html");
await page.evaluate(async () => { await document.fonts.ready; });
const check = await page.evaluate(() => ({
  title: document.title,
  bars: document.querySelectorAll("svg[aria-labelledby='chart-title'] rect").length,
  vendors: document.querySelectorAll("script[data-illustrate-vendor]").length,
  bottom: [...document.querySelectorAll("main p")].at(-1).getBoundingClientRect().bottom,
  viewport: [innerWidth, innerHeight],
}));
if (check.bars !== 10 || check.vendors !== 0 || check.bottom > 1250
    || check.viewport.join(",") !== "1200,1250") {
  throw new Error(JSON.stringify(check));
}
console.log({ taskSpaceId: task.spaceId, ...check });
console.log(await page.screenshot({ path: "/private/tmp/issue3-assets-a/issue-3/option-a/gallery-tags.png" }));
