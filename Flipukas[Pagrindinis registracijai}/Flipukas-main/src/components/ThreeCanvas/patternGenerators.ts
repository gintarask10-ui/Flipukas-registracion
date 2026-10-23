import * as THREE from 'three';
import { CustomPatternConfig } from '../../types/clothing';

/**
 * Creates high-resolution procedural tileable pattern textures
 */
export function createPatternCanvasTexture(
  config: CustomPatternConfig,
  baseColor: string
): THREE.CanvasTexture | null {
  if (config.type === 'none') return null;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = config.primaryColor || baseColor;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  if (config.rotation !== 0) {
    ctx.translate(size / 2, size / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
  }

  ctx.fillStyle = config.secondaryColor;
  ctx.strokeStyle = config.secondaryColor;
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, config.opacity));

  const repeatStep = Math.max(16, Math.floor(size / (config.scale * 4)));

  if (config.type === 'houndstooth') {
    // Authentic Houndstooth (Žąsies kojelė)
    const step = repeatStep * 1.5;
    for (let y = 0; y < size + step; y += step) {
      for (let x = 0; x < size + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + step * 0.5, y);
        ctx.lineTo(x + step * 0.5, y + step * 0.25);
        ctx.lineTo(x + step * 0.75, y + step * 0.25);
        ctx.lineTo(x + step * 0.75, y + step * 0.75);
        ctx.lineTo(x + step * 0.25, y + step * 0.75);
        ctx.lineTo(x + step * 0.25, y + step * 0.5);
        ctx.lineTo(x, y + step * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillRect(x + step * 0.5, y + step * 0.5, step * 0.25, step * 0.25);
      }
    }
  } else if (config.type === 'cybergrid') {
    // Technical Cyber Grid with crosshair junctions
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= size; x += repeatStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += repeatStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    // Intersection dots
    for (let x = 0; x <= size; x += repeatStep) {
      for (let y = 0; y <= size; y += repeatStep) {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }
  } else if (config.type === 'pinstripe') {
    // Pinstripes (Dryžiai)
    ctx.lineWidth = Math.max(2, repeatStep * 0.15);
    for (let x = 0; x <= size; x += repeatStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  } else if (config.type === 'dots') {
    // Polka Dots
    const radius = Math.max(3, repeatStep * 0.2);
    for (let y = 0; y <= size; y += repeatStep) {
      for (let x = 0; x <= size; x += repeatStep) {
        const offset = (Math.floor(y / repeatStep) % 2) * (repeatStep / 2);
        ctx.beginPath();
        ctx.arc(x + offset, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (config.type === 'tartan') {
    // Tartan Checkers (Languotas audinys)
    ctx.lineWidth = repeatStep * 0.35;
    for (let x = 0; x <= size; x += repeatStep * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += repeatStep * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    // Fine thin intersecting stripes
    ctx.lineWidth = 2;
    for (let x = repeatStep; x <= size; x += repeatStep * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = repeatStep; y <= size; y += repeatStep * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  } else if (config.type === 'waves') {
    // Wave lines
    ctx.lineWidth = 2.5;
    const waveH = repeatStep * 0.4;
    for (let y = 0; y <= size + repeatStep; y += repeatStep) {
      ctx.beginPath();
      for (let x = 0; x <= size; x += 10) {
        const wy = y + Math.sin((x / repeatStep) * Math.PI) * waveH;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
  } else if (config.type === 'camo') {
    // Organic Camo Blobs
    for (let i = 0; i < 40; i++) {
      const cx = ((i * 73) % size);
      const cy = ((i * 97) % size);
      const r = (i % 3 === 0) ? repeatStep * 1.2 : repeatStep * 0.8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.6, (i * 45 * Math.PI) / 180, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(config.scale, config.scale);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
