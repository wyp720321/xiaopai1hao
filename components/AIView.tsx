import React, { useState } from 'react';
import { BrainCircuit, FolderOpen, ArrowRight, Check, Loader2, FileText, Image as ImageIcon, Video, File, Lock, ChevronDown } from 'lucide-react';
import { generateMockDirectory, simulateAIAnalysis } from '../services/mockApi';
import { AIFileProposal, User } from '../types';

interface AIViewProps {
    user: User | null;
    onUpgradeClick: () => void;
    onRequireAuth: () => void;
}

const AIView: React.FC<AIViewProps> = ({ user, onUpgradeClick, onRequireAuth }) => {
  const [step, setStep] = useState<'input' | 'analyzing' | 'review' | 'applying' | 'done'>('input');
  const [drive, setDrive] = useState('阿里云盘');
  const [path, setPath] = useState('/下载/未分类');
  const [proposals, setProposals] = useState<AIFileProposal[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const driveOptions = ['阿里云盘', '115网盘', '夸克网盘'];

  const handleAnalyze = () => {
    if (!user) {
        onRequireAuth();
        return;
    }
    if (!user.isVip) return; // Block if not VIP
    setStep('analyzing');
    
    // Simulate Fetching Files & Sending to OpenAI
    setTimeout(() => {
      const files = generateMockDirectory(path);
      const results = simulateAIAnalysis(files, path);
      setProposals(results);
      setStep('review');
    }, 2500);
  };

  const handleApply = () => {
    setStep('applying');
    // Simulate moving files one by one
    let completed = 0;
    const total = proposals.length;
    
    const interval = setInterval(() => {
        setProposals(prev => {
            const next = [...prev];
            // Move one pending item to done
            const pendingIdx = next.findIndex(p => p.status === 'pending');
            if (pendingIdx !== -1) {
                next[pendingIdx].status = 'done';
                completed++;
            }
            return next;
        });

        if (completed >= total) {
            clearInterval(interval);
            setTimeout(() => setStep('done'), 500);
        }
    }, 400);
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'Movies': case 'Series': return <Video className="w-4 h-4 text-blue-400" />;
        case 'Photos': return <ImageIcon className="w-4 h-4 text-green-400" />;
        case 'Documents': return <FileText className="w-4 h-4 text-orange-400" />;
        default: return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderContent = () => {
    // VIP GATE
    if (step === 'input' && user && !user.isVip) {
        return (
            <div className="text-center py-16">
                 <div className="bg-gray-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">VIP 专享功能</h3>
                 <p className="text-gray-400 max-w-md mx-auto mb-8">AI 智能整理使用 OpenAI GPT-4 模型对文件进行深度语义分析并自动重命名分类。请升级会员以解锁此功能。</p>
                 <div className="flex justify-center gap-4">
                     <button onClick={onUpgradeClick} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors">
                        立即升级 VIP
                     </button>
                 </div>
            </div>
        );
    }

    if (step === 'input') {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">选择云盘</label>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-pink-500 outline-none flex items-center justify-between transition-colors hover:bg-gray-700"
                            >
                                {drive}
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                                        {driveOptions.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setDrive(opt);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                                                    drive === opt ? 'bg-pink-500/10 text-pink-400' : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                {opt}
                                                {drive === opt && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">目标文件夹路径</label>
                        <div className="relative">
                            <FolderOpen className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input 
                                type="text" 
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none font-mono"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">AI 将会扫描该文件夹 (非递归)。</p>
                     </div>
                     <button 
                        onClick={handleAnalyze}
                        className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                     >
                        <BrainCircuit className="w-5 h-5" />
                        {user ? (user.isVip ? '启动 AI 智能分析' : 'VIP 专属功能') : '登录以继续'}
                     </button>
                </div>
            </div>
        );
    }

    if (step === 'analyzing') {
        return (
            <div className="text-center py-20">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-pink-500 animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-8 mb-2">正在分析文件...</h3>
                <p className="text-gray-400">正在将文件元数据发送至 OpenAI 进行分类</p>
                <div className="mt-8 max-w-sm mx-auto bg-gray-900 rounded-lg p-4 font-mono text-xs text-left text-green-400 border border-gray-700 h-32 overflow-hidden flex flex-col justify-end">
                    <div className="opacity-50">读取文件列表: {path}...</div>
                    <div className="opacity-75">发现 10 个文件...</div>
                    <div>生成 Vector Embeddings...</div>
                    <div className="animate-pulse">等待 API 响应...</div>
                </div>
            </div>
        );
    }

    if (step === 'review' || step === 'applying') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">AI 分析结果</h3>
                    {step === 'review' && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStep('input')} 
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleApply} 
                                className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                确认应用更改
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                    <div className="grid grid-cols-12 bg-gray-800 p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-4">原始文件</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-5">建议位置</div>
                        <div className="col-span-2 text-right">分类理由</div>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {proposals.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 p-4 items-center hover:bg-gray-800/30 transition-colors">
                                <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-gray-800 rounded-lg shrink-0">
                                        {getCategoryIcon(item.category)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm text-gray-200 truncate font-medium" title={item.filename}>{item.filename}</div>
                                        <div className="text-xs text-gray-500 truncate">{item.originalPath}</div>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <ArrowRight className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="col-span-5">
                                    <div className="text-sm text-emerald-400 font-mono truncate" title={item.newPath}>
                                        {item.newPath}
                                    </div>
                                    <div className="text-xs text-gray-500">分类: <span className="text-gray-300">{item.category}</span></div>
                                </div>
                                <div className="col-span-2 text-right">
                                    {step === 'applying' && item.status === 'done' ? (
                                        <span className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                                            <Check className="w-3 h-3" /> 已移动
                                        </span>
                                    ) : (
                                         <span className="text-xs text-pink-400/80 italic">{item.reason}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'done') {
         return (
            <div className="text-center py-16">
                 <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-emerald-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">整理完成！</h3>
                 <p className="text-gray-400 max-w-md mx-auto mb-8">成功将 {proposals.length} 个文件移动至智能分类目录。</p>
                 <button 
                    onClick={() => { setStep('input'); setPath(''); }}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
                 >
                    整理其他文件夹
                 </button>
            </div>
         );
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700 animate-fade-in min-h-[600px]">
       <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/10 rounded-xl">
                    <BrainCircuit className="w-8 h-8 text-pink-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">AI 智能整理</h2>
                    <p className="text-gray-400 text-sm">OpenAI GPT-4 驱动</p>
                </div>
            </div>
       </div>

       {renderContent()}

    </div>
  );
};

export default AIView;