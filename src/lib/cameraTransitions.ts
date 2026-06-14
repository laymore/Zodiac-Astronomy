import * as THREE from 'three';
import gsap from 'gsap';

export function animateCameraBezier(
  controls: any,
  goalPos: THREE.Vector3,
  goalTarget: THREE.Vector3,
  duration: number = 2.5
) {
  if (!controls) return;

  const startPos = new THREE.Vector3();
  controls.getPosition(startPos);

  const startTarget = new THREE.Vector3();
  controls.getTarget(startTarget);

  // If already very close, just do a normal lookAt to fix precision issues
  if (startPos.distanceTo(goalPos) < 0.1 && startTarget.distanceTo(goalTarget) < 0.1) {
    controls.setLookAt(goalPos.x, goalPos.y, goalPos.z, goalTarget.x, goalTarget.y, goalTarget.z, true);
    return;
  }

  // Determine a control point for the Bezier curve of the position.
  // Pushing it up and outwards a bit to create a cinematic arc effect.
  const vec = new THREE.Vector3().subVectors(goalPos, startPos);
  const dist = vec.length();
  
  // Midpoint
  const midPos = new THREE.Vector3().addVectors(startPos, goalPos).multiplyScalar(0.5);
  // Add some height to the arc depending on distance
  midPos.y += dist * 0.3 + 10;
  
  // Outward push from center (0,0) to create a sweeping horizontal curve
  const outward = new THREE.Vector3(midPos.x, 0, midPos.z).normalize().multiplyScalar(dist * 0.2);
  midPos.add(outward);

  const posCurve = new THREE.QuadraticBezierCurve3(startPos, midPos, goalPos);
  
  // For target, we can just do a linear interpolation or a slight bezier. Linear is usually fine.
  const targetCurve = new THREE.LineCurve3(startTarget, goalTarget);

  const obj = { t: 0 };
  gsap.to(obj, {
    t: 1,
    duration: duration,
    ease: "power2.inOut",
    onUpdate: () => {
      const p = posCurve.getPoint(obj.t);
      const t = targetCurve.getPoint(obj.t);
      controls.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, false);
    }
  });
}
