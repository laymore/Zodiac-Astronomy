import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Send, Eye, X } from 'lucide-react';
import type { ZodiacNote } from '../services/memwalService';

export function ProphecyOrb({
  target,
  onClose,
  notes,
  isLoading,
  onProphesy
}: {
  target: string;
  onClose: () => void;
  notes: ZodiacNote[];
  isLoading: boolean;
  onProphesy: (note: Omit<ZodiacNote, 'id' | 'sign'>) => void;
}) {
    const orbRef = useRef<any>(null);
    useFrame((state) => {
        if (orbRef.current) {
            orbRef.current.rotation.x += 0.005;
            orbRef.current.rotation.y += 0.01;
        }
    });

    const [mode, setMode] = useState<'idle' | 'create' | 'view'>('idle');
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    return (
        <group>
            {/* The Orb */}
            <Sphere ref={orbRef} args={[5, 64, 64]} position={[0,0,-5]}>
                <MeshDistortMaterial
                    color="#4f46e5"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
            
            {/* Ambient Light for Orb */}
            <pointLight position={[0, 0, 5]} intensity={100} color="#818cf8" />
            <ambientLight intensity={0.5} color="#c7d2fe" />

            {/* UI Canvas Overlay */}
            <Html center position={[0, 0, -5]} className="pointer-events-none">
                <div className="flex flex-col items-center w-[90vw] max-w-[600px] pointer-events-auto relative">
                    <div className="absolute top-[-60px] right-4 md:right-0 flex">
                      <button onClick={onClose} className="bg-red-500/80 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-500 backdrop-blur border border-red-400/50 transition-all z-50 uppercase tracking-wider font-semibold shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        <X size={18} />
                        Thoát
                      </button>
                    </div>

                    <h2 className="text-4xl font-bold text-indigo-300 drop-shadow-lg mb-8 tracking-widest text-center" style={{ textShadow: "0 0 20px rgba(79,70,229,0.8)" }}>
                        Viên Ngọc Tiên Tri<br/>
                        <span className="text-2xl text-amber-200 mt-2 block">({target})</span>
                    </h2>

                    {mode === 'idle' && (
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 w-full sm:w-auto px-4">
                            <button onClick={() => setMode('create')} className="w-full sm:w-auto bg-indigo-600/80 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl backdrop-blur-md transition-all font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(79,70,229,0.5)] text-center">
                                Tiên tri
                            </button>
                            <button onClick={() => setMode('view')} className="w-full sm:w-auto bg-black/60 hover:bg-black/80 text-white border border-indigo-400/50 px-8 py-3 rounded-2xl backdrop-blur-md transition-all font-semibold uppercase tracking-wider text-center">
                                Xem tiên tri
                            </button>
                        </div>
                    )}

                    {mode === 'create' && (
                        <div className="bg-black/70 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-3xl w-[100%] shadow-2xl">
                            <h3 className="text-xl text-indigo-300 mb-4 font-semibold shrink-0">Để lại lời tiên tri cho {target}</h3>
                            <input
                                type="text"
                                placeholder="Danh xưng nhà tiên tri..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:border-indigo-400 outline-none transition-colors"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <textarea
                                placeholder="Viết lời sấm truyền..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 h-32 resize-none focus:border-indigo-400 outline-none transition-colors"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setMode('idle')} className="px-4 py-2 text-gray-400 hover:text-white">Hủy</button>
                                <button
                                    onClick={() => {
                                        if (name && content) {
                                            onProphesy({ name, birthDate: content });
                                            setMode('idle');
                                            setName('');
                                            setContent('');
                                        }
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                                >
                                    <Send size={16} /> Báo mộng
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'view' && (
                      <div className="bg-black/70 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-3xl w-[100%] h-[400px] flex flex-col relative shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl text-indigo-300 font-semibold flex items-center gap-2 shrink-0">
                                <Eye size={20} /> Sấm truyền về {target}
                            </h3>
                            <button onClick={() => setMode('idle')} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                         </div>
                         <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {isLoading ? (
                                <div className="text-center text-indigo-400 pt-10">Đang nhìn thấu tương lai...</div>
                            ) : notes.length === 0 ? (
                                <div className="text-center text-gray-400 pt-10">Chưa có ai tiên tri về nơi này.</div>
                            ) : (
                                notes.map((note) => (
                                    <div key={note.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="text-amber-200 font-medium mb-2 opacity-90">{note.name} đã phán:</div>
                                        <div className="text-gray-200 leading-relaxed indent-4 italic">"{note.birthDate}"</div>
                                    </div>
                                ))
                            )}
                         </div>
                      </div>
                    )}
                </div>
            </Html>
        </group>
    );
}
