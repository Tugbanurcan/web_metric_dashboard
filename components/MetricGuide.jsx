import { Activity, Zap, BarChart3, PieChart, Layers, MonitorPlay } from 'lucide-react';

export default function MetricGuide() {
  const guides = [
    { 
      metric: 'FPS', 
      desc: 'Akıcılık ölçümü', 
      chart: 'LineChart – BarChart', 
      icon: MonitorPlay, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    { 
      metric: 'TTI', 
      desc: 'Site ne kadar hızlı etkileşime geçiyor', 
      chart: 'LineChart – AreaChart', 
      icon: Zap, 
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    { 
      metric: 'LCP / FCP', 
      desc: 'Google hız skorları', 
      chart: 'BarChart – LineChart', 
      icon: BarChart3, 
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    { 
      metric: 'SpeedIndex', 
      desc: 'Yüklenme kalitesi', 
      chart: 'LineChart', 
      icon: Activity, 
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    },
    { 
      metric: 'Size_KB', 
      desc: 'Sayfanın Boyutu', 
      chart: 'PieChart', 
      icon: PieChart, 
      color: 'text-pink-400',
      bg: 'bg-pink-400/10'
    },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden h-full">
      <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
        <Layers size={18} className="text-slate-400" />
        <h3 className="text-slate-100 font-bold">Veri Görselleştirme Rehberi</h3>
      </div>
      
      <div className="p-4 space-y-3">
        {guides.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-2 hover:bg-slate-700/30 rounded-lg transition-colors group">
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon size={18} className={item.color} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className={`font-bold text-sm ${item.color}`}>{item.metric}</h4>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {item.chart}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}