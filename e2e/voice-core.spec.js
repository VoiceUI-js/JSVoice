// @ts-check
import { test, expect } from '@playwright/test';

test.describe('JSVoice core harness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/harness.html');
    await expect(page.locator('body')).toHaveAttribute('data-ready', '1', { timeout: 15_000 });
  });

  test('loads harness and lists commands', async ({ page }) => {
    await page.getByTestId('list-commands').click();
    await expect(page.getByTestId('log')).toContainText('commands:');
    await expect(page.locator('#commands li')).toHaveCount(1);
  });

  test('start / stop listening with fake engine', async ({ page }) => {
    await page.getByTestId('start').click();
    await expect(page.getByTestId('log')).toContainText('listening:true', { timeout: 10_000 });
    await page.getByTestId('stop').click();
    await expect(page.getByTestId('log')).toContainText('listening:false', { timeout: 10_000 });
  });

  test('simulate hello world recognizes command', async ({ page }) => {
    await page.getByTestId('start').click();
    await expect(page.getByTestId('log')).toContainText('listening:true', { timeout: 10_000 });
    await page.getByTestId('simulate-hello').click();
    await expect(page.getByTestId('log')).toContainText('action:hello_world', { timeout: 10_000 });
    await expect(page.getByTestId('log')).toContainText('recognized:');
  });

  test('unknown phrase marks not recognized', async ({ page }) => {
    await page.getByTestId('start').click();
    await expect(page.getByTestId('log')).toContainText('listening:true', { timeout: 10_000 });
    await page.getByTestId('simulate-unknown').click();
    await expect(page.getByTestId('log')).toContainText('not_recognized:', { timeout: 10_000 });
  });

  test('processText works without mic simulation race', async ({ page }) => {
    await page.getByTestId('process-text').click();
    await expect(page.getByTestId('log')).toContainText('processText:true', { timeout: 10_000 });
    await expect(page.getByTestId('log')).toContainText('action:hello_world');
  });

  test('toggle starts listening', async ({ page }) => {
    await page.getByTestId('toggle').click();
    await expect(page.getByTestId('log')).toContainText('listening:true', { timeout: 10_000 });
  });

  test('palette flag control is keyboard-clickable', async ({ page }) => {
    const btn = page.getByTestId('open-palette-flag');
    await btn.focus();
    await expect(btn).toBeFocused();
    await btn.click();
    await expect(page.locator('body')).toHaveAttribute('data-palette', 'open');
  });
});
