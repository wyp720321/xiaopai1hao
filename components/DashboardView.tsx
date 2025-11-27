import React from 'react';
import { Stats, User } from '../types';
import { getStats } from '../services/mockApi';
import { BarChart3, HardDrive, Clock, Zap, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
    user: User;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string, color: string }> = ({ icon, label, value, sub, color }) => (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden group hover:border-gray-600 transition-all">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-400`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
        </div>
        <div className="relative z-10">
            <div className={`p-3 bg-${color}-500/10 rounded-xl w-fit mb-4 text-${color}-400`}>
                {icon}
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-medium">{sub}</span>
                <span>较上周</span>
            </p>
        </div>
    </div>
);

const DashboardView: React.FC<DashboardProps> = ({ user }) => {
    const stats = getStats();

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">仪表盘</h2>
                    <p className="text-gray-400">欢迎回来，{user.name}。这是您今天的云端效率概览。</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300">
                    上次登录: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<HardDrive />} 
                    label="总传输数据" 
                    value={stats.totalDataSaved} 
                    sub="+12%" 
                    color="indigo" 
                />
                <StatCard 
                    icon={<BarChart3 />} 
                    label="已完成任务" 
                    value={stats.totalFilesTransferred.toString()} 
                    sub="+54" 
                    color="emerald" 
                />
                <StatCard 
                    icon={<Clock />} 
                    label="节省时间" 
                    value={`${stats.hoursSaved} 小时`} 
                    sub="+2.5h" 
                    color="pink" 
                />
                <StatCard 
                    icon={<Zap />} 
                    label="今日任务" 
                    value={stats.tasksToday.toString()} 
                    sub="+4" 
                    color="yellow" 
                />
            </div>

            {/* Simple Chart Simulation */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-6">流量趋势 (近7天)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[45, 60, 35, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                <div 
                                    className="w-full bg-indigo-500/20 rounded-t-lg relative group-hover:bg-indigo-500/40 transition-all" 
                                    style={{ height: `${h}%` }}
                                >
                                     <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-xs px-2 py-1 rounded border border-gray-700 whitespace-nowrap z-10">
                                         {h} GB
                                     </div>
                                </div>
                                <span className="text-xs text-gray-500">{['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-6">存储分布</h3>
                    <div className="space-y-6">
                        {[
                            { label: '视频', percent: 65, color: 'bg-blue-500' },
                            { label: '文档', percent: 20, color: 'bg-green-500' },
                            { label: '图片', percent: 10, color: 'bg-yellow-500' },
                            { label: '其他', percent: 5, color: 'bg-gray-500' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">{item.label}</span>
                                    <span className="text-gray-500">{item.percent}%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                        <p className="text-sm text-gray-400">总容量: 5TB / 10TB (VIP)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;