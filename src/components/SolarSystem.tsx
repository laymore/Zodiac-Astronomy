/// <reference types="@react-three/fiber" />
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Html, useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ZodiacConstellations } from './ZodiacConstellations';
import { CelestialGrid } from './CelestialGrid';
import { SOLAR_TERMS } from '../data/solarTerms';
import { StarryBackground } from './StarryBackground';

const earthAtmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    vPosition = position;
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthAtmosphereFragmentShader = `
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  // 3D Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    float intensity = pow(0.6 - dot(vNormal, vPositionNormal), 3.0);
    
    vec3 lightDir = normalize(-vWorldPosition);
    float dayLight = dot(vWorldNormal, lightDir);
    float illuminated = smoothstep(-0.2, 0.2, dayLight);
    
    vec3 atmosColor = vec3(0.3, 0.6, 1.0) * intensity * (0.2 + illuminated * 0.8);
    
    // Aurora effect
    float poleDist = abs(normalize(vPosition).y);
    float auroraZone = smoothstep(0.85, 0.95, poleDist) * smoothstep(1.0, 0.95, poleDist);
    
    float n1 = snoise(vPosition * 4.0 + vec3(time * 0.2, 0.0, time * 0.1));
    float n2 = snoise(vPosition * 8.0 - vec3(time * 0.3, time * 0.1, 0.0));
    float noise = (n1 + n2 * 0.5) * 0.5 + 0.5;
    
    float auroraIntensity = auroraZone * noise * (1.0 - illuminated * 0.7) * 2.5; 
    
    vec3 auroraColor1 = vec3(0.0, 0.8, 0.4);
    vec3 auroraColor2 = vec3(0.3, 0.1, 0.8);
    vec3 auroraColor = mix(auroraColor1, auroraColor2, snoise(vPosition * 2.0 + time * 0.1) * 0.5 + 0.5);
    
    vec3 finalColor = atmosColor + auroraColor * auroraIntensity;
    float alpha = (intensity * 0.8 + auroraIntensity) * 0.07; // Scaled down to 7%
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

function Earth({ meshRef, isEarthFocused, onClick }: { meshRef: React.RefObject<THREE.Group>, isEarthFocused: boolean, onClick: (e: any) => void }) {
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      // Wind blowing / cloud flying effect: faster when focused
      const cloudSpeed = isEarthFocused ? 0.2 : 0.05;
      cloudsRef.current.rotation.y += delta * cloudSpeed;
    }
    // Water flowing effect: animate normalMap offset slightly over time when focused
    if (isEarthFocused) {
      normalMap.offset.x += delta * 0.02;
    } else {
      normalMap.offset.x = 0;
    }
    
    if (atmosMaterialRef.current) {
      atmosMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={meshRef} onClick={onClick}>
      {/* Earth Surface */}
      <Sphere args={[1.2, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          specular={new THREE.Color("gray")}
          shininess={50}
        />
      </Sphere>

      {/* Earth Clouds */}
      <Sphere ref={cloudsRef} args={[1.22, 64, 64]}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={isEarthFocused ? 0.9 : 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </Sphere>
      
      {/* Earth Atmosphere & Auroras */}
      <Sphere args={[1.35, 64, 64]} visible={!isEarthFocused}>
        <shaderMaterial
          ref={atmosMaterialRef}
          vertexShader={earthAtmosphereVertexShader}
          fragmentShader={earthAtmosphereFragmentShader}
          uniforms={{
            time: { value: 0 }
          }}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </Sphere>
    </group>
  );
}

function Moon({ meshRef }: { meshRef: React.RefObject<THREE.Mesh> }) {
  const moonMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
  
  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]}>
      <meshPhongMaterial map={moonMap} shininess={5} />
    </Sphere>
  );
}

const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // 3D Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    float n1 = snoise(vPosition * 0.8 + time * 0.2);
    float n2 = snoise(vPosition * 2.0 - time * 0.4);
    float n3 = snoise(vPosition * 4.0 + time * 0.1);
    float noise = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
    
    noise = smoothstep(-0.5, 0.5, noise);
    
    vec3 colorDark = vec3(0.8, 0.1, 0.0);
    vec3 colorMid = vec3(1.0, 0.4, 0.0);
    vec3 colorLight = vec3(1.0, 0.9, 0.2);
    
    vec3 color = mix(colorDark, colorMid, smoothstep(0.0, 0.5, noise));
    color = mix(color, colorLight, smoothstep(0.5, 1.0, noise));
    
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float rim = 1.0 - max(dot(viewDir, normalize(vNormal)), 0.0);
    rim = smoothstep(0.6, 1.0, rim);
    color += vec3(1.0, 0.6, 0.2) * rim * 2.0;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const sunHaloVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunHaloFragmentShader = `
  varying vec2 vUv;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    float glow = smoothstep(0.5, 0.2, dist);
    float innerGlow = smoothstep(0.18, 0.25, dist);
    
    vec3 color = vec3(1.0, 0.4, 0.05);
    gl_FragColor = vec4(color, glow * innerGlow * 0.9);
  }
