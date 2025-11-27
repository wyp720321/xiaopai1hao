import React from 'react';
import { Layers, Download, BrainCircuit, Zap, ChevronRight, HardDrive, ShieldCheck, Users } from 'lucide-react';
import { Tab } from '../types';

interface LandingViewProps {
  onEnterApp: (targetTab: Tab) => void;
}

const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  color: string; 
  onClick: () => void; 
}> = ({ icon, title, desc, color, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative text-left p-8 rounded-3xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all hover:-translate-y-1 shadow-2xl overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-32 opacity-[0.03] group-hover:opacity-10 transition-opacity bg-gradient-to-br from-${color}-500 to-transparent rounded-bl-full`} />
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-6 text-${color}-400 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
      {title}
      <ChevronRight className={`w-5 h-5 text-${color}-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
    </h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </button>
);

const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span>云盘效率大师</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
          <div className="hidden md:flex gap-6">
            <span>已稳定运行 842 天</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 42万+ 用户</span>
          </div>
          <button 
            onClick={() => onEnterApp(Tab.DASHBOARD)}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/5"
          >
            我的仪表盘
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full -z-10" />
        
        <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
          v2.0 全新发布 • 懒人必备神器
        </span>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            重新定义云端
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            文件管理效率
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          不再为网盘限速、资源失效、文件杂乱而烦恼。
          <br className="hidden md:block" />
          我们提供一站式解决方案，让您的数字资产管理如呼吸般自然。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onEnterApp(Tab.DASHBOARD)}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors shadow-xl shadow-white/10 flex items-center justify-center gap-2"
          >
            立即免费开始 <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onEnterApp(Tab.VIP)}
            className="w-full sm:w-auto px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-colors border border-gray-700 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            查看 VIP 特权
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Layers className="w-8 h-8" />}
            title="一键批量转存"
            desc="支持 115、阿里云、夸克等主流网盘。自动去重，保留目录结构，支持断点续传。再也不用一个个手动保存。"
            color="emerald"
            onClick={() => onEnterApp(Tab.TRANSFER)}
          />
          <FeatureCard 
            icon={<Download className="w-8 h-8" />}
            title="离线云下载"
            desc="只需粘贴磁力链接或视频地址，服务器自动下载并上传至您的私有网盘。支持 4K 视频转码，无需挂机。"
            color="blue"
            onClick={() => onEnterApp(Tab.DOWNLOAD)}
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-8 h-8" />}
            title="AI 智能整理"
            desc="基于 GPT-4 视觉与语义分析，自动识别电影、文档、发票。一键重命名并归档到指定文件夹，治愈强迫症。"
            color="pink"
            onClick={() => onEnterApp(Tab.AI)}
          />
        </div>
      </div>

      {/* Trust Footer */}
      <div className="border-t border-gray-800 bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center md:text-left">
           <div>
             <h4 className="font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
               <ShieldCheck className="w-5 h-5 text-green-400" /> 安全承诺
             </h4>
             <p className="text-sm text-gray-500">所有传输均采用 TLS 1.3 加密，并不保存您的任何文件副本。</p>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
               <HardDrive className="w-5 h-5 text-blue-400" /> 极速节点
             </h4>
             <p className="text-sm text-gray-500">部署于全球 12 个数据中心，拥有 10Gbps 骨干网带宽。</p>
           </div>
           <div className="col-span-2 md:text-right">
              <p className="text-gray-600 text-sm">© 2024 云盘效率大师 Inc. All rights reserved.</p>
              <div className="flex justify-center md:justify-end gap-4 mt-2 text-sm text-gray-600">
                <span>服务条款</span>
                <span>隐私政策</span>
                <span>联系我们</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;