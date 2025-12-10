import { AlertTriangle, Clock, Calendar, AlertOctagon } from 'lucide-react';

export default function HighTBTTable({ rows }) {
  // Veriyi TBT değerine göre (En kötüden iyiye) sıralayalım
  // Böylece en büyük felaket en üstte görünür.
  const sortedRows = [...rows].sort((a, b) => b.tbt_ms - a.tbt_ms);

  return (
    <div className="bg-slate-800 rounded-2xl border border-red-500/30 shadow-xl overflow-hidden h-full flex flex-col">
      
      {/* BAŞLIK: KIRMIZI ALARM */}
      <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
                <AlertOctagon size={20} className="text-red-500" />
            </div>
            <div>
                <h3 className="text-red-100 font-bold text-sm">Anomali Tespiti (Son 7 Gün)</h3>
                <p className="text-red-400 text-[10px]">En Yüksek TBT Değerleri (Worst Case)</p>
            </div>
        </div>
        <span className="text-[10px] font-mono text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
            Kritik Sınır: &gt;600ms
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 font-semibold">Sayfa (URL)</th>
              <th className="px-4 py-3 font-semibold text-right">Hata Zamanı</th>
              <th className="px-4 py-3 font-semibold text-right">Gecikme (TBT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-xs">
            {sortedRows.length > 0 ? (
              sortedRows.map((row, i) => {
                // --- 1. SAYI YUVARLAMA (Mühendislik Formatı) ---
                // Math.round ile tam sayı yapıyoruz. 12692.62 -> 12693
                const tbtValue = Math.round(row.tbt_ms);
                
                // --- 2. TARİH FORMATI ---
                const dateObj = new Date(row.timestamp);
                const dateStr = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }); // 07.12
                const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); // 14:30

                // Renklendirme: 2000ms üzeri felaket, 600ms üzeri kötü
                const severityColor = tbtValue > 2000 ? 'text-red-500' : 'text-orange-400';
                const rowBg = tbtValue > 2000 ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-slate-700/30';

                return (
                  <tr key={i} className={`transition-colors ${rowBg}`}>
                    
                    {/* URL */}
                    <td className="px-4 py-3">
                        <div className="font-medium text-slate-200 truncate max-w-[140px]" title={row.url}>
                             {new URL(row.url).hostname}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {new URL(row.url).pathname}
                        </div>
                    </td>

                    {/* ZAMAN (Tarih ve Saat) */}
                    <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-slate-300 font-mono flex items-center gap-1">
                                {timeStr} <Clock size={10} className="text-slate-500" />
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                {dateStr} <Calendar size={10} />
                            </span>
                        </div>
                    </td>

                    {/* TBT DEĞERİ (Yuvarlanmış) */}
                    <td className="px-4 py-3 text-right">
                        <div className={`font-black text-sm ${severityColor}`}>
                            {tbtValue.toLocaleString('tr-TR')} ms
                        </div>
                        {tbtValue > 2000 && (
                            <span className="text-[9px] text-red-400 font-bold flex items-center justify-end gap-1">
                                <AlertTriangle size={8} /> FELAKET
                            </span>
                        )}
                    </td>
                  </tr>
                );
              })
            ) : (
                <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">
                        <p>Harika! Son 7 gün içinde kritik bir hata (anomali) tespit edilmedi.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}