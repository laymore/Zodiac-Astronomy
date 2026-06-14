import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CalendarDays } from 'lucide-react';

interface SolarTermPopupProps {
  isOpen: boolean;
  onClose: () => void;
  termData: { name: string; details: string; milestone: string } | null;
}

export function SolarTermPopup({ isOpen, onClose, termData }: SolarTermPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && termData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-br from-blue-900/40 to-slate-900 overflow-hidden text-center">
              <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-300">
                Tiết {termData.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/80 rounded-full transition-colors text-white/70 hover:text-white z-10"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-6 pt-4 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
                <CalendarDays className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{termData.milestone}</span>
              </div>

              <div className="text-slate-300 leading-relaxed text-sm">
                 <p>{termData.details}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
