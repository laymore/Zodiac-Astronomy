import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Sunrise, Sparkles } from 'lucide-react';
import { generateNatalChart } from '../utils/astrologyCalculator';
import { HOUSES_INFO, PLANETS_INFO } from '../data/astrologyHouses';

interface PersonalNatalChartProps {
  onClose: () => void;
}

export function PersonalNatalChart({ onClose }: PersonalNatalChartProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Try to load saved profile
    const saved = localStorage.getItem('personalNatalProfile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setName(parsed.name || '');
      setBirthDate(parsed.birthDate || '');
      setBirthTime(parsed.birthTime || '');
      if (parsed.name && parsed.birthDate) {
        setChartData(generateNatalChart(parsed.name, parsed.birthDate, parsed.birthTime));
      }
    }
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;

    localStorage.setItem('personalNatalProfile', JSON.stringify({ name, birthDate, birthTime }));
    const data = generateNatalChart(name, birthDate, birthTime);
    setChartData(data);
  };

  const handleReset = () => {
    setChartData(null);
    setName('');
    setBirthDate('');
    setBirthTime('');
    localStorage.removeItem('personalNatalProfile');
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0f1016] border border-amber-500/30 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>

        <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light tracking-widest uppercase mb-2">Bản Đồ Sao <span className="font-bold text-amber-400">Cá Nhân</span></h2>
            <p className="text-gray-400 text-sm">Khám phá ý nghĩa các chòm sao tại thời điểm bạn sinh ra</p>
          </div>

          {!chartData ? (
            <div className="max-w-md w-full mx-auto bg-white/5 border border-white/10 p-6 rounded-xl flex-1 flex flex-col justify-center">
              <form onSubmit={handleCalculate} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Họ và Tên</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Ngày sinh dương lịch</label>
                  <input 
                    type="date" 
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Giờ sinh (Tùy chọn)</label>
                  <input 
                    type="time" 
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors [color-scheme:dark]"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Sparkles size={18} />
                  Giải mã Bản đồ sao
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-8">
              {/* Profile Intro */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-6">
                <div>
                  <div className="text-sm text-amber-500 font-mono mb-1">WELCOME</div>
                  <h3 className="text-3xl font-bold">{name}</h3>
                  <div className="text-gray-400 text-sm mt-1">
                    {new Date(birthDate).toLocaleDateString('vi-VN')} {birthTime && `lúc ${birthTime}`}
                  </div>
                </div>
                <button 
                  onClick={handleReset}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10"
                >
                  Tạo mới
                </button>
              </div>

              {/* Big 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/10 border border-amber-500/30 p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <Sun size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Cung Mặt Trời (Sun)</div>
                      <div className="text-lg font-bold text-amber-400">{chartData.sunSign}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{PLANETS_INFO.Sun}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-900/10 border border-blue-500/30 p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Moon size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Cung Mặt Trăng (Moon)</div>
                      <div className="text-lg font-bold text-blue-400">{chartData.moonSign}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{PLANETS_INFO.Moon}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-900/10 border border-purple-500/30 p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Sunrise size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Cung Mọc (Rising/Asc)</div>
                      <div className="text-lg font-bold text-purple-400">{chartData.risingSign}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{PLANETS_INFO.Rising}</p>
                </div>
              </div>

              {/* 12 Houses */}
              <div>
                <h4 className="text-xl font-bold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                  12 Nhà Chiêm Tinh (Houses)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartData.houses.map((house: any, idx: number) => {
                    const houseInfo = HOUSES_INFO.find(h => h.house === house.houseNumber);
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col h-full hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-400">NHÀ {house.houseNumber}</span>
                          <span className="text-sm font-bold text-amber-400 px-2 py-1 bg-amber-500/10 rounded">{house.sign}</span>
                        </div>
                        <h5 className="font-bold text-white text-sm mb-2">{houseInfo?.name}</h5>
                        <p className="text-xs text-gray-400 flex-1">{houseInfo?.meaning}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
