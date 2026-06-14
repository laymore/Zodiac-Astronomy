import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Sparkles, Send, Database, Lock, Loader2, LogOut, Heart, ScrollText, CheckCircle2, RefreshCw } from 'lucide-react';
import { fetchNotes, addNote, likeNote, restoreArchive, ZodiacNote } from '../services/memwalService';
import { ZODIAC_DATA } from '../data/zodiacInfo';

const NAMESPACES = ["Trái Đất", "Mặt Trăng", ...Object.keys(ZODIAC_DATA)];

interface GalaxyArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWallet: { address: string; email: string } | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  notesDict?: Record<string, ZodiacNote[]>;
  onRefreshNotes?: (sign: string) => Promise<void>;
  onAddNote?: (note: ZodiacNote) => void;
  onLikeNote?: (note: ZodiacNote) => void;
}

export function GalaxyArchiveModal({ 
  isOpen, 
  onClose, 
  userWallet, 
  isLoggingIn, 
  onLogin, 
  onLogout,
  notesDict = {},
  onRefreshNotes,
  onAddNote,
  onLikeNote
}: GalaxyArchiveModalProps) {
  const [selectedNamespace, setSelectedNamespace] = useState<string>("Trái Đất");
  const [newMessage, setNewMessage] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Local fallback state in case notesDict isn't populated yet
  const [localMessages, setLocalMessages] = useState<ZodiacNote[]>([]);

  // Sync props -> local messages
  useEffect(() => {
    if (isOpen) {
      const msgs = notesDict[selectedNamespace] || [];
      // Sắp xếp theo like giảm dần, rồi đến thời gian
      const sorted = [...msgs].sort((a, b) => {
        const likeA = a.likes || 0;
        const likeB = b.likes || 0;
        if (likeA !== likeB) return likeB - likeA;
        return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
      });
      setLocalMessages(sorted);
    }
  }, [isOpen, selectedNamespace, notesDict]);

  const handlePostMessage = async () => {
    if (!newMessage.trim() || !userWallet) return;

    const post: ZodiacNote = {
      id: Math.random().toString(36).substring(2, 9),
      name: userWallet.email.split('@')[0],
      address: userWallet.address.substring(0, 6) + '...' + userWallet.address.substring(userWallet.address.length - 4),
      message: newMessage.trim(),
      birthDate: new Date().toISOString(),
      sign: selectedNamespace,
      likes: 0,
      isSyncing: true // Đang đợi rememberAndWait
    };

    setNewMessage('');
    
    // Optimistic UI updates
    if (onAddNote) {
      onAddNote(post);
    } else {
      setLocalMessages([post, ...localMessages]);
    }

    try {
      const success = await addNote(post);
      
      // Update local state to remove isSyncing flag
      if (success) {
         setLocalMessages(prev => prev.map(n => n.id === post.id ? { ...n, isSyncing: false } : n));
         if (onRefreshNotes) {
           await onRefreshNotes(selectedNamespace);
         }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async (note: ZodiacNote) => {
    // Optimistic UI Update
    if (onLikeNote) {
      onLikeNote(note);
    } else {
      setLocalMessages(prev => prev.map(n => n.id === note.id ? { ...n, likes: (n.likes || 0) + 1, isSyncing: true } : n));
    }
    
    try {
      const success = await likeNote(note);
      if (success) {
         setLocalMessages(prev => prev.map(n => n.id === note.id ? { ...n, isSyncing: false } : n));
         if (onRefreshNotes) {
           await onRefreshNotes(note.sign);
         }
      }
    } catch (e) {
      console.error("Lỗi khi like: ", e);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const res = await restoreArchive(selectedNamespace);
      if (res) {
        alert(`Đã khôi phục ${res.restored} bí kíp mới từ Walrus! (Bỏ qua ${res.skipped} bản ghi cũ)`);
        if (onRefreshNotes) {
          await onRefreshNotes(selectedNamespace);
        }
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          {/* Backdrop tối */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Cuộn giấy (Scroll Container) */}
          <motion.div 
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-5xl flex flex-col relative z-10 origin-top"
          >
            {/* Trục cuộn trên (Top Roller) */}
            <div className="h-10 w-[104%] -ml-[2%] flex items-center relative z-20 shadow-2xl">
              <div className="w-8 h-12 roller-cap-left rounded-l-md shrink-0 border-y-2 border-black/50" />
              <div className="flex-1 h-10 wood-roller border-y-2 border-black/50 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
              </div>
              <div className="w-8 h-12 roller-cap-right rounded-r-md shrink-0 border-y-2 border-black/50" />
            </div>

            {/* Phần giấy da (Parchment Paper) */}
            <div className="w-full h-[80vh] parchment-bg shadow-2xl relative flex flex-col overflow-hidden border-x-[12px] border-[#d7ccc8]/80">
              {/* Ký tự phong ấn chìm */}
              <div className="mystical-seal select-none flex items-center justify-center whitespace-pre text-center leading-none" style={{ writingMode: 'vertical-rl' }}>
                封<br/>印
              </div>

              {/* Header của cuộn thư */}
              <div className="flex items-center justify-between p-5 border-b-2 border-[#8d6e63]/30 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#8d6e63]/20 flex items-center justify-center border-2 border-[#8d6e63]/40">
                    <ScrollText className="text-[#5d4037]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-widest text-[#3e2723] uppercase" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                      Tàng Thư Cấm Thuật
                    </h2>
                    <p className="text-sm text-[#5d4037] mt-0.5 flex items-center gap-1.5 font-medium">
                      <Globe size={14} /> 14 Không gian lưu trữ trên nền tảng Walrus
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#8d6e63]/20 text-[#5d4037] transition-colors"
                  title="Cuộn lại (Đóng)"
                >
                  <X size={26} strokeWidth={2.5} />
                </button>
              </div>

              {/* Nội dung chính */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
                
                {/* Panel Trái: Auth & Namespaces */}
                <div className="w-full md:w-72 border-r-2 border-[#8d6e63]/30 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-ninja">
                  {/* Trạng thái ví */}
                  <div className="bg-[#8d6e63]/10 border-2 border-[#8d6e63]/20 p-4 rounded-sm shadow-inner">
                    {!userWallet ? (
                      <button 
                        onClick={onLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-2 bg-[#3e2723] text-[#f4e4bc] py-2.5 px-3 rounded shadow-md text-sm font-bold tracking-wider hover:bg-[#5d4037] transition-colors disabled:opacity-70 border border-[#2d1610]"
                      >
                        {isLoggingIn ? (
                          <><Loader2 size={16} className="animate-spin" /> Kết ấn...</>
                        ) : (
                          <>Đăng nhập bằng Google</>
                        )}
                      </button>
                    ) : (
                      <div className="bg-[#e6d5b8] p-3 rounded border-2 border-[#8d6e63]/30 shadow-sm relative">
                        <div className="absolute top-0 right-0 p-1 opacity-20"><Lock size={16}/></div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-[#8d6e63] flex items-center justify-center text-[#f4e4bc] font-bold text-xs border border-[#5d4037] shadow-inner">
                            {userWallet.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-[#3e2723] truncate">{userWallet.email}</div>
                            <div className="text-[10px] text-[#5d4037] font-mono font-medium">{userWallet.address.substring(0, 15)}...</div>
                          </div>
                        </div>
                        <button 
                          onClick={onLogout}
                          className="w-full flex items-center justify-center gap-2 mt-2 text-xs text-[#b71c1c] font-bold hover:bg-[#b71c1c]/10 py-1.5 rounded transition-colors border border-[#b71c1c]/20"
                        >
                          <LogOut size={12} /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mục lục Cuộn thư (Namespace Selector) */}
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-ninja mt-2">
                    <div className="flex items-center justify-between border-b border-[#8d6e63]/20 pb-1 mb-3">
                      <h4 className="text-[#3e2723] text-xs font-black uppercase tracking-widest pl-1">Bản đồ Không Gian</h4>
                      <button 
                        onClick={handleRestore}
                        disabled={isRestoring}
                        title="Khôi phục dữ liệu từ Walrus nếu bị mất"
                        className="text-[#5d4037] hover:text-[#b71c1c] p-1 rounded hover:bg-[#8d6e63]/20 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={isRestoring ? "animate-spin" : ""} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {NAMESPACES.map(ns => (
                        <button
                          key={ns}
                          onClick={() => setSelectedNamespace(ns)}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-all flex items-center justify-between font-bold ${
                            selectedNamespace === ns 
                              ? 'bg-[#3e2723] text-[#f4e4bc] shadow-md border-l-4 border-[#b71c1c]' 
                              : 'text-[#5d4037] hover:bg-[#8d6e63]/10 border-l-4 border-transparent'
                          }`}
                        >
                          <span className="truncate">{ns}</span>
                          {notesDict[ns] && notesDict[ns].length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedNamespace === ns ? 'bg-[#b71c1c] text-white' : 'bg-[#8d6e63]/30 text-[#3e2723]'}`}>
                              {notesDict[ns].length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Panel Phải: Lời Tiên Tri */}
                <div className="flex-1 flex flex-col bg-transparent">
                  {/* Danh sách Tiên tri */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-ninja relative">
                    {localMessages.map((msg, index) => (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        {/* Seal background cho top 1 */}
                        {index === 0 && (msg.likes || 0) > 0 && (
                          <div className="absolute -top-4 -left-4 text-[#b71c1c] opacity-20 text-6xl pointer-events-none font-serif z-0">
                            印
                          </div>
                        )}

                        <div className={`p-4 rounded-sm relative z-10 ${
                          index === 0 && (msg.likes || 0) > 0 
                            ? 'bg-[#e6d5b8] border-2 border-[#b71c1c]/40 shadow-md' 
                            : 'bg-transparent border-b border-[#8d6e63]/30 hover:bg-[#8d6e63]/5 transition-colors'
                        }`}>
                          
                          {index === 0 && (msg.likes || 0) > 0 && (
                            <div className="absolute -top-3 -right-2 bg-[#b71c1c] text-[#f4e4bc] text-[10px] font-bold px-2 py-0.5 rounded shadow-md border border-[#7f0000] flex items-center gap-1">
                              ❖ Thượng Thừa
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#3e2723]">{msg.name}</span>
                              <span className="text-[10px] text-[#5d4037]/70 font-mono">[{msg.address}]</span>
                              {/* Hiển thị cờ Syncing / Synced */}
                              {msg.isSyncing ? (
                                <span className="flex items-center gap-1 text-[9px] text-[#8d6e63] border border-[#8d6e63]/30 px-1.5 py-0.5 rounded animate-pulse bg-[#8d6e63]/10">
                                  <Loader2 size={10} className="animate-spin" /> Đang khắc lên đá...
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[9px] text-green-700/80 border border-green-700/20 px-1.5 py-0.5 rounded bg-green-700/5">
                                  <CheckCircle2 size={10} /> Đã phong ấn
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8d6e63] font-medium">
                              {new Date(msg.birthDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Nội dung viết bằng cọ (mô phỏng) */}
                          <p className="text-[#1a1a1a] text-sm md:text-base leading-relaxed whitespace-pre-wrap ninja-text" style={{ fontFamily: 'Georgia, serif' }}>
                            {msg.message}
                          </p>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <button 
                              onClick={() => handleLike(msg)}
                              className="flex items-center gap-1.5 text-xs font-bold text-[#b71c1c] hover:text-[#d32f2f] transition-colors bg-[#b71c1c]/10 hover:bg-[#b71c1c]/20 px-2.5 py-1.5 rounded-sm border border-[#b71c1c]/30 shadow-sm"
                            >
                              <Heart size={14} className={msg.likes ? "fill-[#b71c1c]" : ""} />
                              <span>{msg.likes || 0} Ấn chú</span>
                            </button>
                            
                            <span className="text-[10px] font-bold text-[#3e2723] uppercase tracking-wider px-2 py-0.5 border-l-2 border-[#8d6e63]/50">
                              {msg.sign}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {localMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-[#8d6e63] space-y-3 font-serif">
                        <Sparkles size={32} className="opacity-50" />
                        <p className="text-lg">Cuộn thư trống rỗng. Hãy là người đầu tiên hạ bút!</p>
                      </div>
                    )}
                  </div>

                  {/* Vùng nhập văn bản (Mực & Bút) */}
                  <div className="p-4 border-t-2 border-[#8d6e63]/30 bg-[#e6d5b8]/50">
                    {userWallet ? (
                       <div className="flex gap-3">
                       <textarea 
                         value={newMessage}
                         onChange={e => setNewMessage(e.target.value)}
                         placeholder={`Hạ bút lưu truyền lời tiên tri vào không gian ${selectedNamespace}...`}
                         className="flex-1 bg-transparent border-2 border-[#8d6e63]/40 rounded-sm p-3 text-sm text-[#1a1a1a] placeholder-[#8d6e63] focus:outline-none focus:border-[#3e2723] focus:bg-[#f4e4bc] resize-none h-20 transition-colors ninja-text scrollbar-ninja font-serif"
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
                         title="Phong ấn (Gửi)"
                         className="bg-[#3e2723] hover:bg-[#5d4037] disabled:opacity-50 disabled:hover:bg-[#3e2723] text-[#f4e4bc] p-4 rounded-sm shadow-md border border-[#2d1610] transition-colors flex items-center justify-center group"
                       >
                         <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       </button>
                     </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center bg-[#8d6e63]/10 border-2 border-dashed border-[#8d6e63]/40 rounded-sm text-sm text-[#5d4037] font-bold">
                        Vui lòng kết ấn (Đăng nhập) để lưu truyền thông điệp.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trục cuộn dưới (Bottom Roller) */}
            <div className="h-10 w-[104%] -ml-[2%] flex items-center relative z-20 shadow-2xl">
              <div className="w-8 h-12 roller-cap-left rounded-l-md shrink-0 border-y-2 border-black/50" />
              <div className="flex-1 h-10 wood-roller border-y-2 border-black/50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
              </div>
              <div className="w-8 h-12 roller-cap-right rounded-r-md shrink-0 border-y-2 border-black/50" />
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
