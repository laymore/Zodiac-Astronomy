import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ChevronUp, ChevronDown, PenLine, Globe, Stars, Network, Layers, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { ZODIAC_DATA } from '../data/zodiacInfo';

interface UIOverlayProps {
  onSignSelect: (sign: string | null) => void;
  selectedSignData: any | null;
  selectedSignName?: string | null;
  timeOffsetDays: number;
  onTimeOffsetChange: (days: number) => void;
  timeOffsetHours: number;
  onTimeOffsetHoursChange: (hours: number) => void;
  onResetTime: () => void;
  computedTime: Date;
  onOpenPersonalChart: () => void;
  onOpenArchive: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showConstellations: boolean;
  onToggleConstellations: () => void;
  showStars: boolean;
  onToggleStars: () => void;
  userWallet: { address: string; email: string } | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

function getMoonPhase(date: Date) {
  // Known new moon: Jan 11, 2024, 11:57 UTC
  const newMoonDate = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
  
  const elapsed = date.getTime() - newMoonDate;
  const phaseValue = (elapsed % synodicMonth) / synodicMonth;
  // If negative, wrap around
  const normalizedPhase = phaseValue < 0 ? 1 + phaseValue : phaseValue;

  let phaseName = "";
  let emoji = "";

  if (normalizedPhase < 0.03 || normalizedPhase >= 0.97) { phaseName = "Trăng Non"; emoji = "🌑"; }
  else if (normalizedPhase < 0.22) { phaseName = "Trăng Lưỡi Liềm Đầu Tháng"; emoji = "🌒"; }
  else if (normalizedPhase < 0.28) { phaseName = "Bán Nguyệt Đầu Tháng"; emoji = "🌓"; }
  else if (normalizedPhase < 0.47) { phaseName = "Trăng Khuyết Đầu Tháng"; emoji = "🌔"; }
  else if (normalizedPhase < 0.53) { phaseName = "Trăng Tròn"; emoji = "🌕"; }
  else if (normalizedPhase < 0.72) { phaseName = "Trăng Khuyết Cuối Tháng"; emoji = "🌖"; }
  else if (normalizedPhase < 0.78) { phaseName = "Bán Nguyệt Cuối Tháng"; emoji = "🌗"; }
  else { phaseName = "Trăng Lưỡi Liềm Cuối Tháng"; emoji = "🌘"; }

  return { name: phaseName, emoji, phase: normalizedPhase };
}

function getEclipticLongitude(date: Date) {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const daysSinceJ2000 = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);
  const L = (280.460 + 0.9856474 * daysSinceJ2000) % 360;
  const g = ((357.528 + 0.9856003 * daysSinceJ2000) % 360) * Math.PI / 180;
  let lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
  if (lambda < 0) lambda += 360;
  return lambda;
}

const ZODIAC_SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ",
  "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"
];

const SOLAR_TERMS = [
  "Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng",
  "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ",
  "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết",
  "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"
];

function getAstrologyInfo(date: Date) {
  const lambda = getEclipticLongitude(date);
  const signIndex = Math.floor(lambda / 30) % 12;
  const termIndex = Math.floor(lambda / 15) % 24;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    term: SOLAR_TERMS[termIndex]
  };
}

const SIGNS = Object.keys(ZODIAC_DATA);

