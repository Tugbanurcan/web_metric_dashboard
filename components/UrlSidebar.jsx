"use client";

import { useState } from 'react';
import { ExternalLink, Globe, CheckCircle, Search, X, Calendar } from 'lucide-react';

export default function UrlSidebar({ siteList, selectedUrl, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const safeList = siteList || [];

  const filteredList = safeList.filter(item => 
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="bg-slate-800 border-r border-slate-700 w-full h-full flex flex-col rounded-xl overflow-hidden shadow-lg">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm space-y-3">
        <h2 className="text-slate-100 font-bold flex items-center gap-2">
          <Globe size={18} className="text-indigo-400" />
          İzlenen Siteler
          <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full ml-auto">
            {safeList.length}
          </span>
        </h2>

        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Site ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* LİSTE */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => {
             const url = item.url;
             let hostname = url;
             try { hostname = new URL(url).hostname.replace('www.', ''); } catch(e){}
             const isSelected = selectedUrl === url;
             
             // Tarih Formatı
             const dateStr = new Date(item.timestamp).toLocaleDateString('tr-TR', { 
                 day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
             });

             // Renkli nokta durumu (Sadece görsel ipucu olarak kalsın mı? Evet, nokta kalsın yazı gitsin)
             const fps = item.fps || 0;
             const dotColor = fps >= 55 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : (fps >= 30 ? 'bg-yellow-500' : 'bg-red-500');
  
             return (
              <div 
                  key={index} 
                  onClick={() => onSelect(url)}
                  className={`group flex flex-col p-3 rounded-lg transition-all cursor-pointer border relative mb-1
                      ${isSelected 
                          ? 'bg-indigo-600/20 border-indigo-500/50' 
                          : 'border-transparent hover:bg-slate-700/50 hover:border-slate-600'
                      }`}
              >
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {isSelected ? (
                            <CheckCircle size={16} className="text-indigo-400 shrink-0" />
                        ) : (
                            <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}></div>
                        )}
                        <span className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-indigo-100' : 'text-slate-200 group-hover:text-white'}`}>
                            {hostname}
                        </span>
                    </div>
                    
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="text-slate-500 hover:text-indigo-400 transition-colors p-1 rounded-md"
                        title="Siteye git"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>

              
              </div>
             )
          })
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">Sonuç yok 😔</div>
        )}
      </div>
    </aside>
  );
}