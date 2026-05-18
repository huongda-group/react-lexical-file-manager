import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function waitForApp(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForSelector('[data-testid="editor-content"]', { timeout: 15000 });
}

test('toolbar button opens file manager modal', async ({ page }) => {
  await waitForApp(page);
  await page.getByRole('button', { name: /media/i }).click();
  await expect(page.getByTestId('file-manager-modal')).toBeVisible();
});

test('close button dismisses modal', async ({ page }) => {
  await waitForApp(page);
  await page.getByRole('button', { name: /media/i }).click();
  await page.getByRole('button', { name: /close/i }).click();
  await expect(page.getByTestId('file-manager-modal')).not.toBeVisible();
});

test('clicking overlay backdrop dismisses modal', async ({ page }) => {
  await waitForApp(page);
  await page.getByRole('button', { name: /media/i }).click();
  await page.mouse.click(5, 5);
  await expect(page.getByTestId('file-manager-modal')).not.toBeVisible();
});

test('fullscreen toggle button changes modal size', async ({ page }) => {
  await waitForApp(page);
  await page.getByRole('button', { name: /media/i }).click();
  const modal = page.getByTestId('file-manager-modal');
  await expect(modal).toBeVisible();
  await page.getByRole('button', { name: /fullscreen/i }).click();
  const box = await modal.boundingBox();
  const viewport = page.viewportSize();
  expect(box?.width).toBeGreaterThan((viewport?.width ?? 0) * 0.95);
});

test('editor content area is accessible via data-testid', async ({ page }) => {
  await waitForApp(page);
  await expect(page.getByTestId('editor-content')).toBeVisible();
});
