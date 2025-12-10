"use client";

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target, Activity, ArrowLeft } from 'lucide-react';

// X Ekseni Etiketi
const CustomAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;

  if (payload.value.includes('http') || payload.value.includes('www')) {
     return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#94a3b8" fontSize={10}>
            {payload.value.replace('https://', '').replace('www.', '').substring(0, 10)}...
          </text>
        </g>
     );
  }

  const date = new Date(payload.value);
  if (isNaN(date.getTime())) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight="bold">{payload.value}</text>
        </g>
      );
  }

  const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const isDaily = timeStr === '00:00';

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={20} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight="bold">{dateStr}</text>
      {!isDaily && (
        <text x={0} y={0} dy={36} textAnchor="middle" fill="#94a3b8" fontSize={10}>{timeStr}</text>
      )}
    </g>
  );
};

// Özel Nokta
const CustomizedDot = (props) => {
  const { cx, cy, payload } = props;
  const isLowFPS = payload.fps < 30;
  if (!cx || !cy) return null;
  return (
    <circle cx={cx} cy={cy} r={isLowFPS ? 6 : 4} stroke={isLowFPS ? "#ef4444" : "#10b981"} strokeWidth={2} fill="#1e293b" />
  );
};

// --- GÜNCELLENEN KISIM: TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const fpsValue = payload[0].value;
    
    // Feedback Mantığı
    let feedback = { text: "Donuyor / Kötü", color: "text-red-400", bg: "bg-red-500/10", icon: "🛑" };
    if (fpsValue >= 55) {
        feedback = { text: "Mükemmel Akıcılık", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "🔥" };
    } else if (fpsValue >= 30) {
        feedback = { text: "Orta Seviye", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "⚠️" };
    }

    let dateLabel = label;
    if (label && (label.includes('T') || label.includes('-'))) {
        const d = new Date(label);
        if(!isNaN(d.getTime())) {
            dateLabel = d.toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        }
    }

    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[180px]">
        {/* Başlık */}
        <p className="text-slate-400 text-xs mb-2 border-b border-slate-800 pb-1 font-medium flex items-center gap-2">
            <Activity size={12} /> {dateLabel}
        </p>
        
        {/* Değer */}
        <div className="flex items-center justify-between mb-2">
            <span className="text-slate-200 text-sm font-bold">FPS:</span>
            <span className={`text-2xl font-black ${feedback.color}`}>
                {fpsValue}
            </span>
        </div>

        {/* --- GERİ BİLDİRİM MESAJI --- */}
        <div className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-2 ${feedback.bg} ${feedback.color}`}>
            <span>{feedback.icon}</span> {feedback.text}
        </div>
      </div>
    );
  }
  return null;
};

export default function FPSDrillDownChart({ rawData }) {
  const [viewLevel, setViewLevel] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  const dailyData = useMemo(() => {
    const groups = {};
    rawData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = { date: item.date, fps_total: 0, count: 0 };
      groups[item.date].fps_total += item.fps;
      groups[item.date].count += 1;
    });
    return Object.values(groups).map(g => ({
      name: g.date, 
      fps: Number((g.fps_total / g.count).toFixed(2))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawData]);

  const hourlyData = useMemo(() => {
    if (!selectedDate) return [];
    const filtered = rawData.filter(d => d.date === selectedDate);
    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.hour]) groups[item.hour] = { hour: item.hour, fps_total: 0, count: 0 };
      groups[item.hour].fps_total += item.fps;
      groups[item.hour].count += 1;
    });
    return Object.values(groups).map(g => ({
      name: `${selectedDate}T${g.hour}:00`, 
      originalHour: g.hour, 
      fps: Number((g.fps_total / g.count).toFixed(2))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawData, selectedDate]);

  const pageData = useMemo(() => {
    if (!selectedDate || !selectedHour) return [];
    return rawData
      .filter(d => d.date === selectedDate && d.hour === selectedHour)
      .map(d => ({ name: d.url, fps: d.fps }));
  }, [rawData, selectedDate, selectedHour]);

  const handleChartClick = (data) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    if (viewLevel === 'daily') {
      setSelectedDate(payload.name);
      setViewLevel('hourly');
    } else if (viewLevel === 'hourly') {
      setSelectedHour(payload.originalHour); 
      setViewLevel('page');
    }
  };

  const currentData = viewLevel === 'daily' ? dailyData : (viewLevel === 'hourly' ? hourlyData : pageData);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md border border-slate-700/50 h-[400px] flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          {viewLevel !== 'daily' && (
            <button 
                onClick={() => setViewLevel(viewLevel === 'page' ? 'hourly' : 'daily')} 
                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Target size={18} className="text-emerald-500" />
            FPS Kararlılık Analizi
          </h2>
        </div>
        
        {/* LEJANT (BİLGİ KARTI) */}
        <div className="flex flex-wrap gap-2">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20" title="Kullanıcı deneyimi çok iyi">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-400">Akıcı (&gt;55)</span>
             </div>
             <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20" title="Kullanılabilir düzeyde">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <span className="text-[10px] font-bold text-yellow-400">Orta</span>
             </div>
             <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20" title="Donma ve takılmalar var">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-bold text-red-400">Donuyor</span>
             </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={currentData} 
            onClick={handleChartClick} 
            className="cursor-pointer" 
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomAxisTick />} 
              axisLine={{ stroke: '#334155' }} 
              tickLine={false}
              interval={0}
              height={80} 
            />
            
            <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']} 
                tick={{fill: '#94a3b8', fontSize: 11}} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
            />
            
            <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Line 
                type="monotone" 
                dataKey="fps" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={<CustomizedDot />} 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}