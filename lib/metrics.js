// lib/metrics.js

// Ortalama Hesaplama Fonksiyonu
export const calculateAverage = (data, key) => {
  if (!data || data.length === 0) return 0;
  
  const total = data.reduce((acc, curr) => acc + (curr[key] || 0), 0);
  return total / data.length;
};

// Performans Puanı Hesaplama (Basit mantık)
export const calculatePerformanceScore = (avgTTI) => {
  // TTI 2000ms altındaysa 100 puan, arttıkça düşer.
  const score = Math.max(0, Math.min(100, Math.round(100 - (avgTTI - 2000) / 50)));
  
  // Eğer çok iyiyse (2000 altı) 90-100 arası ver
  if (avgTTI < 2000) return 100;
  
  return score;
};

// FPS Durumunu Belirleme
export const getFPSStatus = (fps) => {
  if (fps >= 55) return 'Mükemmel (Akıcı)';
  if (fps >= 30) return 'Orta (Kabul Edilebilir)';
  return 'Kasıyor';
};