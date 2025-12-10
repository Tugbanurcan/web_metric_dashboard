// tests/dashboard.spec.js
import { test, expect } from '@playwright/test';

test('Dashboard ana sayfası açılmalı', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.getByText('Genel Bakış')).toBeVisible();
});

test('Rehber butonu çalışmalı', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 1. "Rehber" butonunu bul ve tıkla
  // (Bazen ikon olduğu için ismi tam göremeyebilir, test-id eklemek en garantisidir ama şimdilik text ile deneyelim)
  await page.getByRole('button', { name: /Rehber/i }).click();
  
  // 2. Modalın açılmasını bekle (Animasyon süresi)
  await page.waitForTimeout(500);

  // 3. İçindeki "FPS" başlığını kontrol et (Sadece FPS kelimesi yeterli)
  // "i" harfi büyük/küçük harf duyarlılığını kapatır.
  await expect(page.getByRole('heading', { name: /FPS/i })).toBeVisible();
});