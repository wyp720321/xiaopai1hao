
export enum Tab {
    DASHBOARD = 'dashboard',
    TRANSFER = 'transfer',
    DOWNLOAD = 'download',
    AI = 'ai',
    VIP = 'vip'
  }
  
  export type TaskStatus = 'pending' | 'downloading' | 'transcoding' | 'uploading' | 'completed' | 'error' | 'analyzing' | 'transferring' | 'queued' | 'moving';
  
  export interface User {
    id: string;
    email: string;
    name: string;
    isVip: boolean;
    vipExpiry?: string;
    avatar?: string;
    role?: 'guest' | 'user' | 'admin';
  }

  export interface DownloadTask {
    id: string;
    url: string;
    filename: string;
    size: string;
    progress: number; // 0 to 100
    speed: string;
    status: TaskStatus;
    eta: string;
    logs: string[];
  }

  export interface TransferTask {
    id: string;
    originalLink: string;
    filename: string;
    sourceDrive: 'Aliyun' | '115' | 'Quark' | 'Baidu' | 'Unknown';
    targetDrive: string;
    targetPath: string;
    size: string;
    progress: number;
    speed: string;
    status: TaskStatus;
    logs: string[];
    isVip: boolean;
    retryCount: number;
  }
  
  export interface AIFileProposal {
    id: string;
    filename: string;
    originalPath: string;
    newPath: string;
    category: 'Movies' | 'Series' | 'Documents' | 'Music' | 'Photos' | 'Others';
    reason: string;
    status: 'pending' | 'moving' | 'done' | 'error';
  }

  export interface Stats {
    totalFilesTransferred: number;
    totalDataSaved: string;
    hoursSaved: number;
    tasksToday: number;
  }
  
  export const MOCK_LOGS = [
    "[aria2c] 连接到 swarm 网络",
    "[aria2c] 正在从 12 个节点做种",
    "[yt-dlp] 解析视频信息中...",
    "[ffmpeg] 正在转码为 MP4 容器",
    "[aliyun] 上传分片 1/45"
  ];
