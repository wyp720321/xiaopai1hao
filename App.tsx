import React, { useState, useEffect } from 'react';
import { Layers, Download, BrainCircuit, Crown, LogOut, LayoutDashboard, Zap, LogIn } from 'lucide-react';
import LandingView from './components/LandingView';
import TransferView from './components/TransferView';
import DownloadView from './components/DownloadView';
import AIView from './components/AIView';
import VipView from './components/VipView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import { Tab, User } from './types';
import { authService } from './services/mockApi';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Check persistent auth on load
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setShowLanding(false); // If logged in, skip landing
    }
    setInitializing(false);
  }, []);

  const handleEnterApp = async (targetTab: Tab) => {
    // Logic: Try to enter app. If no user, login as Guest automatically.
    if (!user) {
        try {
            const guestUser = await authService.loginAsGuest();
            setUser(guestUser);
        } catch (e) {
            console.error("Auto guest login failed");
        }
    }
    setCurrentTab(targetTab);
    setShowLanding(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setShowLanding(true);
    setCurrentTab(Tab.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentTab) {
      case Tab.DASHBOARD: return <DashboardView user={user!} />;
      case Tab.TRANSFER: return <TransferView user={user} onRequireAuth={() => setShowAuthModal(true)} />;
      case Tab.DOWNLOAD: return <DownloadView user={user!} />;
      case Tab.AI: return <AIView user={user} onUpgradeClick={() => setCurrentTab(Tab.VIP)} onRequireAuth={() => setShowAuthModal(true)} />;
      case Tab.VIP: return <VipView user={user!} onUpgradeSuccess={setUser} />;
      default: return <DashboardView user={user!} />;
    }
  };

  if (initializing) return null;

  // Show Landing Page if active
  if (showLanding) {
    return <LandingView onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Global Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                关闭
              </button>
              <AuthView onLogin={(u) => { setUser(u); setShowAuthModal(false); }} />
           </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="text-center md:text-left">
                 <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-3 cursor-pointer" onClick={() => setShowLanding(true)}>
                    <Zap className="w-8 h-8 text-indigo-500 fill-current" />
                    云盘效率大师
                 </h1>
            </div>

            {/* Navigation Tabs (Pills) */}
            <nav className="flex bg-gray-800/80 p-1.5 rounded-2xl border border-gray-700/50 backdrop-blur whitespace-nowrap overflow-x-auto max-w-full">
                {[
                    { id: Tab.DASHBOARD, label: '仪表盘', icon: LayoutDashboard, color: 'indigo' },
                    { id: Tab.TRANSFER, label: '批量转存', icon: Layers, color: 'emerald' },
                    { id: Tab.DOWNLOAD, label: '离线下载', icon: Download, color: 'blue' },
                    { id: Tab.AI, label: 'AI 整理', icon: BrainCircuit, color: 'pink' },
                    { id: Tab.VIP, label: 'VIP 特权', icon: Crown, color: 'yellow' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all ${
                        currentTab === tab.id
                            ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/30`
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* User Profile */}
            <div className="flex items-center gap-3">
                {user ? (
                    <div className="flex items-center gap-3 bg-gray-800 p-2 pl-4 pr-2 rounded-full border border-gray-700 shadow-lg">
                        <div className="text-right hidden xl:block">
                            <div className="font-bold text-sm text-white flex items-center justify-end gap-1">
                                {user.name}
                                {user.isVip && <Crown className="w-3 h-3 text-yellow-400 fill-current" />}
                            </div>
                            <div className="text-xs text-gray-400">{user.isVip ? 'VIP 会员' : '免费用户'}</div>
                        </div>
                        <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full border-2 border-indigo-500"
                        />
                        {user.role !== 'guest' ? (
                             <button 
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-gray-700"
                                title="退出登录"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setShowAuthModal(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-colors"
                            >
                                注册/登录
                            </button>
                        )}
                       
                    </div>
                ) : (
                    <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-white font-bold">
                        <LogIn className="w-4 h-4" /> 登录
                    </button>
                )}
            </div>
        </header>

        {/* Main Content Area */}
        <main className="animate-fade-in relative z-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;