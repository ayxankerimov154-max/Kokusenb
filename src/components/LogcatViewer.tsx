import React, { useState } from 'react';
import { Terminal, Trash2, Filter } from 'lucide-react';
import { LogEntry } from '../types/simulator';

interface LogcatViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LogcatViewer: React.FC<LogcatViewerProps> = ({ logs, onClear }) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'D' | 'I' | 'W' | 'E'>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesTag = filterTag === 'ALL' || log.tag === filterTag;
    return matchesLevel && matchesTag;
  });

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'D':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800';
      case 'I':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
      case 'W':
        return 'text-amber-400 bg-amber-950/40 border-amber-800';
      case 'E':
        return 'text-rose-400 bg-rose-950/40 border-rose-800';
    }
  };

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[780px] font-mono">
      
      {/* Top Header */}
      <div className="p-3.5 px-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs text-slate-200">
            ADB Logcat: <span className="text-slate-400 font-normal">adb logcat -s TechnovisAzeService TechnovisAzeGemini</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            {(['ALL', 'D', 'I', 'W', 'E'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  filterLevel === lvl
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            title="Clear Logcat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Entries Stream */}
      <div className="flex-1 overflow-auto p-3 text-[11px] leading-relaxed space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-12">No matching log entries</div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="flex items-start gap-2 py-0.5 hover:bg-slate-900/60 px-1 rounded">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <span className={`px-1 rounded text-[9px] font-bold border shrink-0 ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-indigo-400 shrink-0 font-semibold">{log.tag}:</span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Logcat Status Footer */}
      <div className="p-2.5 px-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[10px] text-slate-500">
        <span>Connected device: pixel_8_pro (API 34) · Thread: Dispatchers.IO</span>
        <span>{filteredLogs.length} events logged</span>
      </div>

    </div>
  );
};
