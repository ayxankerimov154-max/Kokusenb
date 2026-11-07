import React, { useState } from 'react';
import {
  Database,
  Search,
  Download,
  Trash2,
  Table,
  Plus,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { BotMemory } from '../types/simulator';

interface DatabaseInspectorProps {
  memories: BotMemory[];
  onClear: () => void;
  onAddSample: (game: string) => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  memories,
  onClear,
  onAddSample,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [inspectMemory, setInspectMemory] = useState<BotMemory | null>(null);

  const filtered = memories.filter(m => {
    const matchesGame = selectedGame === 'ALL' || m.gameName === selectedGame;
    const matchesSearch =
      m.strategyCategory.toLowerCase().includes(search.toLowerCase()) ||
      m.insightContent.toLowerCase().includes(search.toLowerCase()) ||
      m.keyTakeaways.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesGame && matchesSearch;
  });

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'technovisaze_room_bot_memory.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[780px]">
      
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              SQLite Room DB Inspector
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                table: bot_memory
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Reactive Flow & DAO observations ({memories.length} total rows)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onClear}
            className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Table</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'PUBG Mobile', 'Roblox', 'Minecraft'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedGame === g
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search strategies or takeaways..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Content: Table or Detail Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Table View */}
        <div className="flex-1 overflow-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-2">
              <Table className="w-8 h-8 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No records found</p>
              <p className="text-xs text-slate-500">
                Trigger an autonomous cycle or add sample data below.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onAddSample('PUBG Mobile')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  + Sample PUBG
                </button>
                <button
                  onClick={() => onAddSample('Roblox')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  + Sample Roblox
                </button>
                <button
                  onClick={() => onAddSample('Minecraft')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  + Sample Minecraft
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] bg-slate-950/40">
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">game_name</th>
                  <th className="py-2.5 px-3">game_version</th>
                  <th className="py-2.5 px-3">strategy_category</th>
                  <th className="py-2.5 px-3">confidence</th>
                  <th className="py-2.5 px-3">cycle</th>
                  <th className="py-2.5 px-3">timestamp_learned</th>
                  <th className="py-2.5 px-3 text-right">inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filtered.map(row => {
                  const isSelected = inspectMemory?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setInspectMemory(row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/30 text-cyan-200'
                          : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500">#{row.id.toString().slice(-4)}</td>
                      <td className="py-2 px-3 font-semibold text-slate-200">
                        {row.gameName}
                      </td>
                      <td className="py-2 px-3 text-cyan-300">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-[10px]">
                          {row.gameVersion || 'Latest Meta'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans truncate max-w-[150px]">
                        {row.strategyCategory}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-emerald-400">
                          {Math.round(row.confidenceScore * 100)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">#{row.cycleIteration}</td>
                      <td className="py-2 px-3 text-slate-500 text-[10px]">
                        {new Date(row.timestampLearned || row.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <ChevronRight className="w-3.5 h-3.5 inline text-slate-500" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Record Detail Panel */}
        {inspectMemory && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/80 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">Entity Row Details</span>
              <span className="text-[10px] font-mono text-cyan-400">id: {inspectMemory.id}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Target Game</span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-indigo-300">{inspectMemory.gameName}</p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {inspectMemory.gameVersion || 'Latest Meta'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Timestamp Learned</span>
              <p className="text-xs font-mono text-slate-300">
                {new Date(inspectMemory.timestampLearned || inspectMemory.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Strategy Category</span>
              <p className="text-xs font-semibold text-slate-200">{inspectMemory.strategyCategory}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Synthesized Insights (Gemini)</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                {inspectMemory.insightContent}
              </p>
            </div>

            {inspectMemory.keyTakeaways && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500">
                  Key Takeaways (Room TypeConverter List)
                </span>
                <ul className="space-y-1 text-xs">
                  {inspectMemory.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-500">
              <span>Latency: {inspectMemory.executionDurationMs}ms</span>
              <span>Model: {inspectMemory.modelVersion || 'gemini-3.8-flash'}</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
