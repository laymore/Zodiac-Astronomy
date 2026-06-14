import { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line, Html, Trail } from '@react-three/drei';
import { ProphecyScroll } from './ProphecyScroll';

type Point = [number, number];

type ZodiacPattern = {
  stars: Point[];
  edges: [number, number][];
};

const CONSTELLATIONS: Record<string, ZodiacPattern> = {
  "Bạch Dương": { // Aries
    stars: [[-0.8, -0.2], [-0.2, 0.2], [0.2, -0.4], [0.8, -0.2]],
    edges: [[0, 1], [1, 2], [2, 3]]
  },
  "Kim Ngưu": { // Taurus
    stars: [[-0.8, 0.8], [-0.4, 0], [0, -0.5], [0.4, 0], [0.8, 0.8], [0.6, -0.8], [0.2, -0.6]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 6], [6, 5], [1, 3]]
  },
  "Song Tử": { // Gemini
    stars: [[-0.6, 0.8], [-0.4, -0.8], [0.6, 0.8], [0.4, -0.8], [-0.5, 0], [0.5, 0], [-0.2, 0.8], [0.2, 0.8], [-0.2, -0.8], [0.2, -0.8]],
    edges: [[0, 1], [2, 3], [4, 5], [0, 6], [2, 7], [6, 7], [1, 8], [3, 9], [8, 9]]
  },
  "Cự Giải": { // Cancer
    stars: [[0, 0.6], [-0.2, 0], [-0.6, -0.4], [0.4, -0.2], [0.8, 0.4]],
    edges: [[0, 1], [1, 2], [1, 3], [3, 4]]
  },
  "Sư Tử": { // Leo
    stars: [[-0.8, -0.2], [-0.5, 0.6], [0, 0.8], [0.2, 0.2], [0, -0.4], [0.6, -0.2], [0.8, 0.4], [0.4, 0]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [4, 5], [5, 6], [6, 7], [7, 4]]
  },
  "Xử Nữ": { // Virgo
    stars: [[-0.8, 0.8], [-0.4, 0.2], [0, 0.6], [0.4, 0.2], [0.8, 0.6], [0, -0.4], [-0.4, -0.8], [0.4, -0.8]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 5], [5, 6], [5, 7]]
  },
  "Thiên Bình": { // Libra
    stars: [[-0.6, -0.4], [0, -0.8], [0.6, -0.4], [0.4, 0.4], [-0.4, 0.4], [0, 0.8]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [4, 5], [3, 5]]
  },
  "Bọ Cạp": { // Scorpio
    stars: [[-0.8, 0.6], [-0.6, 0.2], [-0.2, 0], [0.2, -0.2], [0.6, -0.4], [0.8, 0.2], [0.6, 0.6], [0.9, 0.8], [1.1, 0.5]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]]
  },
  "Nhân Mã": { // Sagittarius
    stars: [[-0.6, 0.4], [-0.6, -0.4], [0.4, -0.4], [0.4, 0.4], [0, 0.8], [0.8, 0], [-0.8, 0]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [2, 5], [1, 6], [0, 2]]
  },
  "Ma Kết": { // Capricorn
    stars: [[-0.8, 0.8], [0, -0.8], [0.8, 0.6], [0.4, 0], [-0.4, 0]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
  },
  "Bảo Bình": { // Aquarius
    stars: [[-0.8, 0.6], [-0.4, 0.9], [0, 0.6], [0.4, 0.9], [0.8, 0.6], [-0.8, -0.3], [-0.4, 0], [0, -0.3], [0.4, 0], [0.8, -0.3]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [8, 9]]
  },
  "Song Ngư": { // Pisces
    stars: [[-0.8, 0.8], [-0.6, 0.6], [-1.0, 0.6], [0, -0.4], [0.8, 0.8], [0.6, 0.6], [1.0, 0.6]],
    edges: [[0, 1], [0, 2], [1, 2], [1, 3], [3, 5], [5, 4], [5, 6], [4, 6]]
  }
};

const SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải",
  "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp",
  "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"
];

const SIGN_COLORS: Record<string, string> = {
  "Bạch Dương": "#f97316", // Fire
  "Sư Tử": "#f97316",
  "Nhân Mã": "#f97316",
  "Kim Ngưu": "#10b981", // Earth
  "Xử Nữ": "#10b981",
  "Ma Kết": "#10b981",
  "Song Tử": "#38bdf8", // Air
  "Thiên Bình": "#38bdf8",
  "Bảo Bình": "#38bdf8",
  "Cự Giải": "#6366f1", // Water
  "Bọ Cạp": "#6366f1",
  "Song Ngư": "#6366f1"
};

function ConstellationGroup({ 
  signData, 
  hoveredSign, 
  setHoveredSign, 
  focusedSignMode, 
  notes, 
  onSignSelect, 
  onSignDoubleClick, 
  getEmoji 
}: any) {
  const { sign, starPositions, linePoints, center, labelPos } = signData;
  const isHovered = hoveredSign === sign;
  const isFocused = focusedSignMode === sign;
  const signNotes = notes && notes[sign] ? notes[sign] : [];
  
  const topNotes = useMemo(() => {
    return [...signNotes].sort((a: any, b: any) => {
      const likeA = a.likes || 0;
      const likeB = b.likes || 0;
      if (likeA !== likeB) return likeB - likeA;
      return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
    }).slice(0, 7);
  }, [signNotes]);

  const localGroupRef = useRef<THREE.Group>(null);
  
  // Subtle hover animation
  useFrame((state) => {
    if (localGroupRef.current) {
      const time = state.clock.getElapsedTime();
      // Add a slight floating / breathing effect
      localGroupRef.current.position.y = Math.sin(time * 1.5 + center.x) * 0.3;
      // You can add subtle rotation as well if preferred, but position works well for "hovering"
    }
  });

  return (
    <group 
      key={sign}
      ref={localGroupRef}
      onClick={(e) => {
        e.stopPropagation();
        if (onSignSelect) onSignSelect(sign);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onSignDoubleClick) onSignDoubleClick(sign, center);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredSign(sign);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHoveredSign(null);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Invisible large hit area for easier clicking */}
      <mesh position={center} visible={false}>
        <sphereGeometry args={[4, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      
      {/* Trail effect following the constellation as it rotates */}
      <Trail
        width={isHovered ? 4 : 2}
        color={isHovered ? "#ffffff" : SIGN_COLORS[sign]}
        length={150}
        decay={2}
        local={false}
        stride={0}
        interval={1}
        attenuation={(t) => t * t}
      >
        <mesh position={center} visible={false}>
          <sphereGeometry args={[0.01]} />
          <meshBasicMaterial />
        </mesh>
      </Trail>
      
      <Line
        points={linePoints}
        segments={true}
        color={isHovered ? "#ffffff" : SIGN_COLORS[sign]}
        lineWidth={isHovered ? 2 : 1.5}
        transparent
        opacity={isHovered ? 0.9 : 0.6}
      />
      
      {starPositions.map((p: any, i: number) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[isHovered ? 0.15 : 0.1, 8, 8]} />
            <meshBasicMaterial color={isHovered ? "#ffffff" : SIGN_COLORS[sign]} transparent opacity={isHovered ? 1 : 0.9} />
          </mesh>
          <mesh>
            <sphereGeometry args={[isHovered ? 0.3 : 0.2, 8, 8]} />
            <meshBasicMaterial color={isHovered ? "#ffffff" : SIGN_COLORS[sign]} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
      
      <Html position={labelPos} center className="pointer-events-none">
        <div 
          className={`text-xs md:text-sm font-bold tracking-widest uppercase whitespace-nowrap transition-colors duration-300 ${
            isHovered ? 'text-white' : ''
          }`}
          style={{
            color: isHovered ? 'white' : SIGN_COLORS[sign],
            textShadow: isHovered 
              ? '0 0 12px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.6)' 
              : `0 0 8px ${SIGN_COLORS[sign]}cc, 0 0 15px ${SIGN_COLORS[sign]}88`
          }}
        >
          {sign}
        </div>
      </Html>
      
      {/* Display notes via Html floating near constellation */}
      {topNotes.map((note: any, idx: number) => {
         return (
           <ProphecyScroll 
             key={note.id} 
             note={note} 
             rank={idx + 1} 
             position={[center.x, center.y + 4 + (idx * 1.5), center.z]} 
           />
         );
      })}

      {/* When focused, render extra 3D stuff */}
      {isFocused && (
        <Html position={[center.x, center.y + 12, center.z]} center className="pointer-events-none">
           <div className="flex flex-col items-center animate-pulse">
             <span 
               className="text-[120px]"
               style={{ filter: `drop-shadow(0 0 20px ${SIGN_COLORS[sign]})` }}
             >
               {getEmoji(sign)}
             </span>
           </div>
        </Html>
      )}
    </group>
  );
}

export function ZodiacConstellations({ radius = 25, onSignSelect, onSignDoubleClick, focusedSignMode, notes }: { radius?: number, onSignSelect?: (sign: string | null) => void, onSignDoubleClick?: (sign: string, pos: THREE.Vector3) => void, focusedSignMode?: string | null, notes?: Record<string, any[]> }) {
  const [hoveredSign, setHoveredSign] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Artificial rotation removed to align with true astronomical positions (real data)
  });

  const constellationData = useMemo(() => {
    return SIGNS.map((sign, index) => {
      const angleOffset = ((index * 30) + 15 + 180) * (Math.PI / 180);
      const pattern = CONSTELLATIONS[sign] || { stars: [[0, 0], [1, 1]], edges: [[0, 1]] };
      
      const starPositions = pattern.stars.map(([x, y]) => {
        // x controls angle offset along the circle, y controls height
        const angle = angleOffset + (x * 0.12);
        const height = y * 3.5; // vertical scale
        
        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;
        return new THREE.Vector3(px, height, pz);
      });
      
      const linePoints: THREE.Vector3[] = [];
      pattern.edges.forEach(([startIdx, endIdx]) => {
        if (starPositions[startIdx] && starPositions[endIdx]) {
          linePoints.push(starPositions[startIdx].clone(), starPositions[endIdx].clone());
        }
      });
      
      // Calculate center point for the hit area
      const center = new THREE.Vector3();
      let highestY = -Infinity;
      starPositions.forEach(p => {
        center.add(p);
        if (p.y > highestY) highestY = p.y;
      });
      center.divideScalar(starPositions.length);
      
      const labelPos = center.clone();
      labelPos.y = highestY + 2; 

      return { sign, starPositions, linePoints, center, labelPos };
    });
  }, [radius]);

  // Custom emoji representing the sign
  const getEmoji = (s: string) => {
    const mapping: Record<string, string> = {
      "Bạch Dương": "♈",
      "Kim Ngưu": "♉",
      "Song Tử": "♊",
      "Cự Giải": "♋",
      "Sư Tử": "♌",
      "Xử Nữ": "♍",
      "Thiên Bình": "♎",
      "Bọ Cạp": "♏",
      "Nhân Mã": "♐",
      "Ma Kết": "♑",
      "Bảo Bình": "♒",
      "Song Ngư": "♓"
    };
    return mapping[s] || "⭐";
  };

  return (
    <group ref={groupRef}>
      {constellationData.map((signData) => (
        <ConstellationGroup 
          key={signData.sign} 
          signData={signData} 
          hoveredSign={hoveredSign}
          setHoveredSign={setHoveredSign}
          focusedSignMode={focusedSignMode}
          notes={notes}
          onSignSelect={onSignSelect}
          onSignDoubleClick={onSignDoubleClick}
          getEmoji={getEmoji}
        />
      ))}
    </group>
  );
}
