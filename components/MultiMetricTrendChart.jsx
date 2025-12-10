"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MousePointerClick } from 'lucide-react'; // EKSİK OLAN İKON BUYDU

const colors = {
  LCP: '#f97316', // Turuncu
  FCP: '#3b82f6', // Mavi
  TTI: '#a855f7', // Mor
  TBT: '#ef4444', // Kırmızı
};

// X Ekseni Etiketi
const CustomAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  
  const date = new Date(payload.value);
  if (isNaN(date.getTime())) return null; 

  const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#e2e8f0" fontSize={10} fontWeight="bold">{dateStr}</text>
      <text x={0} y={0} dy={28} textAnchor="middle" fill="#94a3b8" fontSize={9}>{timeStr}</text>
    </g>
  );
};

// Tooltip (Açıklama Kutusu)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dateLabel = new Date(label).toLocaleString('tr-TR');

    return (
      <div className="bg-slate-900/95 border border-slate-700/50 p-3 rounded-lg shadow-xl backdrop-blur-sm z-50 min-w-[200px]">
        <p className="text-slate-400 text-xs mb-2 border-b border-slate-700 pb-1 font-mono">
            {dateLabel}
        </p>
        
       
        <div className="space-y-2">
          {payload.map((entry, index) => {
            const isTBT = entry.dataKey === 'tbt_ms';
            const value = isTBT 
              ? Math.round(entry.value) 
              : (entry.value / 1000).toFixed(2);
            const unit = isTBT ? 'ms' : 's';

            return (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-slate-300 font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold font-mono text-sm" style={{ color: entry.color }}>
                  {value} <span className="text-[10px] opacity-70">{unit}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function MultiMetricTrendChart({ data, selectedHostname, onPointClick }) {
  if (!data || data.length === 0) {
      return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl h-[450px] flex flex-col items-center justify-center text-slate-500 gap-2">
            <p className="font-bold text-lg">Grafik Verisi Yok</p>
        </div>
      );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl h-[500px] relative overflow-hidden flex flex-col">
       <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900/50 z-0"></div>
       <div className="absolute -top-32 left-1/4 w-64 h-64 bg-indigo-500/05 rounded-full blur-3xl z-0"></div>
       
      <div className="mb-4 relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Detaylı Performans Analizi: <span className="text-indigo-400">{selectedHostname}</span>
        </h2>
        <div className="flex gap-4 text-[10px] mt-1 text-slate-400">
             <span>Sol Eksen: <span className="text-slate-200 font-bold">Yükleme (sn)</span></span>
             <span>Sağ Eksen: <span className="text-red-400 font-bold">Etkileşim (ms)</span></span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
            // GÜVENLİ TIKLAMA KONTROLÜ
            onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length > 0 && onPointClick) {
                    onPointClick(e.activePayload[0].payload);
                }
            }}
            className="cursor-pointer"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            
            <XAxis 
                dataKey="originalTimestamp" 
                tick={<CustomAxisTick />} 
                axisLine={{ stroke: '#334155' }} 
                tickLine={false} 
                interval={0} 
                minTickGap={0}
                height={60} 
            />

            <YAxis yAxisId="left" tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}s`} />
            <YAxis yAxisId="right" orientation="right" tick={{fontSize: 11, fill: '#ef4444', fontWeight: 'bold'}} axisLine={{ stroke: '#ef4444', opacity: 0.2 }} tickLine={false} tickFormatter={(value) => `${value}ms`} />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10 }} />
            
            <Line yAxisId="left" type="monotoneX" dataKey="lcp_ms" name="LCP" stroke={colors.LCP} strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
            <Line yAxisId="left" type="monotoneX" dataKey="fcp_ms" name="FCP" stroke={colors.FCP} strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
            <Line yAxisId="left" type="monotoneX" dataKey="tti_ms" name="TTI" stroke={colors.TTI} strokeWidth={2} dot={{r:3}} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotoneX" dataKey="tbt_ms" name="TBT (Kritik)" stroke={colors.TBT} strokeWidth={3} dot={{ r: 3, fill: colors.TBT }} activeDot={{ r: 8 }} />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}