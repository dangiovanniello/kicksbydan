import { test, expect } from '@playwright/test';

const settle = page => page.waitForFunction(() => document.documentElement.classList.contains('landed'), null, { timeout: 15000 });

test('logo intro plays, lands in the header and reveals the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#intro')).toBeVisible();
  await settle(page);
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('#header-logo')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Quality kicks. Fair prices.');
});

test('intro can be skipped with a click', async ({ page }) => {
  await page.goto('/');
  await page.locator('#intro').click();
  await settle(page);
  await expect(page.locator('#intro')).toBeHidden();
});

test('scrolling the stage turns the shoe and moves to the next pair', async ({ page }) => {
  await page.goto('/');
  await page.locator('#intro').click();
  await settle(page);
  const top = await page.evaluate(() => document.querySelector('#rotation').getBoundingClientRect().top + scrollY);
  const per = await page.evaluate(() => (document.querySelector('#rotation').offsetHeight - innerHeight) / 14);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top + per * 0.4);
  await expect.poll(() => page.evaluate(() => window.__kicksStage.frame)).toBeGreaterThan(8);
  await expect(page.locator('#st-index')).toHaveText('01');
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top + per * 1.3);
  await expect(page.locator('#st-index')).toHaveText('02');
  await expect(page.locator('#st-name')).toContainText('Lot 26');
});

test('pairs filter and product dialog work', async ({ page }) => {
  await page.goto('/');
  await page.locator('#intro').click();
  await settle(page);
  await expect(page.locator('.card')).toHaveCount(16);
  await page.locator('#tabs [data-brand=jordan]').click();
  await expect(page.locator('.card')).toHaveCount(4);
  await page.locator('.card').first().click();
  await expect(page.locator('#product-dialog')).toBeVisible();
  await expect(page.locator('#product-dialog a[href="https://www.instagram.com/kicks.bydan/"]')).toBeVisible();
  await page.locator('.dialog-close').click();
  await expect(page.locator('#product-dialog')).toBeHidden();
});

test('reduced motion skips the intro and shows everything', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('.hero-foot p')).toBeVisible();
  await context.close();
});
