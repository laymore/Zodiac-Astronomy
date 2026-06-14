import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Sparkles, Send, Database, Lock, Loader2, LogOut } from 'lucide-react';

interface ArchiveMessage {
  id: string;
  sender: string;
  address: string;
  content: string;
  timestamp: Date;
  namespace: string;
}

interface GalaxyArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWallet: { address: string; email: string } | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

// Temporary mock of Memwal namespaces (20 public slots on dev wallet)
const NAMESPACES = Array.from({ length: 20 }, (_, i) => `memwal_ns_public_${i + 1}`);

// Temporary mock data
const MOCK_MESSAGES: ArchiveMessage[] = [
  { id: '1', sender: 'Explorer_X', address: '0x1a...4b2c', content: 'Cảnh quan tuyệt đẹp từ góc nhìn của chòm Vòm Tuyến.', timestamp: new Date(Date.now() - 3600000), namespace: 'memwal_ns_public_1' },
  { id: '2', sender: 'Stargazer99', address: '0x8f...1c99', content: 'Gửi ngàn lời chúc đến từ bờ bên kia của thiên hà!', timestamp: new Date(Date.now() - 7200000), namespace: 'memwal_ns_public_2' }
];

export function GalaxyArchiveModal({ isOpen, onClose, userWallet, isLoggingIn, onLogin, onLogout }: GalaxyArchiveModalProps) {
  const [messages, setMessages] = useState<ArchiveMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const handlePostMessage = () => {
    if (!newMessage.trim() || !userWallet) return;

    // Simulate writing to dev's Memwal namespace on Sui Walrus
    const randomNamespace = NAMESPACES[Math.floor(Math.random() * NAMESPACES.length)];
    
    const post: ArchiveMessage = {
      id: Math.random().toString(),
      sender: userWallet.email.split('@')[0],
      address: userWallet.address.substring(0, 6) + '...' + userWallet.address.substring(userWallet.address.length - 4),
      content: newMessage.trim(),
      timestamp: new Date(),
      namespace: randomNamespace
    };

    setMessages([post, ...messages]);
    setNewMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-[#0f1219] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-indigo-900/40 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Database className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-light tracking-wide text-white flex items-center gap-2">
                    Tàng Thư <span className="font-bold text-indigo-400 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Thiên Hà</span>
                  </h2>
                  <p className="text-sm text-indigo-200/70 mt-1 flex items-center gap-1.5">
                    <Globe size={14} /> Sân chơi toàn cầu lưu trữ vĩnh viễn trên Walrus Sui
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Panel: Auth & Info */}
              <div className="w-full md:w-80 bg-black/40 border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                    <h3 className="text-indigo-300 font-medium text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Lock size={16} /> zkLogin Sui
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Đăng nhập bằng tài khoản Google để tự động tạo Ví Sui. Bạn có thể sử dụng ví này để ghi nhật ký vào Tàng Thư qua hạ tầng Memwal (Walrus).
                    </p>
                    
                    {!userWallet ? (
                      <button 
                        onClick={onLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-70"
                      >
                        {isLoggingIn ? (
                          <><Loader2 size={18} className="animate-spin" /> Đang tạo ví & ZKP...</>
                        ) : (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Tiếp tục với Google
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-black/50 p-3 rounded-lg border border-indigo-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {userWallet.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{userWallet.email}</div>
                            <div className="text-xs text-indigo-400 font-mono">{userWallet.address.substring(0, 15)}...</div>
                          </div>
                        </div>
                        <button 
                          onClick={onLogout}
                          className="w-full flex items-center justify-center gap-2 mt-3 text-xs text-gray-400 hover:text-white py-1.5 bg-white/5 rounded transition-colors"
                        >
                          <LogOut size={12} /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Thông số Hệ thống</h4>
                  <ul className="space-y-2 text-xs text-gray-500">
                    <li className="flex justify-between"><span>Cơ sở dữ liệu:</span> <span className="text-gray-300">Memwal</span></li>
                    <li className="flex justify-between"><span>Hạ tầng:</span> <span className="text-blue-400">Sui Walrus</span></li>
                    <li className="flex justify-between"><span>Namespaces:</span> <span className="text-purple-400">20 Public Slots</span></li>
                  </ul>
                </div>
              </div>

              {/* Right Panel: Chat / Diary list */}
              <div className="flex-1 flex flex-col bg-transparent">
                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/10 p-4 rounded-xl hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{msg.sender}</span>
                          <span className="text-xs text-indigo-400 font-mono">{msg.address}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {msg.timestamp.toLocaleTimeString()} - {msg.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className="mt-3 flex items-center justify-end">
                        <span className="text-[10px] bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                          {msg.namespace}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <Sparkles size={32} className="opacity-50" />
                      <p>Chưa có dấu ấn nào. Hãy là người đầu tiên!</p>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                  {userWallet ? (
                     <div className="flex gap-3">
                     <textarea 
                       value={newMessage}
                       onChange={e => setNewMessage(e.target.value)}
                       placeholder="Để lại dấu ấn của bạn vào vũ trụ... (Ghi qua Memwal & Sui Walrus)"
                       className="flex-1 bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none h-20 transition-colors"
                       onKeyDown={e => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handlePostMessage();
                         }
                       }}
                     />
                     <button 
                       onClick={handlePostMessage}
                       disabled={!newMessage.trim()}
                       className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white p-4 rounded-xl transition-colors flex items-center justify-center"
                     >
                       <Send size={20} />
                     </button>
                   </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-sm text-gray-500">
                      Hãy đăng nhập bằng zkLogin (Google) để để lại dấu ấn.
                    </div>
                  )}
                 
                </div>
              </div>
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
