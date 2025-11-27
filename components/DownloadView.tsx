import React, { useState, useEffect, useCallback } from 'react';
import { Download, Cloud, Activity, AlertCircle, HardDrive } from 'lucide-react';
import { DownloadTask, User } from '../types';
import { createMockTask, parseLinks, simulateTaskUpdate } from '../services/mockApi';
import { TerminalLog } from './TerminalLog';

interface DownloadViewProps {
    user: User;
}

const DownloadView: React.FC<DownloadViewProps> = ({ user }) => {
  const [linksText, setLinksText] = useState('');
  const [targetDrive, setTargetDrive] = useState('aliyun');
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate Socket.io/WebSocket connection receiving updates
  useEffect(() => {
    if (tasks.length === 0) return;

    const interval = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.status !== 'completed' && task.status !== 'error' 
            ? simulateTaskUpdate(task, user.isVip) 
            : task
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks.length, user.isVip]);

  const handleStart = useCallback(() => {
    if (!linksText.trim()) return;
    
    setIsProcessing(true);
    const urls = parseLinks(linksText);
    const newTasks = urls.map(createMockTask);
    
    // Simulate API POST latency
    setTimeout(() => {
      setTasks(prev => [...newTasks, ...prev]);
      setLinksText('');
      setIsProcessing(false);
    }, 800);
  }, [linksText]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'uploading': return 'text-purple-400';
      default: return 'text-indigo-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Download className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">离线下载</h2>
          <p className="text-gray-400 text-sm">磁力 / BT种子 / YouTube / Bilibili / 抖音</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder="请粘贴磁力链接或视频地址 (每行一个)..."
              className="w-full h-40 bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-mono"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              支持引擎: aria2c, yt-dlp
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">目标云盘</label>
            <div className="space-y-2">
              <button 
                onClick={() => setTargetDrive('aliyun')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${targetDrive === 'aliyun' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>阿里云盘</span>
                </div>
                {targetDrive === 'aliyun' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
              </button>
              <button 
                onClick={() => setTargetDrive('115')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${targetDrive === '115' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span>115网盘</span>
                </div>
                {targetDrive === '115' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isProcessing || !linksText.trim()}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                正在处理...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                开始离线任务
              </>
            )}
          </button>
        </div>
      </div>

      {/* Task Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            活动队列
          </h3>
          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
            {tasks.filter(t => t.status !== 'completed').length} 运行中
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-2xl">
            <Cloud className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">队列为空。请在上方添加链接。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-900 rounded-xl p-4 border border-gray-700 overflow-hidden">
                <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-800 ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <h4 className="font-medium text-gray-200 truncate" title={task.filename}>
                        {task.filename}
                      </h4>
                    </div>
                    <div className="text-xs text-gray-500 flex gap-3 font-mono">
                      <span>{task.size}</span>
                      {task.status !== 'completed' && task.status !== 'pending' && (
                         <>
                            <span className="text-emerald-500">{task.speed}</span>
                            <span>剩余: {task.eta}</span>
                         </>
                      )}
                    </div>
                  </div>
                  {task.status === 'error' && <AlertCircle className="text-red-500 w-5 h-5" />}
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                      task.status === 'completed' ? 'bg-emerald-500' :
                      task.status === 'uploading' ? 'bg-purple-500' :
                      task.status === 'transcoding' ? 'bg-yellow-500' :
                      'bg-indigo-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                {/* Terminal Output */}
                <TerminalLog logs={task.logs.slice(-3)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadView;