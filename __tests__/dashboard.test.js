import { calculateAverage, calculatePerformanceScore, getFPSStatus } from '../lib/metrics';

describe('Dashboard Hesaplama Mantığı', () => {
  
  // SENARYO 1: ORTALAMA HESAPLAMA
  test('Ortalama FPS doğru hesaplanmalı', () => {
    const mockData = [
      { fps: 60 },
      { fps: 40 },
      { fps: 50 }
    ];
    // (60 + 40 + 50) / 3 = 50 olmalı
    const result = calculateAverage(mockData, 'fps');
    expect(result).toBe(50);
  });

  test('Veri yoksa ortalama 0 dönmeli', () => {
    const result = calculateAverage([], 'fps');
    expect(result).toBe(0);
  });

  // SENARYO 2: FPS DURUM METNİ
  test('55 FPS üstü "Mükemmel" olarak etiketlenmeli', () => {
    expect(getFPSStatus(60)).toBe('Mükemmel (Akıcı)');
    expect(getFPSStatus(55)).toBe('Mükemmel (Akıcı)');
  });

  test('20 FPS "Kasıyor" olarak etiketlenmeli', () => {
    expect(getFPSStatus(20)).toBe('Kasıyor');
  });

  // SENARYO 3: PERFORMANS SKORU
  test('Düşük TTI (Hızlı Site) yüksek puan almalı', () => {
    const lowTTI = 1500; // Çok hızlı
    expect(calculatePerformanceScore(lowTTI)).toBe(100);
  });

});