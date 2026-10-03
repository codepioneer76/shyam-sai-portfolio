import * as THREE from 'three';
import type { ArsenalItem } from '@/data/arsenal';

/**
 * Every texture in this world is generated in the browser from a canvas.
 * No image downloads, no licensing surface, and the whole set costs ~1ms at startup.
 */

const cv = (w: number, h: number): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const cache = new Map<string, THREE.Texture>();
const memo = (key: string, make: () => THREE.Texture): THREE.Texture => {
  const hit = cache.get(key);
  if (hit) return hit;
  const t = make();
  cache.set(key, t);
  return t;
};

export const disposeTextures = (): void => {
  cache.forEach((t) => t.dispose());
  cache.clear();
};

/** Grain map used as a roughness/normal-ish break-up on large surfaces. */
export const roughnessTexture = (size = 512, repeat = 4): THREE.Texture =>
  memo(`rough:${size}:${repeat}`, () => {
    const c = cv(size, size);
    const x = c.getContext('2d')!;
    x.fillStyle = '#808080';
    x.fillRect(0, 0, size, size);
    for (let i = 0; i < 2600; i++) {
      const g = Math.floor(90 + Math.random() * 130);
      x.fillStyle = `rgb(${g},${g},${g})`;
      x.fillRect(Math.random() * size, Math.random() * size, Math.random() * 9 + 1, Math.random() * 9 + 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    return t;
  });

/** Stained concrete. Two noise octaves plus a blur pass for larger-scale variation. */
export const concreteTexture = (size = 512, repeat = 4): THREE.Texture =>
  memo(`concrete:${size}:${repeat}`, () => {
    const c = cv(size, size);
    const x = c.getContext('2d')!;
    const img = x.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const n = Math.random() * 0.6 + Math.random() * 0.4;
      const v = (n - 0.5) * 0.7 + 0.5;
      img.data[i * 4] = 15 * v * 2;
      img.data[i * 4 + 1] = 17 * v * 2;
      img.data[i * 4 + 2] = 21 * v * 2;
      img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    x.globalAlpha = 0.5;
    x.filter = 'blur(3px)';
    x.drawImage(c, 0, 0);
    x.filter = 'none';
    x.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Slot liner for the equipment case: the grid is drawn, not faked with meshes. */
export const caseLinerTexture = (): THREE.Texture =>
  memo('liner', () => {
    const c = cv(1024, 700);
    const x = c.getContext('2d')!;
    x.fillStyle = '#0A0C0F';
    x.fillRect(0, 0, 1024, 700);
    const g = x.createRadialGradient(512, 350, 60, 512, 350, 620);
    g.addColorStop(0, 'rgba(255,255,255,.06)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 1024, 700);
    x.strokeStyle = 'rgba(220,220,220,.11)';
    x.lineWidth = 2;
    const m = 26;
    const gw = (1024 - m * 2) / 6;
    const gh = (700 - m * 2) / 3;
    for (let i = 0; i <= 6; i++) {
      x.beginPath();
      x.moveTo(m + i * gw, m);
      x.lineTo(m + i * gw, 700 - m);
      x.stroke();
    }
    for (let j = 0; j <= 3; j++) {
      x.beginPath();
      x.moveTo(m, m + j * gh);
      x.lineTo(1024 - m, m + j * gh);
      x.stroke();
    }
    x.strokeStyle = 'rgba(53,224,161,.22)';
    x.lineWidth = 3;
    x.strokeRect(m - 6, m - 6, 1024 - (m - 6) * 2, 700 - (m - 6) * 2);
    x.globalAlpha = 0.4;
    x.fillStyle = '#8A9199';
    x.font = '600 15px ui-monospace, Menlo, monospace';
    x.fillText('FIELD KIT // S.SAI', m + 4, 700 - 8);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Item label plate. This is what makes the case read as an inventory rather than boxes. */
export const itemLabelTexture = (item: ArsenalItem): THREE.Texture =>
  memo(`label:${item.id}`, () => {
    const c = cv(256, item.span[0] === 2 ? 128 : 200);
    const x = c.getContext('2d')!;
    const W = c.width;
    const H = c.height;
    x.fillStyle = '#0B0E12';
    x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(255,255,255,.045)';
    x.lineWidth = 1;
    for (let i = 16; i < W; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
    for (let i = 16; i < H; i += 16) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }

    const accent = item.status === 'applied' ? '#35E0A1' : '#FFA95C';
    x.strokeStyle = accent;
    x.globalAlpha = 0.75;
    x.lineWidth = 3;
    ([[8, 8, 1, 1], [W - 8, 8, -1, 1], [8, H - 8, 1, -1], [W - 8, H - 8, -1, -1]] as const).forEach(
      ([px, py, sx, sy]) => {
        x.beginPath();
        x.moveTo(px, py + 18 * sy);
        x.lineTo(px, py);
        x.lineTo(px + 18 * sx, py);
        x.stroke();
      },
    );
    x.globalAlpha = 1;

    // Abstract mark per item kind — original glyphs, no borrowed iconography.
    x.strokeStyle = '#D8D4CC';
    x.lineWidth = 4;
    const cx = W / 2;
    const cy = H * 0.42;
    const r = Math.min(W, H) * 0.17;
    x.beginPath();
    if (item.kind === 'cartridge') {
      x.rect(cx - r, cy - r * 0.62, r * 2, r * 1.24);
      x.moveTo(cx - r * 0.4, cy - r * 0.62);
      x.lineTo(cx - r * 0.4, cy + r * 0.62);
    } else if (item.kind === 'module') {
      x.rect(cx - r, cy - r, r * 2, r * 2);
      x.moveTo(cx - r, cy);
      x.lineTo(cx + r, cy);
    } else if (item.kind === 'disk') {
      x.arc(cx, cy, r, 0, Math.PI * 2);
      x.moveTo(cx + r * 0.35, cy);
      x.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    } else {
      x.moveTo(cx - r * 0.5, cy - r);
      x.lineTo(cx + r * 0.5, cy - r);
      x.lineTo(cx + r * 0.5, cy + r);
      x.lineTo(cx - r * 0.5, cy + r);
      x.closePath();
      x.moveTo(cx - r * 0.5, cy + r * 0.15);
      x.lineTo(cx + r * 0.5, cy + r * 0.15);
    }
    x.stroke();

    x.fillStyle = '#ECE7DD';
    x.textAlign = 'center';
    x.font = `700 ${item.name.length > 13 ? 17 : 21}px ui-monospace, Menlo, monospace`;
    x.fillText(item.name, W / 2, H - 26);
    x.fillStyle = accent;
    x.font = '500 12px ui-monospace, Menlo, monospace';
    x.fillText(item.cat, W / 2, H - 9);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });

/** A screen face: label + scanlines. Used for terminals, dossiers, drawer fronts. */
export const panelTexture = (
  key: string,
  lines: string[],
  opts: { accent?: string; heading?: string; w?: number; h?: number } = {},
): THREE.Texture =>
  memo(`panel:${key}`, () => {
    const W = opts.w ?? 512;
    const H = opts.h ?? 320;
    const c = cv(W, H);
    const x = c.getContext('2d')!;
    const accent = opts.accent ?? '#35E0A1';
    x.fillStyle = '#070A0C';
    x.fillRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(53,224,161,.10)');
    g.addColorStop(1, 'rgba(53,224,161,.02)');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    if (opts.heading) {
      x.fillStyle = accent;
      x.font = '700 22px ui-monospace, Menlo, monospace';
      x.fillText(opts.heading, 22, 44);
      x.strokeStyle = 'rgba(53,224,161,.4)';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(22, 58);
      x.lineTo(W - 22, 58);
      x.stroke();
    }
    x.fillStyle = '#C9D6D0';
    x.font = '400 15px ui-monospace, Menlo, monospace';
    lines.forEach((l, i) => x.fillText(l, 22, (opts.heading ? 92 : 46) + i * 26));

    x.fillStyle = 'rgba(0,0,0,.28)';
    for (let y = 0; y < H; y += 3) x.fillRect(0, y, W, 1);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Dossier cover for the case files table. */
export const dossierTexture = (key: string, code: string, title: string, state: string): THREE.Texture =>
  memo(`dossier:${key}`, () => {
    const W = 512;
    const H = 700;
    const c = cv(W, H);
    const x = c.getContext('2d')!;
    x.fillStyle = '#C7BFAE';
    x.fillRect(0, 0, W, H);
    for (let i = 0; i < 5000; i++) {
      x.fillStyle = `rgba(90,80,64,${Math.random() * 0.05})`;
      x.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    x.fillStyle = '#8C3A2A';
    x.fillRect(0, 84, W, 6);
    x.fillStyle = '#1A1712';
    x.font = '800 46px ui-monospace, Menlo, monospace';
    x.fillText(title, 34, 68);
    x.font = '500 20px ui-monospace, Menlo, monospace';
    x.fillText(code, 34, 128);
    x.fillText(`STATUS // ${state}`, 34, 160);
    x.strokeStyle = 'rgba(26,23,18,.35)';
    x.lineWidth = 3;
    x.strokeRect(24, 24, W - 48, H - 48);
    x.save();
    x.translate(W / 2, H - 120);
    x.rotate(-0.12);
    x.strokeStyle = 'rgba(140,58,42,.55)';
    x.lineWidth = 5;
    x.strokeRect(-150, -46, 300, 92);
    x.fillStyle = 'rgba(140,58,42,.75)';
    x.font = '800 34px ui-monospace, Menlo, monospace';
    x.textAlign = 'center';
    x.fillText('CASE FILE', 0, 12);
    x.restore();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
