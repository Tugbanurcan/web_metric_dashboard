import { query } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';
import { Activity } from 'lucide-react';

// Veriyi Server Side'da çekiyoruz (Hızlı olsun diye)
async function getDashboardData() {
  try {
    const result = await query(`
      SELECT * FROM tti_fps_results 
      WHERE success = true
      ORDER BY timestamp ASC
    `);

    // Veriyi serileştirme (tarihleri string yapma vs.)
    const formattedData = result.rows.map((row: any) => ({
      ...row,
      timestamp: row.timestamp.toISOString(),
      tti_ms: Number(row.tti_ms),
      fps: Number(row.fps),
      lcp_ms: Number(row.lcp_ms),
      fcp_ms: Number(row.fcp_ms),
      tbt_ms: Number(row.tbt_ms),
      size_kb: Number(row.size_kb)
    }));
    return formattedData;
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const rawData: any[] = await getDashboardData();

  if (!rawData || rawData.length === 0) return <div className="p-10 text-white">Veri Yok</div>;

  return (
    <main className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      
      {/* Üst Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-indigo-500" />
            Performans Monitörü
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerçek zamanlı web vitals analizi</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400">
             Server: PostgreSQL
           </span>
           <span className="px-3 py-1 bg-green-900/30 border border-green-800 rounded-full text-xs text-green-400 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Canlı
           </span>
        </div>
      </header>

      {/* TÜM MANTIK ARTIK BURADA */}
      <DashboardClient rawData={rawData} />

    </main>
  );
}