export function UIOverlay({ 
  onSignSelect, 
  selectedSignData, 
  selectedSignName, 
  timeOffsetDays, 
  onTimeOffsetChange, 
  timeOffsetHours,
  onTimeOffsetHoursChange,
  onResetTime,
  computedTime, 
  onOpenPersonalChart, 
  onOpenArchive,
  showGrid, 
  onToggleGrid,
  showConstellations,
  onToggleConstellations,
  showStars,
  onToggleStars,
  userWallet,
  isLoggingIn,
  onLogin,
  onLogout
}: UIOverlayProps) {
  const [showList, setShowList] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showUI, setShowUI] = useState<boolean>(true);

  const handleSelect = (s: string | null) => {
    onSignSelect(s);
  };

  const moonPhase = getMoonPhase(computedTime);
  const astroInfo = getAstrologyInfo(computedTime);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 text-white font-sans z-10">
      
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-none">
        
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <motion.button 
              initial={{ opacity: 0, x: -20, scale: 0.8 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }}
              onClick={onOpenPersonalChart}
              className="bg-black/60 backdrop-blur-xl border border-white/20 p-3 rounded-xl hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 transition-all group shadow-lg"
              title="Bản đồ sao cá nhân"
            >
              <PenLine size={24} className="text-gray-300 group-hover:text-amber-400 transition-colors" />
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: -20, scale: 0.8 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }}
              onClick={() => setShowUI(!showUI)}
              className="bg-black/60 backdrop-blur-xl border border-white/20 p-3 rounded-xl hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 transition-all group shadow-lg"
              title={showUI ? "Ẩn giao diện" : "Hiện giao diện"}
            >
              {showUI ? <EyeOff size={24} className="text-gray-300 group-hover:text-amber-400 transition-colors" /> : <Eye size={24} className="text-amber-400" />}
            </motion.button>
          </div>
          
          <AnimatePresence>
            {showUI && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pointer-events-auto block">
                <h1 className="text-3xl font-light tracking-widest uppercase">Thiên Văn <br/><span className="font-bold text-amber-400">Hoàng Đạo</span></h1>
                <p className="text-sm text-gray-400 mt-2">Dữ liệu tra cứu chòm sao trực quan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {showUI && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-2 items-end pointer-events-auto text-right relative"
            >

          {/* zkLogin Auth Block */}
          {!userWallet ? (
            <button 
              onClick={onLogin} 
              disabled={isLoggingIn}
              className="bg-white hover:bg-gray-100 text-gray-900 border border-white/20 px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg"
            >
              {isLoggingIn ? (
                <span className="text-sm font-medium">Đang tạo ví...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-medium">Đăng nhập tài khoản Sui</span>
                </>
              )}
            </button>
          ) : (
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 pl-4 py-2 pr-2 rounded-xl flex items-center gap-3 shadow-lg">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-mono">{userWallet.address.substring(0, 10)}...</span>
                <span className="font-medium text-amber-400 text-xs">{userWallet.email}</span>
              </div>
              <button onClick={onLogout} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-lg transition-colors border border-red-500/30 ml-2" title="Đăng xuất">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          )}

          <div className="bg-black/60 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-xl flex items-center gap-4 mt-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Mặt Trời tại</span>
              <span className="font-medium text-amber-400 text-sm">{astroInfo.sign}</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Tiết khí</span>
              <span className="font-medium text-blue-300 text-sm">{astroInfo.term}</span>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-xl flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                {computedTime.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="font-medium text-amber-400 text-sm">{moonPhase.name}</span>
              <span className="text-xs text-gray-500 mt-0.5">{Math.round(moonPhase.phase * 100)}% chu kỳ</span>
            </div>
            <span className="text-3xl filter drop-shadow-lg leading-none">{moonPhase.emoji}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 backdrop-blur-md rounded-full transition-colors ${showFilters ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-white/10 text-white hover:bg-white/20 border border-transparent'}`}
              title="Bộ lọc hiển thị"
            >
              <Layers size={20} />
            </button>
            <button 
              onClick={onOpenArchive}
              className="p-3 bg-indigo-500/20 text-indigo-300 backdrop-blur-md rounded-full hover:bg-indigo-500/40 border border-indigo-500/50 transition-colors"
              title="Tàng thư Thiên hà (Nhật ký qua Memwal / Walrus Sui)"
            >
              <BookOpen size={20} />
            </button>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex flex-col gap-2 min-w-[200px]"
              >
                 <button 
                  onClick={onToggleGrid}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${showGrid ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-white'}`}
                >
                  <span className="text-sm">Lưới thiên cầu</span>
                  <Globe size={18} />
                </button>
                <button 
                  onClick={onToggleConstellations}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${showConstellations ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-white'}`}
                >
                  <span className="text-sm">Chòm sao hoàng đạo</span>
                  <Network size={18} />
                </button>
                <button 
                  onClick={onToggleStars}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${showStars ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-white'}`}
                >
                  <span className="text-sm">Bầu trời sao</span>
                  <Stars size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-end justify-center mb-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {showUI && selectedSignName && selectedSignData ? (
            <motion.div 
              key="info"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl max-w-lg w-full pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-amber-400">{selectedSignName} <span className="text-sm text-white/50 font-normal">({selectedSignData.constellation})</span></h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedSignData.dates}</p>
                </div>
                <button onClick={() => handleSelect(null)} className="text-gray-400 hover:text-white text-sm">Đóng</button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <span className="text-gray-400 block mb-1">Nguyên tố</span>
                    <span className="font-medium text-white">{selectedSignData.element}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                     <span className="text-gray-400 block mb-1">Hành tinh</span>
                     <span className="font-medium text-white">{selectedSignData.planet}</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                  <span className="text-indigo-300 text-xs uppercase tracking-widest font-bold mb-1 block">Tính cách</span>
                  <p className="text-indigo-100 text-sm leading-relaxed">{selectedSignData.traits}</p>
                </div>
                <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                  <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-1 block">Nghề nghiệp</span>
                  <p className="text-amber-100 text-sm leading-relaxed">{selectedSignData.career}</p>
                </div>
                <p className="text-gray-200 leading-relaxed text-sm">
                  {selectedSignData.description}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer / Time Scrubber */}
      <AnimatePresence>
        {showUI && (
          <motion.footer 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="w-full flex justify-center pointer-events-auto pb-6 px-4"
          >
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-[571px] max-w-full flex flex-col gap-4 relative">
              <button 
                onClick={onResetTime}
                className="absolute -top-12 right-0 bg-black/60 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white p-2 rounded-full transition-colors flex items-center justify-center"
                title="Trở về hiện tại & xem toàn cảnh"
              >
                <RotateCcw size={16} />
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 whitespace-nowrap w-[40px]">Ngày</span>
                <input 
                  type="range" 
                  min="-365" 
                  max="365" 
                  value={timeOffsetDays}
                  onChange={(e) => onTimeOffsetChange(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="text-amber-400 font-medium text-xs whitespace-nowrap min-w-[65px] text-right">
                  {timeOffsetDays === 0 ? "Hiện tại" : `${timeOffsetDays > 0 ? '+' : ''}${timeOffsetDays} d`}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 whitespace-nowrap w-[40px]">Giờ</span>
                <input 
                  type="range" 
                  min="-24" 
                  max="24" 
                  value={timeOffsetHours}
                  onChange={(e) => onTimeOffsetHoursChange(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="text-amber-400 font-medium text-xs whitespace-nowrap min-w-[65px] text-right">
                  {timeOffsetHours === 0 ? "Hiện tại" : `${timeOffsetHours > 0 ? '+' : ''}${timeOffsetHours} h`}
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
      
    </div>
  );
}
