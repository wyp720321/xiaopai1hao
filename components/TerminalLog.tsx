import React, { useEffect, useRef } from 'react';

interface TerminalLogProps {
  logs: string[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用 scrollTop 直接控制容器滚动，防止 scrollIntoView 导致整个页面跳动
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef} 
      className="bg-black/50 rounded-lg p-3 font-mono text-xs text-green-400 h-32 overflow-y-auto border border-gray-700"
    >
      {logs.map((log, i) => (
        <div key={i} className="whitespace-nowrap">
          <span className="text-gray-500 mr-2">$</span>
          {log}
        </div>
      ))}
    </div>
  );
};