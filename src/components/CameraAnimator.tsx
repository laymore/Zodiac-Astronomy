import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { animateCameraBezier } from '../lib/cameraTransitions';

const SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải",
  "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp",
  "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"
];

interface CameraAnimatorProps {
  selectedSign: string | null;
  controlsRef: any;
}

export function CameraAnimator({ selectedSign, controlsRef }: CameraAnimatorProps) {
  const { clock } = useThree();
  const prevSign = useRef<string | null>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;

    if (selectedSign && selectedSign !== prevSign.current) {
      const signIndex = SIGNS.indexOf(selectedSign);
      if (signIndex !== -1) {
        const radius = 25;
        // Remove artificial currentRotation
        const currentRotation = 0;
        const baseAngle = (signIndex / 12) * Math.PI * 2;
        const currentAngle = baseAngle + currentRotation;
        
        const goalTargetX = Math.cos(currentAngle) * radius;
        const goalTargetY = 0;
        const goalTargetZ = Math.sin(currentAngle) * radius;
        const goalTarget = new THREE.Vector3(goalTargetX, goalTargetY, goalTargetZ);

        const viewDist = 40; // zoomed out slightly more so it's not too tight
        const goalPosX = Math.cos(currentAngle) * (radius + viewDist);
        const goalPosY = 20;
        const goalPosZ = Math.sin(currentAngle) * (radius + viewDist);
        const goalPos = new THREE.Vector3(goalPosX, goalPosY, goalPosZ);

        animateCameraBezier(controls, goalPos, goalTarget, 2.0);
      }
    } else if (!selectedSign && prevSign.current) {
      const goalPos = new THREE.Vector3(0, 60, 100);
      const goalTarget = new THREE.Vector3(0, 0, 0);
      animateCameraBezier(controls, goalPos, goalTarget, 2.5);
    }

    prevSign.current = selectedSign;
  }, [selectedSign, controlsRef, clock]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    
    if (!selectedSign) {
      controlsRef.current.azimuthAngle -= 0.1 * delta;
    }
  });

  return null;
}
