import React, { useState } from 'react';
import { Sparkles, Html } from '@react-three/drei';
import { Heart, X } from 'lucide-react';
import { ZodiacNote } from '../services/memwalService';
import { playScrollOpenSound, playScrollCloseSound } from '../utils/audio';

interface ProphecyScrollProps {
  note: ZodiacNote;
  rank: number; // 1 to 7
  position: [number, number, number];
}

export function ProphecyScroll({ note, rank, position }: ProphecyScrollProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Sinh ra số sao (★) dựa trên rank (top 1 = 7 sao, top 7 = 1 sao, hoặc ngược lại?)
  // "từ 1 tới 7 sao": Top 1 sẽ có 7 sao, Top 2 có 6 sao... Top 7 có 1 sao.
  const starCount = 8 - rank; 
  const stars = "★".repeat(starCount) + "☆".repeat(7 - starCount);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (open) playScrollOpenSound();
    else playScrollCloseSound();
  };

  return (
    <group position={position}>
      {/* Particle Effects */}
      {!isOpen && (
        <Sparkles 
          count={30 - rank * 2} 
          scale={rank === 1 ? 2.5 : 1.5} 
          size={rank === 1 ? 4 : 2} 
          color={rank <= 3 ? '#fbbf24' : '#e2e8f0'} 
          opacity={0.8} 
          speed={0.4} 
        />
      )}
      
      <Html center zIndexRange={[100, 0]} className="pointer-events-none">
        <div className="pointer-events-auto">
          {!isOpen ? (
            // Cuộn bí kíp đóng (Rolled Scroll)
            <div 
              onClick={() => handleToggle(true)}
              className="relative cursor-pointer group hover:-translate-y-1 transition-transform"
            title={`Top ${rank} Phán truyền - Nhấn để mở`}
          >
            {/* Trục gỗ */}
            <div className="w-16 h-3 bg-gradient-to-b from-[#4e2a1d] via-[#2d1610] to-[#4e2a1d] rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg border-x-2 border-[#b71c1c]" />
            
            {/* Giấy cuộn tròn */}
            <div className="w-12 h-6 bg-gradient-to-b from-[#f4e4bc] via-[#d7ccc8] to-[#e6d5b8] rounded absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner flex items-center justify-center border-y border-[#8d6e63]">
              {/* Dây đỏ buộc */}
              <div className="absolute w-2 h-full bg-[#b71c1c] left-1/2 -translate-x-1/2 shadow-sm" />
              <div className="absolute w-3 h-3 bg-yellow-600 rounded-full left-1/2 -translate-x-1/2 flex items-center justify-center text-[6px] text-yellow-100 font-bold border border-yellow-800">
                {rank}
              </div>
            </div>

            {/* Số sao hiển thị dưới cuộn */}
            <div className="absolute top-[120%] left-1/2 -translate-x-1/2 text-[10px] text-yellow-400 tracking-widest drop-shadow-md whitespace-nowrap font-bold">
              {stars}
            </div>
            
            {rank === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] bg-red-600 text-white px-1 rounded shadow-md whitespace-nowrap animate-bounce">
                Thượng Thừa
              </div>
            )}
          </div>
        ) : (
          // Cuộn bí kíp mở (Unrolled Scroll)
          <div className="relative w-48 animate-unroll shadow-2xl origin-center z-50">
            {/* Trục trên */}
            <div className="h-3 w-full wood-roller rounded border-y border-black/50 relative z-20">
              <div className="absolute -left-1 top-0 bottom-0 w-2 roller-cap-left rounded-l-sm" />
              <div className="absolute -right-1 top-0 bottom-0 w-2 roller-cap-right rounded-r-sm" />
            </div>
            
            {/* Giấy */}
            <div className="w-[96%] mx-auto bg-[#f4e4bc] border-x-4 border-[#d7ccc8] p-3 relative z-10 shadow-inner flex flex-col gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleToggle(false); }}
                className="absolute top-1 right-1 text-[#8d6e63] hover:text-[#b71c1c] p-0.5"
              >
                <X size={14} />
              </button>
              
              <div className="text-[10px] text-[#b71c1c] font-bold text-center border-b border-[#8d6e63]/30 pb-1 mb-1 font-serif">
                Mật Tịch {stars}
              </div>
              
              <p className="text-xs text-[#1a1a1a] leading-relaxed font-serif whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-ninja">
                {note.message}
              </p>
              
              <div className="mt-1 flex items-center justify-between text-[9px] text-[#5d4037] border-t border-[#8d6e63]/30 pt-1">
                <span className="font-bold">{note.name}</span>
                <span className="flex items-center gap-0.5 text-[#b71c1c]">❤️ {note.likes || 0}</span>
              </div>
            </div>

            {/* Trục dưới */}
            <div className="h-3 w-full wood-roller rounded border-y border-black/50 relative z-20">
              <div className="absolute -left-1 top-0 bottom-0 w-2 roller-cap-left rounded-l-sm" />
              <div className="absolute -right-1 top-0 bottom-0 w-2 roller-cap-right rounded-r-sm" />
            </div>
          </div>
        )}
      </div>
      </Html>
    </group>
  );
}
