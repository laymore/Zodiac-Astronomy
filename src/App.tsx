/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="@react-three/fiber" />
import { useState, Suspense, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { SolarSystem } from './components/SolarSystem';
import { UIOverlay } from './components/UIOverlay';
import { ZODIAC_DATA } from './data/zodiacInfo';
import { CameraAnimator } from './components/CameraAnimator';
import { ZodiacNotesOverlay } from './components/ZodiacNotesOverlay';
import { PersonalNatalChart } from './components/PersonalNatalChart';
import { GalaxyArchiveModal } from './components/GalaxyArchiveModal';
import { fetchNotes, addNote } from './services/memwalService';
import type { ZodiacNote } from './services/memwalService';
import { animateCameraBezier } from './lib/cameraTransitions';
import { ProphecyOrb } from './components/ProphecyOrb';
import { SolarTermPopup } from './components/SolarTermPopup';
import { AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from './lib/audio';

import { StarryBackground } from './components/StarryBackground';
import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';

export default function App() {
  const [selectedInfo, setSelectedInfo] = useState<any | null>(null);
  const [selectedSignName, setSelectedSignName] = useState<string | null>(null);
  const [timeOffsetDays, setTimeOffsetDays] = useState<number>(0);
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const [isEarthFocused, setIsEarthFocused] = useState<boolean>(false);
  const [showPersonalChart, setShowPersonalChart] = useState<boolean>(false);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showConstellations, setShowConstellations] = useState<boolean>(true);
  const [showStars, setShowStars] = useState<boolean>(true);
  const [selectedSolarTerm, setSelectedSolarTerm] = useState<{name: string, details: string, milestone: string} | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  // Custom Notes State (Memwal)
  const [notes, setNotes] = useState<Record<string, ZodiacNote[]>>({});
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(true);
  
  // zkLogin Wallet Auth State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutateAsync: connectWallet } = useConnectWallet();
  const { mutateAsync: disconnectWallet } = useDisconnectWallet();
  const wallets = useWallets().filter(isEnokiWallet);
  const googleWallet = wallets.find(w => w.provider === 'google');

  const userWallet = currentAccount ? { 
    address: currentAccount.address, 
    email: 'Google User' 
  } : null;

  const [prophecyTarget, setProphecyTarget] = useState<string | null>(null);

  const handleZkLoginGoogle = async () => {
    if (!googleWallet) {
      alert("Enoki Google Wallet is not configured or registered.");
      return;
    }
    setIsLoggingIn(true);
    try {
      await connectWallet({ wallet: googleWallet });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await disconnectWallet();
    } catch (e) {
      console.error(e);
    }
  };

  const reloadNotesForSign = async (sign: string) => {
    const fetched = await fetchNotes(sign);
    setNotes(prev => ({ ...prev, [sign]: fetched }));
  };

  useEffect(() => {
    async function loadNotes() {
      setIsLoadingNotes(true);
      const allSigns = [...Object.keys(ZODIAC_DATA), "Trái Đất", "Mặt Trăng"];
      const fetchedNotes: Record<string, ZodiacNote[]> = {};
      await Promise.all(allSigns.map(async (sign) => {
        fetchedNotes[sign] = await fetchNotes(sign);
      }));
      setNotes(fetchedNotes);
      setIsLoadingNotes(false);
    }
    loadNotes();
  }, []);
  const [focusedSignMode, setFocusedSignMode] = useState<string | null>(null);
  
  useEffect(() => {
    audioEngine.setSign(focusedSignMode);
  }, [focusedSignMode]);

  const toggleAudio = () => {
    if (isAudioEnabled) {
      audioEngine.stop();
      setIsAudioEnabled(false);
    } else {
      audioEngine.start();
      setIsAudioEnabled(true);
    }
  };

  const controlsRef = useRef<any>(null);

  const baseTime = useMemo(() => new Date(), []);
  const computedTime = useMemo(() => {
    return new Date(baseTime.getTime() + timeOffsetDays * 86400000 + timeOffsetHours * 3600000);
  }, [baseTime, timeOffsetDays, timeOffsetHours]);

  const handleResetTime = () => {
    setTimeOffsetDays(0);
    setTimeOffsetHours(0);
    setIsEarthFocused(false);
    setFocusedSignMode(null);
    
    // Auto-navigate camera to see Sun and Moon (and Earth)
    if (controlsRef.current) {
      const now = new Date();
      const J2000 = 946728000000;
      const d = (now.getTime() - J2000) / 86400000;

      const g = (357.529 + 0.98560028 * d) % 360;
      const q = (280.459 + 0.98564736 * d) % 360;
      const L = (q + 1.915 * Math.sin(g * Math.PI/180) + 0.020 * Math.sin(2 * g * Math.PI/180)) % 360;
      const earthAngle = (L * Math.PI/180) + Math.PI;

      const EARTH_ORBIT_RADIUS = 12;
      const MOON_ORBIT_RADIUS = 2.5;

      const earthX = Math.cos(earthAngle) * EARTH_ORBIT_RADIUS;
      const earthZ = Math.sin(earthAngle) * EARTH_ORBIT_RADIUS;
      
      const moonGeoLong = (218.316 + 13.176396 * d) % 360;
      const moonAngle = moonGeoLong * Math.PI / 180;
      
      const moonX = earthX + Math.cos(moonAngle) * MOON_ORBIT_RADIUS;
      const moonZ = earthZ + Math.sin(moonAngle) * MOON_ORBIT_RADIUS;

      // Position camera slightly further away from Earth, looking towards the Sun and Moon
      // We can look at the center between Sun and Earth to see both
      const targetX = earthX * 0.5;
      const targetZ = earthZ * 0.5;

      // Camera position behind Earth/Moon
      const camX = earthX * 1.8;
      const camY = 15;
      const camZ = earthZ * 1.8;

      controlsRef.current.setLookAt(camX, camY, camZ, 0, 0, 0, true);
    }
  };

  const handleSignSelect = (sign: string | null) => {
    if (sign) {
      setProphecyTarget(sign);
    } else {
      setProphecyTarget(null);
      if (controlsRef.current && (isEarthFocused || focusedSignMode || document.querySelector('.mythology-popup'))) {
         const goalPos = new THREE.Vector3(0, 15, 30);
         const goalTarget = new THREE.Vector3(0, 0, 0);
         animateCameraBezier(controlsRef.current, goalPos, goalTarget, 2.5);
      }
    }
    setSelectedSignName(sign);
    setSelectedInfo(sign ? ZODIAC_DATA[sign] || null : null);
    setIsEarthFocused(false);
    setFocusedSignMode(null);
    
    if (sign && controlsRef.current) {
        // Move camera to prophecy orb automatically
        controlsRef.current.setLookAt(0, 0, 5, 0, 0, -5, false);
    }
  };

  const handleProphecyClose = () => {
    setProphecyTarget(null);
    setSelectedInfo(null);
    setSelectedSignName(null);
    setIsEarthFocused(false);
    setFocusedSignMode(null);
    if (controlsRef.current) {
         const goalPos = new THREE.Vector3(0, 45, 80);
         const goalTarget = new THREE.Vector3(0, 0, 0);
         animateCameraBezier(controlsRef.current, goalPos, goalTarget, 2.5);
    }
  };

  const handleTermSelect = (term: any) => {
    setSelectedSolarTerm(term);
  };

  const handleSignDoubleClick = (sign: string, position: THREE.Vector3) => {
    setFocusedSignMode(sign);
    setSelectedSignName(null);
    setSelectedInfo(null);
    setIsEarthFocused(false);
    if (controlsRef.current) {
      // Basic camera and target positions
      const camPos = new THREE.Vector3(position.x * 0.7, position.y + 4, position.z * 0.7);
      const targetPos = new THREE.Vector3(position.x, position.y * 0.5, position.z);
      
      // Calculate right vector to offset the view
      const dir = new THREE.Vector3().subVectors(targetPos, camPos).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();
      
      // Move camera and target slightly to the right, pushing the object to the left
      const offsetAmount = 5;
      camPos.addScaledVector(right, offsetAmount);
      targetPos.addScaledVector(right, offsetAmount);

      // Zoom camera closely to the Zodiac Sign center
      controlsRef.current.setLookAt(
        camPos.x, camPos.y, camPos.z,
        targetPos.x, targetPos.y, targetPos.z,
        true // Animate
      );
    }
  };

  const handleEarthClick = (position: THREE.Vector3) => {
    setIsEarthFocused(true);
    setFocusedSignMode(null);
    setProphecyTarget('Trái Đất');
    if (controlsRef.current) {
        controlsRef.current.setLookAt(0, 0, 5, 0, 0, -5, false);
    }
  };

  const handleCloseSelect = () => {
    setSelectedInfo(null);
    setSelectedSignName(null);
    setProphecyTarget(null);
    if (isEarthFocused || focusedSignMode) {
      setIsEarthFocused(false);
      setFocusedSignMode(null);
      if (controlsRef.current) {
        const goalPos = new THREE.Vector3(0, 15, 30);
        const goalTarget = new THREE.Vector3(0, 0, 0);
        animateCameraBezier(controlsRef.current, goalPos, goalTarget, 2.5);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#050510] overflow-hidden relative font-sans text-white">
      <div style={{ display: showPersonalChart ? 'none' : 'block' }} className="w-full h-full absolute inset-0">
        {/* 3D Scene */}
        <Canvas onPointerMissed={handleCloseSelect} camera={{ position: [0, 15, 30], fov: 45 }}>
          <color attach="background" args={['#000000']} />
          {showStars && <StarryBackground radius={150} />}
          <Suspense fallback={null}>
            {prophecyTarget ? (
              <ProphecyOrb 
                target={prophecyTarget} 
                onClose={handleProphecyClose}
                notes={notes[prophecyTarget] || []}
                isLoading={isLoadingNotes}
                onProphesy={async (note) => {
                  const newNote = { ...note, id: Math.random().toString(36).substring(2, 9), sign: prophecyTarget, isSyncing: true };
                  setNotes(prev => ({
                    ...prev,
                    [prophecyTarget]: [...(prev[prophecyTarget] || []), newNote]
                  }));
                  try {
                    await addNote(newNote as any);
                    await reloadNotesForSign(prophecyTarget);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            ) : (
              <>
                <SolarSystem 
                  timeNow={computedTime} 
                  onSignSelect={handleSignSelect} 
                  onEarthClick={handleEarthClick} 
                  isEarthFocused={isEarthFocused}
                  onSignDoubleClick={handleSignDoubleClick}
                  focusedSignMode={focusedSignMode}
                  notes={notes}
                  showGrid={showGrid}
                  onTermClick={handleTermSelect}
                  showConstellations={showConstellations}
                  showStars={showStars}
                />
                <CameraAnimator selectedSign={selectedSignName} controlsRef={controlsRef} />
              </>
            )}
          </Suspense>
          {/* Camera controls stay active to allow examining the orb */}
          <CameraControls 
            ref={controlsRef}
            makeDefault
            maxDistance={400} 
            minDistance={1.3} 
          />
          <Suspense fallback={null}>
            <EffectComposer>
              <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
            </EffectComposer>
          </Suspense>
        </Canvas>

        {/* Back Button for Earth & Zodiac Focus */}
        {(isEarthFocused || focusedSignMode) && (
          <button 
            onClick={handleCloseSelect}
            className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
          >
            Trở về Hệ Mặt Trời
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          title={isAudioEnabled ? "Tắt âm thanh tĩnh lặng không gian" : "Bật âm thanh không gian"}
          className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md p-3 rounded-full transition-colors border border-white/10"
        >
          {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="opacity-50" />}
        </button>

        {/* Zodiac Notes Overlay */}
        {focusedSignMode && (
          <ZodiacNotesOverlay 
            sign={focusedSignMode}
            onClose={() => setFocusedSignMode(null)}
            notes={notes[focusedSignMode] || []}
            isLoading={isLoadingNotes}
            onAddNote={async (note) => {
              const newNote = { ...note, id: Math.random().toString(36).substring(2, 9), sign: focusedSignMode, isSyncing: true };
              
              // Optimistic update
              setNotes(prev => ({
                ...prev,
                [focusedSignMode]: [...(prev[focusedSignMode] || []), newNote]
              }));

              // In a real application, you would sign the transaction built by buildAddNoteTx with a wallet extension
              // For demonstration and missing wallet, we simulate the backend call:
              try {
                await addNote(newNote);
                console.log("Memory successfully stored to Memwal on Sui!");
                await reloadNotesForSign(focusedSignMode);
              } catch (error) {
                console.error("Failed to write memory to Memwal", error);
              }
            }}
            onDeleteNote={(id) => {
              // Usually you can't delete directly from on-chain memory unless the contract supports it
              setNotes(prev => ({
                ...prev,
                [focusedSignMode]: (prev[focusedSignMode] || []).filter(n => n.id !== id)
              }));
            }}
          />
        )}

        {/* 2D UI Layer */}
        {!focusedSignMode && !prophecyTarget && (
          <UIOverlay 
            onSignSelect={handleSignSelect} 
            selectedSignData={selectedInfo} 
            selectedSignName={selectedSignName}
            timeOffsetDays={timeOffsetDays}
            onTimeOffsetChange={setTimeOffsetDays}
            timeOffsetHours={timeOffsetHours}
            onTimeOffsetHoursChange={setTimeOffsetHours}
            onResetTime={handleResetTime}
            computedTime={computedTime}
            onOpenPersonalChart={() => setShowPersonalChart(true)}
            onOpenArchive={() => setShowArchive(true)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showConstellations={showConstellations}
            onToggleConstellations={() => setShowConstellations(!showConstellations)}
            showStars={showStars}
            onToggleStars={() => setShowStars(!showStars)}
            userWallet={userWallet}
            isLoggingIn={isLoggingIn}
            onLogin={handleZkLoginGoogle}
            onLogout={handleLogout}
          />
        )}
        
        <GalaxyArchiveModal 
          isOpen={showArchive} 
          onClose={() => setShowArchive(false)}
          userWallet={userWallet}
          isLoggingIn={isLoggingIn}
          onLogin={handleZkLoginGoogle}
          onLogout={handleLogout}
          notesDict={notes}
          onRefreshNotes={reloadNotesForSign}
          onAddNote={async (note) => {
            setNotes(prev => ({
              ...prev,
              [note.sign]: [note, ...(prev[note.sign] || [])]
            }));
          }}
          onLikeNote={async (note) => {
            // Cập nhật state nội bộ
            setNotes(prev => {
              const namespaceNotes = prev[note.sign] || [];
              const updatedNotes = namespaceNotes.map(n => 
                n.id === note.id ? { ...n, likes: (n.likes || 0) + 1 } : n
              );
              return { ...prev, [note.sign]: updatedNotes };
            });
          }}
        />
      </div>

      {/* Personal Natal Chart */}
      <AnimatePresence>
        {showPersonalChart && (
          <PersonalNatalChart onClose={() => setShowPersonalChart(false)} />
        )}
      </AnimatePresence>

      {/* Solar Term Popup */}
      <SolarTermPopup
        isOpen={!!selectedSolarTerm}
        onClose={() => setSelectedSolarTerm(null)}
        termData={selectedSolarTerm}
      />
    </div>
  );
}

