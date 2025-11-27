import React, { useState, useEffect } from 'react';
import { Share2, ArrowRight, CheckCircle2, Loader2, HardDrive, AlertTriangle, Play, Database, ChevronDown } from 'lucide-react';
import { TransferTask, User } from '../types';
import { createTransferTask, parseLinks, simulateTransferUpdate } from '../services/mockApi';
import { TerminalLog } from './TerminalLog';

interface TransferViewProps {
    user: User | null;
    onRequireAuth: () => void;
}

const TransferView: React.FC<TransferViewProps> = ({ user, onRequireAuth }) => {
  const [links, setLinks] = useState('');
  const [targetDrive, setTargetDrive] = useState('阿里云盘');
  const [targetPath, setTargetPath] = useState('/我的转存/批量任务');
  const [tasks, setTasks] = useState<TransferTask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const driveOptions = ['阿里云盘', '天翼云盘', '115网盘'];

  // Socket.io Simulation
  useEffect(() => {
    if (tasks.length === 0) return;

    const interval = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => 
            simulateTransferUpdate(task)
        )
      );
    }, 800);

    return () => clearInterval(interval);
  }, [tasks.length]);

  const handleSubmit = () => {
    if (!user) {
        onRequireAuth();
        return;
    }

    if (!links.trim()) return;
    setIsSubmitting(true);

    // Simulate API Latency
    setTimeout(() => {
      const urls = parseLinks(links);
      const newTasks = urls.map(url => createTransferTask(url, targetDrive, targetPath, user.isVip));
      setTasks(prev => [...newTasks, ...prev]);
      setLinks('');
      setIsSubmitting(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'transferring': return 'text-blue-400 bg-blue-400/10';
      case 'analyzing': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input Card */}
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Share2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">批量转存</h2>
              <p className="text-gray-400 text-base">跨网盘数据迁移 (115, 夸克, 阿里云)</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <label className="block text-base font-medium text-gray-400 mb-3">分享链接 (每行一个)</label>
            <textarea
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              rows={6}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-lg text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono placeholder-gray-600"
              placeholder={`https://www.aliyundrive.com/s/example\nmagnet:?xt=urn:btih:example\nhttps://115.com/s/example`}
            />
          </div>

          <div className="space-y-6">
            <div className="relative">
               <label className="block text-base font-medium text-gray-400 mb-3">目标网盘</label>
               
               {/* Custom Dropdown Trigger */}
               <button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none flex items-center justify-between hover:bg-gray-800 transition-colors"
               >
                 <span className="flex items-center gap-2">
                    {targetDrive}
                 </span>
                 <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
               </button>

               {/* Custom Dropdown Menu */}
               {isDropdownOpen && (
                 <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                        {driveOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    setTargetDrive(opt);
                                    setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-base transition-colors flex items-center justify-between ${
                                    targetDrive === opt 
                                        ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                                        : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {opt}
                                {targetDrive === opt && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                 </>
               )}
            </div>
            
            <div>
               <label className="block text-base font-medium text-gray-400 mb-3">保存路径</label>
               <input 
                 type="text"
                 value={targetPath}
                 onChange={(e) => setTargetPath(e.target.value)}
                 className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
               />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!links.trim() && !!user)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  {user ? '开始转存任务' : '登录并开始'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar & Queue - Always visible to show empty state */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-400" />
                任务监控
            </h3>
            {tasks.length > 0 && (
                <span className="text-sm px-3 py-1 bg-gray-700 rounded-full text-gray-300 border border-gray-600">
                    {tasks.filter(t => t.status === 'transferring').length} 进行中
                </span>
            )}
         </div>

         {tasks.length === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl p-12 border-2 border-dashed border-gray-700 text-center">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-gray-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-300 mb-1">任务队列为空</h4>
                <p className="text-gray-500">在上方添加链接并点击开始，任务将在此处显示。</p>
            </div>
         ) : (
             <div className="space-y-4">
                {tasks.map((task) => (
                <div key={task.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-md">
                    <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                        <div className="bg-gray-900 p-3 rounded-lg h-fit border border-gray-700">
                            <HardDrive className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </span>
                                <h3 className="font-medium text-white truncate max-w-lg text-lg" title={task.filename}>{task.filename}</h3>
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                <span className="text-gray-500">从</span>
                                <span className="text-gray-300">{task.sourceDrive}</span>
                                <ArrowRight className="w-3 h-3 text-gray-600" />
                                <span className="text-gray-500">到</span>
                                <span className="text-gray-300">{task.targetDrive}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full mx-2"></span>
                                <span>{task.size}</span>
                            </div>
                        </div>
                        </div>
                        
                        {task.status === 'transferring' && (
                        <div className="text-right">
                            <div className="text-xl font-bold text-emerald-400 font-mono">{task.speed}</div>
                            {user?.isVip && <div className="text-xs text-yellow-500 font-bold mt-1">VIP 加速中</div>}
                        </div>
                        )}
                        {task.status === 'completed' && (
                            <div className="flex flex-col items-end">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                                <span className="text-xs text-emerald-500 font-medium">传输完成</span>
                            </div>
                        )}
                    </div>

                    {/* Progress */}
                    <div className="w-full bg-gray-900 rounded-full h-2 mb-4 overflow-hidden border border-gray-700/50">
                        <div 
                        className={`h-full transition-all duration-300 ${
                            task.status === 'completed' ? 'bg-emerald-500' : 
                            task.status === 'error' ? 'bg-red-500' :
                            'bg-blue-500 relative overflow-hidden'
                        }`}
                        style={{ width: `${task.progress}%` }}
                        >
                            {task.status === 'transferring' && (
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            )}
                        </div>
                    </div>

                    {/* Logs */}
                    <TerminalLog logs={task.logs.slice(-2)} />
                    </div>
                </div>
                ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default TransferView;