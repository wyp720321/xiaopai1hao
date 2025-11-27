import React, { useState } from 'react';
import { Crown, Check, Loader2 } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/mockApi';

const VipCard: React.FC<{ 
    title: string; 
    price: string; 
    period: string; 
    color: string; 
    features: string[];
    recommended?: boolean;
    onSubscribe: () => void;
    loading?: boolean;
}> = ({ title, price, period, color, features, recommended, onSubscribe, loading }) => (
    <div className={`relative bg-white/5 backdrop-blur rounded-2xl p-6 border-2 transform transition hover:scale-105 ${recommended ? `border-${color}-500 shadow-xl shadow-${color}-900/20` : 'border-gray-700'}`}>
        {recommended && (
            <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-${color}-500 text-black text-xs font-bold px-3 py-1 rounded-full`}>
                最受欢迎
            </div>
        )}
        <h3 className={`text-xl font-bold text-${color}-400 mb-2`}>{title}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-4xl font-extrabold text-white">¥{price}</span>
            <span className="text-gray-400 ml-2">/ {period}</span>
        </div>
        <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
                <li key={i} className="flex items-center text-gray-300 text-sm">
                    <Check className={`w-4 h-4 text-${color}-500 mr-2`} />
                    {f}
                </li>
            ))}
        </ul>
        <button 
            onClick={onSubscribe}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center ${recommended ? `bg-${color}-500 text-black hover:bg-${color}-400` : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即订阅'}
        </button>
    </div>
);

interface VipViewProps {
    user: User;
    onUpgradeSuccess: (user: User) => void;
}

const VipView: React.FC<VipViewProps> = ({ user, onUpgradeSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
        const updatedUser = await authService.upgradeUser();
        onUpgradeSuccess(updatedUser);
        alert('订阅成功！您现在是尊贵的 VIP 会员。');
    } catch (e) {
        alert('订阅处理失败，请稍后重试。');
    } finally {
        setLoading(false);
    }
  };

  if (user.isVip) {
      return (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-16 text-center shadow-2xl border border-white/10 animate-fade-in">
            <div className="bg-yellow-500/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Crown className="w-16 h-16 text-yellow-400" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">您已是尊贵的 VIP 会员</h2>
            <p className="text-xl text-gray-300 mb-8">有效期至: {user.vipExpiry || '2025-12-31'}</p>
            <p className="text-gray-400">正在享受全速下载、无限转存和 AI 智能整理特权。</p>
        </div>
      );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 text-center shadow-2xl border border-white/10 animate-fade-in">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">解锁 VIP 特权</h2>
        <p className="text-gray-300 mb-10 max-w-lg mx-auto">获取极速下载体验、无限次批量转存以及先进的 AI 文件整理功能。</p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <VipCard 
                title="月卡" 
                price="19.9" 
                period="月" 
                color="indigo" 
                features={['极速传输通道', '无限次离线下载', '无广告干扰']} 
                onSubscribe={handleSubscribe}
                loading={loading}
            />
            <VipCard 
                title="季卡" 
                price="49.9" 
                period="季" 
                color="emerald" 
                features={['优先技术支持', '极速传输通道', 'AI 智能整理 (高级版)', '无限次离线下载']} 
                recommended
                onSubscribe={handleSubscribe}
                loading={loading}
            />
            <VipCard 
                title="年卡" 
                price="149" 
                period="年" 
                color="purple" 
                features={['赠送 2 个月时长', '解锁所有功能', '新功能优先体验', '尊贵身份标识']} 
                onSubscribe={handleSubscribe}
                loading={loading}
            />
        </div>
    </div>
  );
};

export default VipView;