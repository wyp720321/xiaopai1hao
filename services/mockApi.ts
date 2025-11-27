
import { DownloadTask, TransferTask, TaskStatus, MOCK_LOGS, AIFileProposal, User, Stats } from '../types';

// --- Utils ---
const uuid = () => Math.random().toString(36).substring(2, 9);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Simulated Database (LocalStorage) ---
const DB_KEYS = {
  USER: 'cem_user',
  TASKS: 'cem_tasks',
  STATS: 'cem_stats'
};

// --- Auth Service ---
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800); // Simulate network
    if (email && password) {
      // Mock logic: If email contains "vip", they are VIP. Otherwise Free.
      // In production, this would be a fetch('/api/auth/login')
      const isVip = email.includes('vip');
      const user: User = {
        id: uuid(),
        email,
        name: email.split('@')[0],
        isVip,
        vipExpiry: isVip ? '2025-12-31' : undefined,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: 'user'
      };
      localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  },

  register: async (email: string, password: string): Promise<User> => {
    await delay(1000);
    const user: User = {
      id: uuid(),
      email,
      name: email.split('@')[0],
      isVip: false, // New users are free
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'user'
    };
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    return user;
  },

  loginAsGuest: async (): Promise<User> => {
    await delay(500);
    const guestId = Math.floor(Math.random() * 10000);
    const user: User = {
      id: `guest_${guestId}`,
      email: `guest${guestId}@example.com`,
      name: `游客_${guestId}`,
      isVip: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest${guestId}`,
      role: 'guest'
    };
    // Do not save guest to local storage to allow reset on refresh if desired, 
    // or save it if you want persistence. Here we won't save it to keep it transient.
    sessionStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): User | null => {
    // Check session first (guest), then local (registered)
    const session = sessionStorage.getItem(DB_KEYS.USER);
    if (session) return JSON.parse(session);

    const stored = localStorage.getItem(DB_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(DB_KEYS.USER);
    sessionStorage.removeItem(DB_KEYS.USER);
  },

  upgradeUser: async (): Promise<User> => {
    await delay(1500); // Simulate Stripe webhook processing
    const user = authService.getCurrentUser();
    if (user) {
      const updated = { ...user, isVip: true, vipExpiry: '2025-12-31' };
      // Save to wherever it came from
      if (user.id.startsWith('guest')) {
          sessionStorage.setItem(DB_KEYS.USER, JSON.stringify(updated));
      } else {
          localStorage.setItem(DB_KEYS.USER, JSON.stringify(updated));
      }
      return updated;
    }
    throw new Error('No user logged in');
  }
};

// --- Task Services ---

export const parseLinks = (text: string): string[] => {
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
};

export const createMockTask = (url: string): DownloadTask => {
  let filename = '未知文件';
  if (url.includes('magnet')) filename = '终结者2：审判日.4K.REMUX.mkv';
  else if (url.includes('youtube') || url.includes('youtu.be')) filename = 'Lofi Girl - 学习伴侣视频.mp4';
  else if (url.includes('bilibili')) filename = 'Rick Astley - 也就是骗骗你.flv';
  else filename = url.split('/').pop() || 'downloaded_archive.zip';

  return {
    id: uuid(),
    url,
    filename,
    size: '1.4 GB',
    progress: 0,
    speed: '0 KB/s',
    status: 'pending',
    eta: '--:--',
    logs: ['[system] 任务初始化中...']
  };
};

export const simulateTaskUpdate = (task: DownloadTask, isVip: boolean): DownloadTask => {
  const newTask = { ...task };
  if (newTask.status === 'completed' || newTask.status === 'error') return newTask;

  // VIP Speed Multiplier
  const speedMultiplier = isVip ? 5 : 1;

  if (newTask.status === 'pending') {
    newTask.status = 'downloading';
    newTask.logs = [...newTask.logs, `[aria2c] 开始下载: ${newTask.filename}`];
  } else if (newTask.status === 'downloading') {
    newTask.progress += Math.random() * 5 * speedMultiplier;
    newTask.speed = `${(Math.random() * 15 * speedMultiplier + 5).toFixed(1)} MB/s`;
    if (newTask.progress >= 100) {
      newTask.progress = 0;
      newTask.status = 'transcoding';
      newTask.logs = [...newTask.logs, `[ffmpeg] 下载完成，开始转码...`];
    }
  } else if (newTask.status === 'transcoding') {
    newTask.progress += Math.random() * 10 * speedMultiplier;
    newTask.speed = '处理中...';
    if (newTask.progress >= 100) {
      newTask.progress = 0;
      newTask.status = 'uploading';
      newTask.logs = [...newTask.logs, `[aliyun] 转码完成，正在上传至云端...`];
    }
  } else if (newTask.status === 'uploading') {
    newTask.progress += Math.random() * 8 * speedMultiplier;
    newTask.speed = `${(Math.random() * 20 * speedMultiplier + 10).toFixed(1)} MB/s`;
    if (newTask.progress >= 100) {
      newTask.progress = 100;
      newTask.status = 'completed';
      newTask.logs = [...newTask.logs, `[system] 任务成功完成。`];
      newTask.speed = '0 KB/s';
      newTask.eta = '完成';
    }
  }
  return newTask;
};

// --- Transfer Logic ---

const detectSource = (link: string): 'Aliyun' | '115' | 'Quark' | 'Baidu' | 'Unknown' => {
  if (link.includes('aliyundrive.com')) return 'Aliyun';
  if (link.includes('115.com')) return '115';
  if (link.includes('pan.quark.cn')) return 'Quark';
  if (link.includes('pan.baidu.com')) return 'Baidu';
  return 'Unknown';
};

export const createTransferTask = (link: string, targetDrive: string, targetPath: string, isVip: boolean): TransferTask => {
  const source = detectSource(link);
  const filename = `[${source}]_备份归档_${Math.floor(Math.random() * 1000)}.zip`;

  return {
    id: uuid(),
    originalLink: link,
    filename,
    sourceDrive: source,
    targetDrive,
    targetPath,
    size: `${(Math.random() * 5 + 0.5).toFixed(1)} GB`,
    progress: 0,
    speed: '0 KB/s',
    status: 'pending',
    logs: [`[system] 正在解析 ${source} 链接...`],
    isVip,
    retryCount: 0
  };
};

export const simulateTransferUpdate = (task: TransferTask): TransferTask => {
  const newTask = { ...task };
  
  if (newTask.status === 'completed' || newTask.status === 'error') return newTask;

  const maxSpeed = task.isVip ? 45 : 5; // Throttle for free users
  const currentSpeed = Math.random() * maxSpeed;
  
  if (newTask.status === 'pending') {
    newTask.status = 'analyzing';
    newTask.logs = [...newTask.logs, `[crawler] 正在分析 ${newTask.sourceDrive} 文件结构...`];
  } else if (newTask.status === 'analyzing') {
    if (Math.random() > 0.8) {
        newTask.status = 'transferring';
        newTask.logs = [...newTask.logs, `[system] 元数据获取成功，开始传输至 ${newTask.targetDrive}...`];
    }
  } else if (newTask.status === 'transferring') {
    const progressIncrement = task.isVip ? (Math.random() * 5 + 1) : (Math.random() * 1 + 0.1);
    
    newTask.progress += progressIncrement;
    newTask.speed = `${currentSpeed.toFixed(1)} MB/s`;

    // Simulate VIP Auto-Retry
    if (task.isVip && Math.random() > 0.98 && task.retryCount < 3) {
       newTask.retryCount++;
       newTask.logs = [...newTask.logs, `[warn] 网络丢包，VIP 自动重试中 (${newTask.retryCount}/3)...`];
    }

    if (newTask.progress >= 100) {
      newTask.progress = 100;
      newTask.status = 'completed';
      newTask.speed = '0 KB/s';
      newTask.logs = [...newTask.logs, `[db] 任务记录已保存至 MongoDB`, `[system] 传输完成。`];
    } else {
       if (Math.random() > 0.8) {
         newTask.logs = [...newTask.logs, `[stream] 已传输分片 ${(newTask.progress * 100).toFixed(0)}...`];
       }
    }
  }

  return newTask;
};

// --- AI Logic ---

const MOCK_FILES = [
  "IMG_20230521_112233.jpg",
  "项目_Alice_最终报告_v2.pdf",
  "发票_2024_01.pdf",
  "复仇者联盟.终局之战.2019.1080p.mkv",
  "绝命毒师.S01E01.mp4",
  "工资条_12月.pdf",
  "DCIM_4452.jpg",
  "黑客帝国.1999.4K.mkv",
  "会议记录.txt",
  "搞笑猫咪视频.mov"
];

export const generateMockDirectory = (path: string): string[] => {
  return MOCK_FILES.map(f => f);
};

export const simulateAIAnalysis = (files: string[], currentPath: string): AIFileProposal[] => {
  return files.map(file => {
    let category: AIFileProposal['category'] = 'Others';
    let newSubPath = '';
    let reason = 'File extension';

    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      category = 'Photos';
      newSubPath = '/相册/2023/';
      reason = '视觉内容分析 (GPT-4o)';
    } else if (file.match(/\.(pdf|doc|txt)$/i)) {
      category = 'Documents';
      if (file.toLowerCase().includes('发票') || file.toLowerCase().includes('工资')) {
        newSubPath = '/文档/财务/';
        reason = '语义分析: 财务文档';
      } else {
        newSubPath = '/文档/工作/';
        reason = '语义分析: 工作相关';
      }
    } else if (file.match(/\.(mkv|mp4|mov)$/i)) {
      if (file.match(/S\d\dE\d\d/i)) {
        category = 'Series';
        newSubPath = '/视频/剧集/';
        reason = '正则匹配: 剧集格式';
      } else {
        category = 'Movies';
        newSubPath = '/视频/电影/';
        reason = '元数据查询: 电影数据库';
      }
    }

    return {
      id: uuid(),
      filename: file,
      originalPath: `${currentPath}/${file}`,
      newPath: `${currentPath}${newSubPath}${file}`,
      category,
      reason,
      status: 'pending'
    };
  });
};

// --- Stats Service ---
export const getStats = (): Stats => {
  return {
    totalFilesTransferred: 1458,
    totalDataSaved: '2.4 TB',
    hoursSaved: 42,
    tasksToday: 12
  };
};
