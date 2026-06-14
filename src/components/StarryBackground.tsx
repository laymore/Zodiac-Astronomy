import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { BRIGHT_STARS } from '../data/brightStars';

export function StarryBackground({ radius = 150 }: { radius?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create a large set of background stars
  const backgroundStars = useMemo(() => {
    const starCount = 4000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Uniform distribution on a sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Slight color variation (white to slight blue/orange)
        const colorType = Math.random();
        const c = new THREE.Color();
        if (colorType > 0.8) c.setHex(0xaabfff); // blueish
        else if (colorType > 0.6) c.setHex(0xffddaa); // reddish/orange
        else c.setHex(0xffffff); // white
        
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        
        sizes[i] = Math.random() * 2;
    }
    
    return { positions, colors, sizes };
  }, [radius]);
  
  useFrame(() => {
    if (groupRef.current) {
        // Very slow rotation just to keep the sky alive slightly
        groupRef.current.rotation.y += 0.00005;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={backgroundStars.positions} itemSize={3} count={backgroundStars.positions.length / 3} />
          <bufferAttribute attach="attributes-color" array={backgroundStars.colors} itemSize={3} count={backgroundStars.colors.length / 3} />
          <bufferAttribute attach="attributes-size" array={backgroundStars.sizes} itemSize={1} count={backgroundStars.sizes.length} />
        </bufferGeometry>
        <pointsMaterial size={0.5} vertexColors transparent opacity={0.6} sizeAttenuation={true} />
      </points>
      
      {/* Real Bright Stars Placements */}
      {BRIGHT_STARS.map((star, idx) => {
          // Convert RA/Dec to XYZ
          // RA is in hours (0-24), Dec is in degrees (-90 to +90)
          const raRad = (star.ra / 24) * Math.PI * 2;
          const decRad = (star.dec / 180) * Math.PI;
          
          // Spherical to Cartesian
          // Using standard convention but adjusted for our scene (Y-up)
          const phi = Math.PI / 2 - decRad;
          const theta = raRad;
          
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.cos(phi);
          const z = radius * Math.sin(phi) * Math.sin(theta);
          
          // Calculate brightness-based scale/opacity
          const brightness = Math.max(0.2, 1 - (star.mag + 1.5) / 3);
          const starScale = brightness * 1.5;
          
          return (
              <group key={idx} position={[x, y, z]}>
                 <mesh>
                     <sphereGeometry args={[starScale, 8, 8]} />
                     <meshBasicMaterial color="#ffffff" transparent opacity={0.8 + brightness * 0.2} />
                 </mesh>
                 <mesh>
                     <sphereGeometry args={[starScale * 2.5, 8, 8]} />
                     <meshBasicMaterial color="#ffffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
                 </mesh>
                 <Html center distanceFactor={radius} zIndexRange={[100, 0]} className="pointer-events-none">
                     <div className="text-[10px] text-white/50 whitespace-nowrap font-light tracking-widest uppercase">
                         {star.name}
                     </div>
                 </Html>
              </group>
          );
      })}
    </group>
  );
}
