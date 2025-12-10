import React from 'react';
import { render, screen } from '@testing-library/react';
import MultiMetricTrendChart from '../components/MultiMetricTrendChart'; // Dosya yolunu kendine göre düzelt
import '@testing-library/jest-dom';

// 1. RECHARTS MOCKLAMA (ÖNEMLİ)
// Recharts, test ortamında (JSDOM) bazen boyut hesaplayamaz ve hata verir.
// Bu yüzden ResponsiveContainer'ı basit bir div gibi davranması için mockluyoruz.
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div style={{ width: '100%', height: '500px' }}>{children}</div>,
  };
});

describe('MultiMetricTrendChart Bileşeni', () => {
  
  // Sahte Veri Seti
  const mockData = [
    {
      originalTimestamp: '2025-12-05T14:00:00.000Z',
      lcp_ms: 2500,  // 2.5 sn
      fcp_ms: 1000,  // 1.0 sn
      tti_ms: 3000,  // 3.0 sn
      tbt_ms: 150    // 150 ms
    }
  ];

  // SENARYO 1: Veri YOKSA kullanıcıya uyarı gösterilmeli
  test('Veri boş olduğunda "Grafik Verisi Yok" mesajını gösterir', () => {
    render(<MultiMetricTrendChart data={[]} selectedHostname="google.com" />);
    
    // Ekranda bu yazının olup olmadığını kontrol et
    const noDataText = screen.getByText(/Grafik Verisi Yok/i);
    expect(noDataText).toBeInTheDocument();
  });

  // SENARYO 2: Veri VARSA başlık ve grafik render edilmeli
  test('Veri geldiğinde doğru hostname ile başlığı gösterir', () => {
    render(<MultiMetricTrendChart data={mockData} selectedHostname="turkcell.com.tr" />);

    // Başlığın render edildiğini kontrol et
    const header = screen.getByText(/Detaylı Performans Analizi:/i);
    const hostname = screen.getByText('turkcell.com.tr');
    
    expect(header).toBeInTheDocument();
    expect(hostname).toBeInTheDocument();
    
    // CSS class kontrolü (Indigo rengi verilmiş mi?)
    expect(hostname).toHaveClass('text-indigo-400');
  });

  // SENARYO 3: Grafik elementlerinin varlığı
  test('Grafik bileşenleri (LCP, FCP vb.) render edilir', () => {
     // Recharts render ettiğinde HTML içinde class isimleri oluşturur veya textleri basar.
     // Biz burada sadece chart'ın patlamadan render olduğunu doğruluyoruz.
     const { container } = render(<MultiMetricTrendChart data={mockData} selectedHostname="test.com" />);
     
     // Container boş olmamalı
     expect(container.firstChild).not.toBeNull();
  });
});