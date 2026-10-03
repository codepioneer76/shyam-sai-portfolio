import * as THREE from 'three';

/**
 * Geometry for the case, built from extruded rounded rectangles.
 *
 * The shell is genuinely hollow — an outer outline with an inner hole, extruded
 * to wall height — so when the lid lifts you see wall thickness, an interior and
 * a floor, not a box with a texture painted on the top.
 */

export function roundedRect(w: number, d: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  const rr = Math.min(r, w / 2, d / 2);
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + d - rr);
  s.quadraticCurveTo(x + w, y + d, x + w - rr, y + d);
  s.lineTo(x + rr, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  return s;
}

function holePath(w: number, d: number, r: number): THREE.Path {
  const s = roundedRect(w, d, r);
  const p = new THREE.Path();
  p.curves = s.curves;
  return p;
}

/** Hollow wall ring, extruded upward (+Y) from y = 0 to y = height. */
export function shell(w: number, d: number, r: number, wall: number, height: number, segs: number): THREE.ExtrudeGeometry {
  const outer = roundedRect(w, d, r);
  outer.holes.push(holePath(w - wall * 2, d - wall * 2, Math.max(0.01, r - wall)));
  const g = new THREE.ExtrudeGeometry(outer, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: segs,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Solid rounded panel of the given thickness, lying flat from y = 0 upward. */
export function panel(w: number, d: number, r: number, thickness: number, segs: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
    curveSegments: segs,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

/** A small rounded block — brass corners, latch plates, mounts. Centred on the origin. */
export function roundedBlock(w: number, h: number, d: number, r: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - r * 2, h - r * 2, r * 0.6), {
    depth: Math.max(0.001, d - r * 2),
    bevelEnabled: true,
    bevelThickness: r,
    bevelSize: r,
    bevelSegments: 3,
    curveSegments: 6,
  });
  g.center();
  return g;
}

/** Stitching: a dashed line tracing a rounded outline at a given height. */
export function stitchLine(w: number, d: number, r: number, y: number, material: THREE.LineDashedMaterial): THREE.Line {
  const pts = roundedRect(w, d, r).getPoints(24);
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, y, -p.y)));
  const line = new THREE.Line(geo, material);
  line.computeLineDistances();
  return line;
}
