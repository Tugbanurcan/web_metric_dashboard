"use client";

import { Activity, ArrowRight, Calendar, Zap, BarChart3, Clock } from 'lucide-react';

export default function SiteOverviewTable({ sites, onSelect }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
      
      {/* Tablo Başlığı */}
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="text-indigo-400" /> İzlenen Siteler ve Durumları
            </h2>
            <p className="text-slate-400 text-xs mt-1">Sistemdeki tüm sitelerin en son performans özeti</p>
        </div>
        <span className="bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/20 font-bold">
            Toplam: {sites.length} Site
        </span>
      </div>

      {/* Liste Başlıkları */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-700/50">
        <div className="col-span-4">Site Adı</div>
        <div className="col-span-2">Son Test</div>
        <div className="col-span-2">FPS Durumu</div>
        <div className="col-span-2">Yükleme (LCP)</div>
        <div className="col-span-2 text-right">Aksiyon</div>
      </div>

      {/* Liste İçeriği */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {sites.map((site, index) => {
            const date = new Date(site.timestamp);
            const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            
            // Performans Renklendirmesi
            const isFluencyGood = site.fps >= 55;
            const isLcpGood = site.lcp_ms <= 2500;

            return (
                <div key={index} className="grid grid-cols-12 gap-4 items-center px-4 py-4 bg-slate-800 hover:bg-slate-700/50 rounded-xl border border-transparent hover:border-slate-600 transition-all group">
                    
                    {/* 1. Site Adı */}
                    <div className="col-span-4 flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${isFluencyGood ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {new URL(site.url).hostname}
                            </h3>
                            <a href={site.url} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:underline truncate block max-w-[150px]">
                                {site.url}
                            </a>
                        </div>
                    </div>

                    {/* 2. Son Test Zamanı */}
                    <div className="col-span-2">
                        <div className="flex flex-col">
                            <span className="text-slate-300 text-xs font-mono flex items-center gap-1"><Clock size={10} /> {timeStr}</span>
                            <span className="text-slate-500 text-[10px] flex items-center gap-1"><Calendar size={10} /> {dateStr}</span>
                        </div>
                    </div>

                    {/* 3. FPS Durumu */}
                    <div className="col-span-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit border ${isFluencyGood ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            <Zap size={12} />
                            <span className="text-xs font-bold">{Math.round(site.fps)} FPS</span>
                        </div>
                    </div>

                    {/* 4. LCP Durumu */}
                    <div className="col-span-2">
                         <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit border ${isLcpGood ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                            <BarChart3 size={12} />
                            <span className="text-xs font-bold">{(site.lcp_ms / 1000).toFixed(1)}s</span>
                        </div>
                    </div>

                    {/* 5. Buton (Aksiyon) */}
                    <div className="col-span-2 flex justify-end">
                        <button 
                            onClick={() => onSelect(site.url)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            İncele <ArrowRight size={14} />
                        </button>
                    </div>

                </div>
            );
        })}
      </div>
    </div>
  );
}