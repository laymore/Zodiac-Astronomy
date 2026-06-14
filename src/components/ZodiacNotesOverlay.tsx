import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

import { Database, Loader2 } from 'lucide-react';
import type { ZodiacNote } from '../services/memwalService';

export function ZodiacNotesOverlay({ 
  sign, 
  onClose, 
  notes, 
  onAddNote, 
  onDeleteNote,
  isLoading
}: { 
  sign: string; 
  onClose: () => void; 
  notes: ZodiacNote[];
  onAddNote: (note: { name: string; birthDate: string }) => void;
  onDeleteNote: (id: string) => void;
  isLoading?: boolean;
}) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleAdd = () => {
    if (name.trim() && birthDate.trim()) {
      onAddNote({ name, birthDate });
      setName('');
      setBirthDate('');
    }
  }

  return (
    <div className="absolute top-0 right-0 h-full bg-black/80 border-l border-amber-500/30 backdrop-blur-xl w-[400px] max-w-full z-[999] text-white p-6 shadow-[-10px_0_30px_rgba(245,158,11,0.1)] flex flex-col pointer-events-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-400">Ghi chú: {sign}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-300">
            <Database size={12} />
            <span>Memwal (Sui Network)</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors mt-[-10px]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2 custom-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 bg-black/40 backdrop-blur-sm rounded-xl">
            <Loader2 size={24} className="animate-spin mb-2" />
            <span className="text-xs">Đang đồng bộ Memwal...</span>
          </div>
        ) : null}
        
        {notes.length === 0 && !isLoading ? (
          <div className="text-gray-400 text-sm italic text-center py-6 border border-dashed border-white/20 rounded-xl">
            Chưa có ghi chú nào.<br />Thêm người bạn đầu tiên của bạn!
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10">
              <div className="flex flex-col">
                <span className="font-medium text-pink-300 text-lg">{note.name}</span>
                <span className="text-xs text-gray-400 mt-1">Sinh nhật: <span className="text-gray-300 font-medium">{note.birthDate}</span></span>
              </div>
              <button 
                onClick={() => onDeleteNote(note.id)} 
                className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
                title="Xóa ghi chú"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        <input 
          type="text" 
          placeholder="Tên (VD: Nguyễn Văn A)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all placeholder:text-gray-600"
        />
        <input 
          type="text" 
          placeholder="Ngày sinh (VD: 10/3)" 
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all placeholder:text-gray-600"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
        />
        <button 
          onClick={handleAdd}
          disabled={!name.trim() || !birthDate.trim()}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-400 hover:to-yellow-300 text-black font-bold rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all mt-2 shadow-lg shadow-amber-500/20"
        >
          <Plus size={18} strokeWidth={3} /> Thêm người vào chòm sao
        </button>
      </div>
    </div>
  )
}
