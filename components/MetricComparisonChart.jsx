"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function MetricComparisonChart({ data }) {
  // Data formatı: [{ name: 'LCP', value: 2500 }, { name: 'FCP', value: 1200 }, ...]
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-700">Core Web Vitals Karşılaştırması</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={50} />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                {/* Her bar için farklı renk */}
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#3b82f6'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}