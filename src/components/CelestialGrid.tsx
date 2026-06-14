import { useMemo } from 'react';
import * as THREE from 'three';

export function CelestialGrid({ radius = 40 }: { radius?: number }) {
  const { ras, decs, eqGeom, eclGeom } = useMemo(() => {
    const ras = [];
    const decs = [];
    
    // RA lines (meridians)
    // 24 hours => 24 lines 
    for (let i = 0; i < 24; i++) {
        const phi = (i / 24) * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= 64; j++) {
            const theta = (j / 64) * Math.PI - Math.PI / 2; // from -PI/2 to PI/2
            points.push(new THREE.Vector3(
                radius * Math.cos(theta) * Math.cos(phi),
                radius * Math.sin(theta),
                -radius * Math.cos(theta) * Math.sin(phi) // depends on coordinate mapping
            ));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        ras.push(geom);
    }
    
    // Dec lines (parallels)
    // -80 to +80 in steps of 10
    for (let lat = -80; lat <= 80; lat += 10) {
        if (lat === 0) continue; // handle equator specially if desired
        const theta = (lat / 180) * Math.PI;
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const phi = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(
                radius * Math.cos(theta) * Math.cos(phi),
                radius * Math.sin(theta),
                -radius * Math.cos(theta) * Math.sin(phi)
            ));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        decs.push(geom);
    }
    
    // Equator 
    const eqPoints = [];
    for (let i = 0; i <= 128; i++) {
        const phi = (i / 128) * Math.PI * 2;
        eqPoints.push(new THREE.Vector3(
            radius * Math.cos(phi),
            0,
            -radius * Math.sin(phi)
        ));
    }
    const eqGeom = new THREE.BufferGeometry().setFromPoints(eqPoints);
    
    // Ecliptic
    const eclPoints = [];
    const epsilon = 23.4392911 * Math.PI / 180;
    for (let i = 0; i <= 128; i++) {
        const phi = (i / 128) * Math.PI * 2;
        const v = new THREE.Vector3(
            radius * Math.cos(phi),
            0,
            -radius * Math.sin(phi)
        );
        v.applyAxisAngle(new THREE.Vector3(1, 0, 0), epsilon); // tilt
        eclPoints.push(v);
    }
    const eclGeom = new THREE.BufferGeometry().setFromPoints(eclPoints);

    return {ras, decs, eqGeom, eclGeom};
  }, [radius]);
  
  return (
    <group>
        {ras.map((geom, i) => (
            <line key={`ra-${i}`} {...({ geometry: geom } as any)}>
                <lineBasicMaterial color="#334455" transparent opacity={0.3} />
            </line>
        ))}
        {decs.map((geom, i) => (
            <line key={`dec-${i}`} {...({ geometry: geom } as any)}>
                <lineBasicMaterial color="#334455" transparent opacity={0.3} />
            </line>
        ))}
        {/* Equator */}
        <line {...({ geometry: eqGeom } as any)}>
             <lineBasicMaterial color="#6688aa" transparent opacity={0.6} linewidth={2} />
        </line>
        {/* Ecliptic */}
        <line {...({ geometry: eclGeom } as any)}>
             <lineBasicMaterial color="#aa8866" transparent opacity={0.8} linewidth={2} />
        </line>
    </group>
  );
}
