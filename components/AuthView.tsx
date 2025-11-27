import React, { useState } from 'react';
import { User, Lock, Mail, Loader2, ArrowRight, UserCircle } from 'lucide-react';
import { authService } from '../services/mockApi';
import { User as UserType } from '../types';

interface AuthViewProps {
  onLogin: (user: UserType) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        user = await authService.register(email, password);
      }
      onLogin(user);
    } catch (err) {
      setError('认证失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const user = await authService.loginAsGuest();
      onLogin(user);
    } catch (err) {
      setError('游客登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in relative z-10">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur rounded-2xl shadow-2xl border border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? '欢迎回来' : '创建账户'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? '登录以管理您的云端资产' : '注册即享免费 5MB/s 传输额度'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="user@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isLogin ? '登 录' : '注 册'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 relative">
             <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
             </div>
             <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-500">或者</span>
             </div>
        </div>

        <button 
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
             <UserCircle className="w-5 h-5" />
             游客模式试用
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isLogin ? '还没有账号？立即免费注册' : '已有账号？直接登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;