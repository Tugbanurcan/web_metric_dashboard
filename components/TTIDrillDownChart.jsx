"use client";

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft } from 'lucide-react';

// NOT: Gerçek projede bu veriyi veritabanından 'fetch' ile çekeceksin.
// Örnek olması için 7 günlük mock data yapısı kuruyorum.
const MOCK_DATA = [
  { date: '2025-12-01', hour: '10:00', url: 'google.com', tti: 6984 },
  { date: '2025-12-01', hour: '11:00', url: 'youtube.com', tti: 11576 },
  { date: '2025-12-02', hour: '09:00', url: 'twitter.com', tti: 18610 },
  { date: '2025-12-02', hour: '14:00', url: 'instagram.com', tti: 34251 },
  { date: '2025-12-03', hour: '16:00', url: 'wikipedia.org', tti: 2584 },
  { date: '2025-12-03', hour: '17:00', url: 'amazon.com', tti: 4500 },
  { date: '2025-12-04', hour: '10:00', url: 'yahoo.com', tti: 3100 },
  // ... veritabanından gelen tüm satırlar burada olacak
];

export default function TTIDrillDownChart({ rawData = MOCK_DATA }) {
  // Görünüm Seviyesi: 'daily' | 'hourly' | 'page'
  const [viewLevel, setViewLevel] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  // 1. SEVİYE VERİSİ: Günlük Ortalama TTI
  const dailyData = useMemo(() => {
    const groups = {};
    rawData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = { date: item.date, tti_total: 0, count: 0 };
      groups[item.date].tti_total += item.tti;
      groups[item.date].count += 1;
    });
    return Object.values(groups).map(g => ({
      name: g.date,
      tti: Math.round(g.tti_total / g.count) // Ortalama alıyoruz
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawData]);

  // 2. SEVİYE VERİSİ: Seçilen güne ait Saatlik Ortalama TTI
  const hourlyData = useMemo(() => {
    if (!selectedDate) return [];
    const filtered = rawData.filter(d => d.date === selectedDate);
    
    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.hour]) groups[item.hour] = { hour: item.hour, tti_total: 0, count: 0 };
      groups[item.hour].tti_total += item.tti;
      groups[item.hour].count += 1;
    });

    return Object.values(groups).map(g => ({
      name: g.hour, // X ekseni için
      tti: Math.round(g.tti_total / g.count)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawData, selectedDate]);

  // 3. SEVİYE VERİSİ: Seçilen saatteki Sayfalar
  const pageData = useMemo(() => {
    if (!selectedDate || !selectedHour) return [];
    return rawData
      .filter(d => d.date === selectedDate && d.hour === selectedHour)
      .map(d => ({
        name: d.url, // X ekseni URL olacak
        tti: d.tti
      }));
  }, [rawData, selectedDate, selectedHour]);

  // Grafiğe tıklanınca ne olacak?
  const handleChartClick = (data) => {
    if (!data || !data.activePayload) return;
    const clickedLabel = data.activePayload[0].payload.name;

    if (viewLevel === 'daily') {
      setSelectedDate(clickedLabel);
      setViewLevel('hourly');
    } else if (viewLevel === 'hourly') {
      setSelectedHour(clickedLabel);
      setViewLevel('page');
    }
  };

  // Geri dönme fonksiyonu
  const handleBack = () => {
    if (viewLevel === 'page') setViewLevel('hourly');
    else if (viewLevel === 'hourly') setViewLevel('daily');
  };

  // Şu an hangi veriyi göstereceğiz?
  const currentData = viewLevel === 'daily' ? dailyData : (viewLevel === 'hourly' ? hourlyData : pageData);
  const xLabel = viewLevel === 'daily' ? 'Tarih' : (viewLevel === 'hourly' ? 'Saat' : 'Sayfa URL');

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {viewLevel !== 'daily' && (
            <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-lg font-bold text-gray-800">
            TTI Trend Analizi 
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({viewLevel === 'daily' ? '7 Günlük' : viewLevel === 'hourly' ? `${selectedDate} Saatlik` : `${selectedHour} Sayfa Detayı`})
            </span>
          </h2>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {viewLevel === 'daily' ? 'Güne Tıkla 🖱️' : viewLevel === 'hourly' ? 'Saate Tıkla 🖱️' : 'Detay Görünümü'}
        </span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} onClick={handleChartClick} className="cursor-pointer">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [`${value} ms`, 'TTI']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="tti" 
              stroke="#8884d8" 
              strokeWidth={3}
              activeDot={{ r: 8 }} 
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}