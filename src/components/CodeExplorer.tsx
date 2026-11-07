import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Folder,
  File,
  Code2,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';
import { ANDROID_FILES, AndroidFile } from '../data/androidFiles';
import { generateAndroidProjectZip } from '../utils/zipGenerator';

export const CodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('manifest');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedFile: AndroidFile =
    ANDROID_FILES.find(f => f.id === selectedFileId) || ANDROID_FILES[0];

  const filteredFiles = ANDROID_FILES.filter(
    f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TechnovisAze-Learning-Bot-Android.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getCategoryIcon = (category: AndroidFile['category']) => {
    switch (category) {
      case 'manifest':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'data':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'service':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'ui':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'gradle':
        return <Code2 className="w-4 h-4 text-slate-400" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" />;
    }
  };

  // Group files by package/category
  const categories = [
    { id: 'manifest', name: 'Manifest', icon: ShieldCheck },
    { id: 'data', name: 'Room Database & Entities', icon: Database },
    { id: 'service', name: 'Foreground Service & WakeLock', icon: Cpu },
    { id: 'ai', name: 'Gemini Generative AI SDK', icon: Sparkles },
    { id: 'ui', name: 'Jetpack Compose UI', icon: Layers },
    { id: 'gradle', name: 'Gradle Buildscripts', icon: Code2 }
  ];

  const lines = selectedFile.content.split('\n');

  return (
    <div className="flex flex-col lg:flex-row h-[780px] rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Left Sidebar: Android Studio Project Tree */}
      <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60 flex flex-col">
        {/* Header & Download Zip */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-sm text-slate-200">Android Project</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              API 34
            </span>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/40 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Packing ZIP...' : 'Download Project (.ZIP)'}</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search source files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {categories.map(cat => {
            const filesInCat = filteredFiles.filter(f => f.category === cat.id);
            if (filesInCat.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <cat.icon className="w-3 h-3 text-slate-400" />
                  <span>{cat.name}</span>
                </div>
                <div className="space-y-0.5">
                  {filesInCat.map(file => {
                    const isSelected = file.id === selectedFileId;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-mono flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                        }`}
                      >
                        {getCategoryIcon(file.category)}
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Code Viewer & Actions */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Editor Top Bar */}
        <div className="p-3.5 px-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-slate-400">{selectedFile.path}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedFile.language}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {selectedFile.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content Container */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200 bg-[#0B0F19] selection:bg-indigo-500/30">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="w-10 pr-4 text-right text-slate-600 select-none align-top font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre font-mono text-[12px] text-slate-300">
                    {formatSyntax(line, selectedFile.language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Code Footer Status */}
        <div className="px-5 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{lines.length} lines · UTF-8 · Kotlin 1.9 / Compose BOM</span>
          <span className="text-indigo-400 font-medium">Ready to paste into Android Studio</span>
        </div>

      </div>

    </div>
  );
};

// Lightweight syntax highlighter helper
function formatSyntax(line: string, language: string): React.ReactNode {
  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (line.trim().startsWith('<!--')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // XML tag highlighting
  if (language === 'xml') {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: line
            .replace(/(&lt;|<)(\/?[\w:-]+)/g, '$1<span class="text-rose-400 font-semibold">$2</span>')
            .replace(/([\w:-]+)=/g, '<span class="text-amber-300">$1</span>=')
            .replace(/"([^"]*)"/g, '"<span class="text-emerald-300">$1</span>"')
        }}
      />
    );
  }

  // Kotlin keywords & annotations
  const formatted = line
    .replace(/\b(package|import|class|interface|data|abstract|override|fun|val|var|private|public|suspend|companion|object|return|try|catch|if|else|while|when)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
    .replace(/(@\w+)/g, '<span class="text-amber-400">$1</span>')
    .replace(/\b(String|Int|Long|Float|Boolean|List|Context|Notification|Service|Intent|Flow|AppDatabase|BotMemoryDao|BotMemoryEntity|GeminiClient|StateFlow|CoroutineScope)\b/g, '<span class="text-cyan-300 font-semibold">$1</span>')
    .replace(/"([^"]*)"/g, '"<span class="text-emerald-300">$1</span>"');

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}
