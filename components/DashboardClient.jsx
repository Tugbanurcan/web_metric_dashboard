"use client";

import { useState, useMemo } from 'react';
import UrlSidebar from './UrlSidebar';
import MultiMetricTrendChart from './MultiMetricTrendChart';
import FPSDrillDownChart from './FPSDrillDownChart';
import HighTBTTable from './HighTBTTable';
import SiteOverviewTable from './SiteOverviewTable'; 
import { RefreshCcw, ExternalLink, Info, Filter, Calendar, FileBox, AlertTriangle, X, BookOpen, Activity, Zap, BarChart3, PieChart, Monitor } from 'lucide-react';

export default function DashboardClient({ rawData }) {
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null); 
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState(''); 

  // 1. Tarihleri Hazırla
  const availableDates = useMemo(() => {
    if (!rawData) return [];
    const dates = new Set(rawData.map(d => d.timestamp.split('T')[0]));
    return Array.from(dates).sort(); 
  }, [rawData]);

  // 2. Veriyi Filtrele (Tarihe Göre)
  const processedData = useMemo(() => {
    let data = rawData;
    if (selectedDateFilter) {
        data = data.filter(d => d.timestamp.startsWith(selectedDateFilter));
    }
    return data;
  }, [rawData, selectedDateFilter]);

  // 3. Sidebar ve Genel Tablo İçin Özet Veri
  const siteListData = useMemo(() => {
    if (!processedData) return [];
    const latestDataMap = {};
    processedData.forEach(d => {
      // Her sitenin en güncel verisini bul
      if (!latestDataMap[d.url] || new Date(d.timestamp) > new Date(latestDataMap[d.url].timestamp)) {
        latestDataMap[d.url] = d;
      }
    });
    return Object.values(latestDataMap).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [processedData]);

  const selectedHostname = selectedUrl ? new URL(selectedUrl).hostname : null;

  // 4. Detay Sayfası Verileri (Sadece bir site seçiliyse çalışır)
  const detailData = useMemo(() => {
    if (!selectedUrl || !processedData) return null;
    const filtered = processedData.filter(d => d.url === selectedUrl);
    
    // Grafikler için eskiden yeniye sırala
    filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const avgFPS = filtered.reduce((acc, curr) => acc + curr.fps, 0) / (filtered.length || 1);
    
    // FPS Durumu
    let fpsStatus = { text: 'Kasıyor', color: 'bg-red-500/10 text-red-400 border-red-500/20', desc: '< 30 FPS' };
    if (avgFPS >= 55) {
        fpsStatus = { text: 'Mükemmel (Akıcı)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', desc: '> 55 FPS' };
    } else if (avgFPS >= 30) {
        fpsStatus = { text: 'Orta (Kabul Edilebilir)', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', desc: '30-55 FPS' };
    }

    const trendData = filtered.map(d => ({
      originalTimestamp: d.timestamp,
      lcp_ms: Math.round(d.lcp_ms),
      fcp_ms: Math.round(d.fcp_ms),
      tti_ms: Math.round(d.tti_ms),
      tbt_ms: Math.round(d.tbt_ms),
      size_kb: d.size_kb, 
      fps: Number(d.fps.toFixed(1))
    }));

    const fpsData = filtered.map(d => ({
        date: d.timestamp.split('T')[0],
        hour: new Date(d.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        url: d.url,
        fps: d.fps
      }));

    return { trendData, fpsData, fpsStatus };
  }, [processedData, selectedUrl]);

  const handleDateChange = (e) => {
      setSelectedDateFilter(e.target.value);
  };

  return (
    <div className="flex h-[calc(100vh-60px)] gap-6">
      
      {/* SOL: SIDEBAR */}
      <div className="w-[280px] shrink-0 h-full overflow-hidden flex flex-col gap-3">
          {selectedUrl && (
              <button onClick={() => {setSelectedUrl(null); setSelectedPoint(null);}} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 text-sm font-bold"> <RefreshCcw size={16} /> Genel Bakışa Dön </button>
          )}
          <UrlSidebar siteList={siteListData} selectedUrl={selectedUrl} onSelect={(url) => { setSelectedUrl(url); setSelectedPoint(null); }} />
      </div>

      {/* SAĞ: ANA İÇERİK */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800 mb-6 sticky top-0 bg-slate-950/90 backdrop-blur-sm z-20 pt-2">
              
              {/* SOL: Başlık ve Açıklamalar */}
              <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      {selectedUrl ? `Analiz: ${selectedHostname}` : 'Genel Bakış'}
                      {/* DURUM ETİKETİ */}
                      {selectedUrl && detailData && ( 
                          <span className={`text-xs px-3 py-1 rounded-full border font-bold flex items-center gap-1 ${detailData.fpsStatus.color}`}> 
                              {detailData.fpsStatus.text} 
                          </span>
                      )}
                  </h2>
                  
                  <div className="flex items-center gap-3 mt-1">
                      {selectedUrl && detailData ? (
                          <div className="flex flex-col gap-1">
                              {/* Kullanıcıya Açıklama */}
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Info size={12} className="text-slate-500"/> 
                                  Kriter: <span className="text-slate-300 font-bold">{detailData.fpsStatus.desc}</span> 
                                  <span className="text-slate-500 ml-1">(Ref: 60Hz Ekran Hızı)</span>
                              </p>
                              <a href={selectedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white transition-colors mt-1"><ExternalLink size={12} /> Siteyi Ziyaret Et</a>
                          </div>
                      ) : (
                          <p className="text-xs text-slate-500">Tüm sitelerin performans metrikleri</p>
                      )}
                  </div>
              </div>

              {/* SAĞ: Filtre Araçları */}
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700/50 shadow-sm">
                  <div className="relative group">
                      <div className="absolute left-2.5 top-2 text-slate-400 pointer-events-none group-hover:text-indigo-400 transition-colors"><Calendar size={14} /></div>
                      <select 
                          value={selectedDateFilter} 
                          onChange={handleDateChange} 
                          className={`pl-8 pr-8 py-2 rounded-lg border text-xs font-bold appearance-none cursor-pointer outline-none transition-all w-[150px]
                              ${selectedDateFilter ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700'}`}
                      >
                          <option value="">Tüm Zamanlar</option>
                          {availableDates.map(date => (<option key={date} value={date}>{new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</option>))}
                      </select>
                  </div>
                  
                  {/* Filtreyi Temizle Butonu */}
                  {selectedDateFilter && (
                      <button onClick={() => setSelectedDateFilter('')} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all flex items-center gap-1 text-xs font-bold" title="Filtreyi Temizle">
                          <X size={14} /> <span className="hidden xl:inline">Temizle</span>
                      </button>
                  )}
                  
                  <div className="w-px h-6 bg-slate-700 mx-1"></div>
                  
                  {/* Rehber Butonu */}
                  <button onClick={() => setIsGuideOpen(true)} className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-2 text-xs font-bold" title="Metrik Rehberi">
                      <BookOpen size={16} /> <span className="hidden xl:inline">Rehber</span>
                  </button>
              </div>
          </div>

          {/* --- MOD 1: GENEL BAKIŞ (SADECE TABLO) --- */}
          {!selectedUrl && (
              <div className="h-full pb-6">
                  {/* Üstteki kutular gitti, sadece bu şık tablo var */}
                  <SiteOverviewTable 
                    sites={siteListData} 
                    onSelect={(url) => { setSelectedUrl(url); setSelectedPoint(null); }} 
                  />
              </div>
          )}

          {/* --- MOD 2: DETAY GÖRÜNÜMÜ --- */}
          {selectedUrl && detailData && (
              <div className="space-y-6">
                  {/* 1. GRAFİK (Tam Genişlik) */}
                  <div className="w-full">
                      <MultiMetricTrendChart 
                          data={detailData.trendData} 
                          selectedHostname={selectedHostname} 
                          onPointClick={setSelectedPoint} 
                      />
                  </div>

                  {/* 2. OLAY ANALİZ RAPORU (Tıklayınca Açılır) */}
                  {selectedPoint && (
                        <div className="bg-slate-900 border border-indigo-500/50 p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <button onClick={() => setSelectedPoint(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X size={18} /></button>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><AlertTriangle className="text-indigo-400" /> Olay Analiz Raporu: <span className="font-mono text-indigo-300">{new Date(selectedPoint.originalTimestamp).toLocaleTimeString()}</span></h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700"><p className="text-xs text-slate-400">FPS</p><p className={`text-xl font-bold ${selectedPoint.fps < 30 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedPoint.fps}</p></div>
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700"><p className="text-xs text-slate-400">Size</p><p className="text-xl font-bold text-blue-400 flex items-center gap-2"><FileBox size={16} /> {selectedPoint.size_kb ? `${(selectedPoint.size_kb / 1024).toFixed(2)} MB` : 'N/A'}</p></div>
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700"><p className="text-xs text-slate-400">TBT</p><p className={`text-xl font-bold ${selectedPoint.tbt_ms > 600 ? 'text-red-400' : 'text-slate-200'}`}>{selectedPoint.tbt_ms} ms</p></div>
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700"><p className="text-xs text-slate-400">LCP</p><p className="text-xl font-bold text-orange-400">{selectedPoint.lcp_ms} ms</p></div>
                            </div>
                        </div>
                  )}

                  {/* 3. FPS GRAFİĞİ (Tam Genişlik - Altta) */}
                  <div className="w-full">
                      <FPSDrillDownChart rawData={detailData.fpsData} />
                  </div>
                  
                  {/* 4. KRİTİK HATALAR TABLOSU (Tam Genişlik - En Altta) */}
                  <div className="w-full h-[400px]">
                      <HighTBTTable rows={rawData.filter(d => d.url === selectedUrl).sort((a,b)=>b.tbt_ms-a.tbt_ms).slice(0,10)} />
                  </div>
              </div>
          )}
      </div>

      {/* --- REHBER MODALI --- */}
      {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-2xl w-full relative">
                  <button onClick={() => setIsGuideOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="text-indigo-400"/> Metrik Rehberi</h3>
                  <div className="space-y-4">
                      <div className="flex gap-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><Activity className="text-emerald-400 shrink-0" /><div><h4 className="font-bold text-emerald-400 text-sm">FPS</h4><p className="text-xs text-slate-300">Akıcılık ölçümü. 60 mükemmel, 30 altı kötüdür.</p></div></div>
                      <div className="flex gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"><Zap className="text-red-400 shrink-0" /><div><h4 className="font-bold text-red-400 text-sm">TBT</h4><p className="text-xs text-slate-300">Gecikme süresi. Kullanıcı tıkladığında sitenin cevap verme süresi.</p></div></div>
                      <div className="flex gap-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"><BarChart3 className="text-blue-400 shrink-0" /><div><h4 className="font-bold text-blue-400 text-sm">LCP & FCP</h4><p className="text-xs text-slate-300">Sayfanın ekrana gelme ve yüklenme hızları.</p></div></div>
                      <div className="flex gap-4 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20"><PieChart className="text-pink-400 shrink-0" /><div><h4 className="font-bold text-pink-400 text-sm">Size</h4><p className="text-xs text-slate-300">Sayfa boyutu (MB/KB).</p></div></div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}