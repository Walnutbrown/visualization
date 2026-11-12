// Run after assembling /tmp/issue3-repro/chart.html; uses the installed Ego Lite browser.
const task = await taskSpace('issue-3 source review');
const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride', {
  width: 1200, height: 1100, deviceScaleFactor: 1, mobile: false,
});
await page.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await page.goto('file:///tmp/issue3-repro/chart.html');
await page.evaluate(async () => { await document.fonts.ready; });
const check = await page.evaluate(() => ({
  title: document.title,
  bars: document.querySelectorAll('svg[aria-labelledby="chart-title"] rect').length,
  vendors: document.querySelectorAll('script[data-illustrate-vendor]').length,
  bottom: [...document.querySelectorAll('main p')].at(-1).getBoundingClientRect().bottom,
  viewport: [innerWidth, innerHeight],
}));
if (check.bars !== 10 || check.vendors !== 0 || check.bottom > 1100
    || check.viewport.join(',') !== '1200,1100') {
  throw new Error(JSON.stringify(check));
}
console.log(check);
console.log(await page.screenshot({ path: '/tmp/issue3-repro/gallery-tags.png' }));
