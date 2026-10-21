/* Run against `bundle exec jekyll build` served at http://127.0.0.1:4000. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.SITE_PLAYWRIGHT_PATH || 'playwright');
const origin = 'http://127.0.0.1:4000';
const routes = ['/', '/publications/', '/teaching/', '/portfolio/'];
(async () => {
  const browser = await chromium.launch();
  await fs.mkdir('layout-screenshots', { recursive: true });
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const route of routes) {
        const response = await page.goto(origin + route);
        assert.equal(response.status(), 200, route);
        await page.locator('.theme-toggle').waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('nav[aria-label="Main navigation"] a').count(), 5);
        assert.equal(await page.locator('#main').count(), 1);
        assert.equal(await page.locator('a[href="mailto:serfas@ualberta.ca"]').count() > 0, true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} overflows at ${width}px`);
        assert.equal(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), true, `${route} has missing images`);
        for (const link of await page.locator('nav a').all()) assert.equal(await link.isVisible(), true);
        for (const dark of [false, true]) {
          if ((await page.locator('.theme-toggle').getAttribute('aria-pressed')) !== String(dark)) await page.locator('.theme-toggle').click();
          assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark-mode')), dark);
          if (width === 390 || width === 1440) {
            const name = route === '/' ? 'about' : route.split('/')[1];
            await page.screenshot({ path: `layout-screenshots/${name}-${width}-${dark ? 'dark' : 'light'}.png`, fullPage: true });
          }
        }
        await page.reload();
        assert.equal(await page.locator('.theme-toggle').getAttribute('aria-pressed'), 'true', 'theme persists');
      }
      if (width === 390) {
        await page.goto(origin);
        await page.getByRole('button', { name: 'Follow', exact: true }).click();
        assert.equal(await page.locator('.author__urls').isVisible(), true);
        await page.keyboard.press('Tab');
      }
      assert.deepEqual(errors, [], `JavaScript errors at ${width}px`);
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.locator('.theme-toggle').click();
    assert.equal(await page.locator('.theme-toggle').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errors, [], 'storage denial must not break theme');
    for (const route of ['/about/', '/about.html']) {
      await page.goto(origin + route);
      await page.waitForURL(origin + '/');
    }
    assert.equal((await page.request.get(origin + '/files/DEVIN_SERFAS_RESUME.pdf')).status(), 200);
    await context.close();
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await noJs.newPage();
    await staticPage.goto(origin);
    assert.equal(await staticPage.getByRole('link', { name: 'Research', exact: true }).isVisible(), true);
    assert.equal(await staticPage.locator('.theme-toggle').isVisible(), false);
    await noJs.close();
    console.log('Passed: 4 pages × 5 widths, light/dark, persistence, storage denial, mobile profile, redirects, CV and no-JS navigation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
