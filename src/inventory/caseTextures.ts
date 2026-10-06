import * as THREE from 'three';
import type { ArsenalItem } from '@/data/arsenal';

/**
 * Procedural surfaces for the travelling case.
 *
 * Drawn to canvas at startup rather than shipped as images: nothing to download,
 * nothing to license, and resolution scales with the device. Every texture made
 * here is returned to the caller, which owns its disposal.
 */

const canvas = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  if (!x) throw new Error('2D canvas unavailable');
  return [c, x];
};

/** Deterministic noise so the leather looks the same on every visit. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface LeatherSet {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
}

/**
 * Oxblood-brown leather: mottled dye, pebble grain in the bump channel, and
 * scuffs that lighten the colour and raise the roughness where hands have worn it.
 */
export function leather(size: number): LeatherSet {
  const r = rng(71);
  const [c, x] = canvas(size, size);
  const [b, bx] = canvas(size, size);
  const [g, gx] = canvas(size, size);

  // dye: warm oxblood with uneven absorption
  x.fillStyle = '#3a1812';
  x.fillRect(0, 0, size, size);
  for (let i = 0; i < 160; i++) {
    const rad = size * (0.03 + r() * 0.1);
    const cx = r() * size;
    const cy = r() * size;
    const grd = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    const light = r() > 0.5;
    grd.addColorStop(0, light ? 'rgba(92,40,28,0.22)' : 'rgba(18,7,5,0.24)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = grd;
    x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }

  // pebble grain → bump
  bx.fillStyle = '#808080';
  bx.fillRect(0, 0, size, size);
  const cells = Math.floor(size * 9);
  for (let i = 0; i < cells; i++) {
    const v = Math.floor(90 + r() * 90);
    bx.fillStyle = `rgb(${v},${v},${v})`;
    const s = 1 + r() * (size / 180);
    bx.beginPath();
    bx.arc(r() * size, r() * size, s, 0, Math.PI * 2);
    bx.fill();
  }

  // roughness: mostly matte, glossier where polished by handling
  gx.fillStyle = '#c4c4c4';
  gx.fillRect(0, 0, size, size);

  // scuffs and scratches: lighter in colour, smoother in roughness
  for (let i = 0; i < 140; i++) {
    const sx = r() * size;
    const sy = r() * size;
    const len = size * (0.01 + r() * 0.06);
    const ang = r() * Math.PI;
    x.strokeStyle = `rgba(140,82,58,${0.08 + r() * 0.14})`;
    x.lineWidth = 0.5 + r() * 1.4;
    x.beginPath();
    x.moveTo(sx, sy);
    x.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    x.stroke();
    gx.strokeStyle = 'rgba(90,90,90,0.5)';
    gx.lineWidth = x.lineWidth;
    gx.beginPath();
    gx.moveTo(sx, sy);
    gx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    gx.stroke();
  }

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(b);
  const rough = new THREE.CanvasTexture(g);
  [map, bump, rough].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
  });
  return { map, bump, rough };
}

/** Crushed velvet: a nap that catches light in soft irregular patches. */
export function velvet(size: number): THREE.CanvasTexture {
  const r = rng(19);
  const [c, x] = canvas(size, size);
  x.fillStyle = '#4a0d16';
  x.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const rad = size * (0.05 + r() * 0.2);
    const cx = r() * size;
    const cy = r() * size;
    const grd = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grd.addColorStop(0, r() > 0.5 ? 'rgba(120,28,42,0.3)' : 'rgba(22,3,6,0.35)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = grd;
    x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const STATE_INK: Record<ArsenalItem['state'], string> = {
  PRIMARY: '#7a5418',
  USED: '#2a1c10',
  'BUILDING WITH': '#5a1720',
  'CURRENT FOCUS': '#8B1E2D',
  STUDYING: '#6a4b28',
  EXPLORING: '#6a4b28',
};

/**
 * The label on top of each object: an ink-on-paper plate, set in a serif,
 * sized so it reads at the camera's resting distance.
 */
export function objectLabel(item: ArsenalItem, w: number, h: number): THREE.CanvasTexture {
  const W = 512;
  const H = Math.max(160, Math.round((512 * h) / w));
  const [c, x] = canvas(W, H);

  // aged paper
  const grd = x.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#e7d6b4');
  grd.addColorStop(1, '#c9b389');
  x.fillStyle = grd;
  x.fillRect(0, 0, W, H);
  const r = rng(item.id.length * 131 + item.name.length);
  for (let i = 0; i < 260; i++) {
    x.fillStyle = `rgba(110,80,40,${r() * 0.08})`;
    x.fillRect(r() * W, r() * H, 2, 2);
  }
  x.strokeStyle = 'rgba(90,60,28,0.45)';
  x.lineWidth = 3;
  x.strokeRect(14, 14, W - 28, H - 28);

  // name — large, and broken onto two lines at a word boundary rather than
  // shrunk until a long name ('AGENT ORCHESTRATION') becomes unreadable
  x.fillStyle = '#2a1c10';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const face = (size: number): string => `600 ${size}px Didot, "Bodoni MT", Georgia, serif`;
  const maxW = W - 64;
  const words = item.name.split(' ');
  let lines = [item.name];
  let fs = Math.min(item.state === 'PRIMARY' ? 104 : 92, H * 0.26);
  x.font = face(fs);
  if (x.measureText(item.name).width > maxW && words.length > 1) {
    // choose the split that balances the two lines best
    let best = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = x.measureText(words.slice(0, i).join(' ')).width;
      const b = x.measureText(words.slice(i).join(' ')).width;
      if (Math.abs(a - b) < bestDiff) {
        bestDiff = Math.abs(a - b);
        best = i;
      }
    }
    lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
    fs = Math.min(fs, H * 0.2);
  }
  x.font = face(fs);
  while (lines.some((l) => x.measureText(l).width > maxW) && fs > 28) {
    fs -= 2;
    x.font = face(fs);
  }
  const lineH = fs * 1.08;
  const top = H * 0.44 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => x.fillText(l, W / 2, top + i * lineH));

  // state, in small caps, in the ink appropriate to it
  x.fillStyle = STATE_INK[item.state];
  x.font = `600 ${Math.max(24, Math.min(34, fs * 0.36))}px Georgia, serif`;
  x.fillText((item.state === 'PRIMARY' ? 'PRIMARY LANGUAGE' : item.state).split('').join(' '), W / 2, H * 0.8);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Engraved plate inside the lid. */
export function nameplate(): THREE.CanvasTexture {
  const [c, x] = canvas(512, 128);
  const g = x.createLinearGradient(0, 0, 512, 128);
  g.addColorStop(0, '#6a5228');
  g.addColorStop(0.45, '#c9a45c');
  g.addColorStop(1, '#5a4520');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 128);
  x.strokeStyle = 'rgba(40,26,10,0.55)';
  x.lineWidth = 4;
  x.strokeRect(10, 10, 492, 108);
  x.fillStyle = 'rgba(40,26,10,0.8)';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '600 40px Didot, "Bodoni MT", Georgia, serif';
  x.fillText('S · S · T', 256, 56);
  x.font = '500 16px Georgia, serif';
  x.fillText('SKILL SET — PERSONAL EFFECTS', 256, 96);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft contact shadow under the case — cheaper and softer than a second shadow map. */
export function contactShadow(): THREE.CanvasTexture {
  const [c, x] = canvas(256, 256);
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