`;

function Sun({ meshRef }: { meshRef: React.RefObject<THREE.Mesh> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[3.5, 64, 64]} position={[0, 0, 0]}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={{
            time: { value: 0 }
          }}
        />
      </Sphere>
      <mesh ref={haloRef} position={[0, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <shaderMaterial
          vertexShader={sunHaloVertexShader}
          fragmentShader={sunHaloFragmentShader}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const EARTH_YEAR = 2 * Math.PI; // Full rotation
const TIME_SCALE = 1; // days per second in animation if we animate

function MoonPhaseIndicator({ timeNow, isEarthFocused }: { timeNow: Date, isEarthFocused?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useFrame(({ clock }) => {
    const speedMultiplier = isEarthFocused ? 0 : 1;
    const exactNow = timeNow.getTime() + clock.elapsedTime * 1000 * speedMultiplier; 
    
    // Number of days since J2000.0
    const J2000 = 946728000000;
    const d = (exactNow - J2000) / 86400000;

    // Mean anomaly of Sun
    const g = (357.529 + 0.98560028 * d) % 360;
    // Mean longitude of Sun
    const q = (280.459 + 0.98564736 * d) % 360;
    // Ecliptic longitude of Sun (L)
    const L = (q + 1.915 * Math.sin(g * Math.PI/180) + 0.020 * Math.sin(2 * g * Math.PI/180)) % 360;
    
    // Moon's geocentric ecliptic longitude
    const moonGeoLong = (218.316 + 13.176396 * d) % 360;
    
    // Phase angle
    let phaseAngle = (moonGeoLong - L) % 360;
    if (phaseAngle < 0) phaseAngle += 360;
    
    let phaseName = "";
    let phaseIcon = "";
    
    if (phaseAngle < 22.5 || phaseAngle >= 337.5) { phaseName = "New Moon"; phaseIcon = "🌑"; }
    else if (phaseAngle < 67.5) { phaseName = "Waxing Crescent"; phaseIcon = "🌒"; }
    else if (phaseAngle < 112.5) { phaseName = "First Quarter"; phaseIcon = "🌓"; }
    else if (phaseAngle < 157.5) { phaseName = "Waxing Gibbous"; phaseIcon = "🌔"; }
    else if (phaseAngle < 202.5) { phaseName = "Full Moon"; phaseIcon = "🌕"; }
    else if (phaseAngle < 247.5) { phaseName = "Waning Gibbous"; phaseIcon = "🌖"; }
    else if (phaseAngle < 292.5) { phaseName = "Last Quarter"; phaseIcon = "🌗"; }
    else if (phaseAngle < 337.5) { phaseName = "Waning Crescent"; phaseIcon = "🌘"; }

    if (containerRef.current) {
       containerRef.current.innerText = `${phaseIcon} ${phaseName}`;
    }
  });

  return (
    <Html position={[0, -0.6, 0]} center className="pointer-events-none">
      <div 
        ref={containerRef}
        className="text-[10px] md:text-xs text-white whitespace-nowrap font-medium px-2 py-1 bg-black/60 rounded-full border border-white/10"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        🌑 New Moon
      </div>
    </Html>
  );
}

function SunPathIndicator({ earthRef }: { earthRef: React.RefObject<THREE.Group> }) {
  const lineRef = useRef<THREE.Line>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current && lineRef.current && markerRef.current && glowRef.current) {
      const earthPos = earthRef.current.position;
      
      // Vector from Earth pointing through the Sun (0,0,0)
      const dir = new THREE.Vector3().copy(earthPos).negate().normalize();
      
      const startPoint = earthPos.clone();
      const endPoint = dir.clone().multiplyScalar(25); // Zodiac radius
      
      const positions = new Float32Array([
        startPoint.x, startPoint.y, startPoint.z,
        endPoint.x, endPoint.y, endPoint.z
      ]);
      
      const lineGeom = lineRef.current.geometry as THREE.BufferGeometry;
      lineGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      lineGeom.attributes.position.needsUpdate = true;
      if (lineRef.current.computeLineDistances) {
        lineRef.current.computeLineDistances();
      }
      
      markerRef.current.position.copy(endPoint);
      markerRef.current.lookAt(0, 0, 0);
      
      glowRef.current.position.copy(endPoint);
      glowRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group>
      <line {...({ ref: lineRef } as any)}>
        <bufferGeometry />
        {/* Draw a dashed line to indicate it's a projection line */}
        <lineDashedMaterial 
          color="#f59e0b" 
          transparent 
          opacity={0.4} 
          dashSize={0.5} 
          gapSize={0.5} 
          linewidth={2} 
        />
      </line>
      <mesh ref={markerRef}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glowRef}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function SolarSystem({ timeNow, onSignSelect, onEarthClick, isEarthFocused, onSignDoubleClick, focusedSignMode, notes, showGrid, onTermClick, showConstellations = true, showStars = true }: { timeNow: Date, onSignSelect?: (sign: string | null) => void, onEarthClick?: (pos: THREE.Vector3) => void, isEarthFocused?: boolean, onSignDoubleClick?: (sign: string, pos: THREE.Vector3) => void, focusedSignMode?: string | null, notes?: Record<string, any[]>, showGrid?: boolean, onTermClick?: (term: any) => void, showConstellations?: boolean, showStars?: boolean }) {
  const earthRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);

  const EARTH_ORBIT_RADIUS = 12;
  const MOON_ORBIT_RADIUS = 2.5;

  useFrame(({ clock }) => {
    // If earth is focused, stop time so camera tracking remains stable
    const speedMultiplier = isEarthFocused ? 0 : 1;
    const exactNow = timeNow.getTime() + clock.elapsedTime * 1000 * speedMultiplier; 
    
    // Number of days since J2000.0 (Jan 1, 2000 12:00:00 UTC)
    const J2000 = 946728000000;
    const d = (exactNow - J2000) / 86400000;

    // --- EARTH EXACT POSITION ---
    // Mean anomaly of Sun
    const g = (357.529 + 0.98560028 * d) % 360;
    // Mean longitude of Sun
    const q = (280.459 + 0.98564736 * d) % 360;
    // Ecliptic longitude of Sun (L)
    const L = (q + 1.915 * Math.sin(g * Math.PI/180) + 0.020 * Math.sin(2 * g * Math.PI/180)) % 360;
    
    // Earth's heliocentric longitude is opposite the Sun's geocentric longitude
    const earthAngle = (L * Math.PI/180) + Math.PI;
    
    // Earth axial rotation (roughly 360 deg per day, simplified)
    const earthRotation = -((d % 0.99726968) / 0.99726968) * Math.PI * 2;

    // --- MOON EXACT POSITION ---
    // Moon's geocentric ecliptic longitude
    const moonGeoLong = (218.316 + 13.176396 * d) % 360;
    const moonAngle = moonGeoLong * Math.PI / 180;

    if (earthRef.current) {
      earthRef.current.position.x = Math.cos(earthAngle) * EARTH_ORBIT_RADIUS;
      earthRef.current.position.z = Math.sin(earthAngle) * EARTH_ORBIT_RADIUS;
      earthRef.current.rotation.y = earthRotation;
      
      if (moonGroupRef.current) {
        moonGroupRef.current.position.copy(earthRef.current.position);
      }
    }
    
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(moonAngle) * MOON_ORBIT_RADIUS;
      moonRef.current.position.z = Math.sin(moonAngle) * MOON_ORBIT_RADIUS;
      moonRef.current.rotation.y = moonAngle; // Moon is tidally locked to Earth
    }

    if (sunRef.current) {
      // Sun rotation approx 27 Earth days
      sunRef.current.rotation.y = -((d % 27) / 27) * Math.PI * 2;
    }
  });

  return (
    <group>
      <ambientLight intensity={isEarthFocused ? 1.0 : 0.2} />
      <pointLight 
        position={isEarthFocused && earthRef.current ? [earthRef.current.position.x + 5, earthRef.current.position.y + 2, earthRef.current.position.z + 5] : [0, 0, 0]} 
        intensity={isEarthFocused ? 50 : 150} 
        color="#FDB813" 
        distance={0} 
        decay={2} 
        visible={true} 
      />
      
      {/* Sun */}
      {!isEarthFocused && <Sun meshRef={sunRef} />}

      {/* Earth Orbit Ring */}
      {!isEarthFocused && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[EARTH_ORBIT_RADIUS - 0.05, EARTH_ORBIT_RADIUS + 0.05, 128]} />
          <meshBasicMaterial color="#445566" opacity={0.3} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 24 Solar Terms on Earth Orbit */}
      {!isEarthFocused && SOLAR_TERMS.map((term, index) => {
        const angle = (term.angle + 180) * (Math.PI / 180);
        const x1 = Math.cos(angle) * (EARTH_ORBIT_RADIUS - 0.3);
        const z1 = Math.sin(angle) * (EARTH_ORBIT_RADIUS - 0.3);
        const x2 = Math.cos(angle) * (EARTH_ORBIT_RADIUS + 0.3);
        const z2 = Math.sin(angle) * (EARTH_ORBIT_RADIUS + 0.3);
        
        const labelX = Math.cos(angle) * (EARTH_ORBIT_RADIUS + 1.2);
        const labelZ = Math.sin(angle) * (EARTH_ORBIT_RADIUS + 1.2);

        // Convert line coordinates for the buffer geometry
        const lineGeom = new Float32Array([x1, 0, z1, x2, 0, z2]);

        return (
          <group key={term.name}>
            <line>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={lineGeom} itemSize={3} count={2} />
              </bufferGeometry>
              <lineBasicMaterial color="#ffffff" opacity={0.4} transparent />
            </line>
            <Html position={[labelX, 0, labelZ]} center>
              <div 
                onClick={(e) => { e.stopPropagation(); onTermClick?.(term); }}
                className="text-[10px] md:text-xs text-teal-200/90 whitespace-nowrap font-medium cursor-pointer hover:scale-125 hover:text-white hover:font-bold transition-all duration-200"
                style={{ textShadow: "0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(20, 184, 166, 0.5)" }}
              >
                {term.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Earth & Trail */}
      <Trail
        width={3}
        color="#60a5fa"
        length={40}
        decay={2}
        local={false}
        stride={0}
        interval={1}
        attenuation={(t) => t * t}
      >
        <group ref={earthRef} position={earthRef.current?.position}>
          <Earth 
            meshRef={useRef(null)} 
            isEarthFocused={isEarthFocused || false} 
            onClick={(e) => {
              e.stopPropagation();
              if (onEarthClick && earthRef.current) {
                onEarthClick(earthRef.current.position);
              }
            }} 
          />
        </group>
      </Trail>

      {/* Moon System */}
      {!isEarthFocused && (
        <group ref={moonGroupRef}>
          {/* Moon Orbit Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[MOON_ORBIT_RADIUS - 0.02, MOON_ORBIT_RADIUS + 0.02, 64]} />
            <meshBasicMaterial color="#ffffff" opacity={0.15} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Moon & Trail */}
          <Trail
            width={1}
            color="#d1d5db"
            length={25}
            decay={1.5}
            local={false}
            stride={0}
            interval={1}
            attenuation={(t) => t * t}
          >
            <group 
              ref={moonRef}
              onClick={(e) => {
                e.stopPropagation();
                if (onSignSelect) onSignSelect('Mặt Trăng');
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer' }}
              onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
              <Moon meshRef={{ current: null }} />
              <MoonPhaseIndicator timeNow={timeNow} isEarthFocused={isEarthFocused} />
            </group>
          </Trail>
        </group>
      )}
      
      {/* Astrological Zodiac Belt (Visual Representation) */}
      {!isEarthFocused && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[24.5, 25.5, 128]} />
          <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* 3D Zodiac Wireframes */}
      {!isEarthFocused && showConstellations !== false && <ZodiacConstellations radius={25} onSignSelect={onSignSelect} onSignDoubleClick={onSignDoubleClick} focusedSignMode={focusedSignMode} notes={notes} />}

      {/* Sun Path Indicator */}
      {!isEarthFocused && <SunPathIndicator earthRef={earthRef} />}

      {/* Celestial Grid (Equatorial Coordinates) */}
      {!isEarthFocused && showGrid && <CelestialGrid radius={40} />}
    </group>
  );
}
