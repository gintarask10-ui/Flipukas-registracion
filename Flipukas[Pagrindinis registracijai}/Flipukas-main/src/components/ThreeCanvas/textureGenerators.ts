import * as THREE from 'three';

/**
 * Generates ultra-realistic procedural canvas textures for real textiles with micro-threads and stitch lines
 */
export function createFabricTexture(
  type: 'cotton' | 'ripstop' | 'neoprene' | 'chrome' | 'leather' | 'silk' | 'denim' | 'wool'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Base neutral canvas
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  if (type === 'cotton') {
    // Ultra-detailed realistic twill cotton weave + fleece loops
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        const isWeave = ((x + y) / 4) % 2 === 0;
        ctx.fillStyle = isWeave ? '#8e8e8e' : '#727272';
        ctx.fillRect(x, y, 4, 4);

        // Micro fiber speckle
        if (Math.random() > 0.7) {
          ctx.fillStyle = Math.random() > 0.5 ? '#9c9c9c' : '#686868';
          ctx.fillRect(x + 1, y + 1, 2, 2);
        }
      }
    }

    // Soft horizontal fabric drape ridges
    for (let y = 0; y < 512; y += 64) {
      const grad = ctx.createLinearGradient(0, y, 0, y + 64);
      grad.addColorStop(0, 'rgba(100, 100, 100, 0.15)');
      grad.addColorStop(0.5, 'rgba(150, 150, 150, 0.1)');
      grad.addColorStop(1, 'rgba(100, 100, 100, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, 512, 64);
    }
  } else if (type === 'silk') {
    // Silk: ultra-fine parallel filaments with gentle anisotropic light flow and micro sheen
    for (let y = 0; y < 512; y += 2) {
      const shade = 124 + Math.sin(y * 0.18) * 8 + (Math.random() * 4 - 2);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(0, y, 512, 2);
    }
    // Diagonal silk twill micro-reflectance lines
    ctx.strokeStyle = 'rgba(215, 215, 215, 0.12)';
    ctx.lineWidth = 1;
    for (let d = -512; d < 1024; d += 8) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + 512, 512);
      ctx.stroke();
    }
    // Soft undulating pearlescent luster waves
    for (let y = 0; y < 512; y += 48) {
      const waveGrad = ctx.createLinearGradient(0, y, 512, y + 48);
      waveGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      waveGrad.addColorStop(0.5, 'rgba(130, 130, 130, 0.05)');
      waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, y, 512, 48);
    }
  } else if (type === 'denim') {
    // Denim: prominent 3x1 diagonal twill weave with indigo warp and white/ecru weft slub yarns
    // Diagonal twill ribs (45° angle)
    for (let y = 0; y < 512; y += 6) {
      for (let x = 0; x < 512; x += 6) {
        const twillPhase = (Math.floor(x / 6) + Math.floor(y / 6)) % 4;
        // 3 warp threads to 1 weft thread
        if (twillPhase === 0) {
          // White/ecru weft yarn showing through
          ctx.fillStyle = '#b8b8b8';
          ctx.fillRect(x, y, 5, 5);
        } else {
          // Dark indigo warp twill
          ctx.fillStyle = Math.random() > 0.4 ? '#686868' : '#5c5c5c';
          ctx.fillRect(x, y, 5, 5);
        }
      }
    }
    // Organic slub irregularities (thick & thin yarns)
    ctx.fillStyle = '#9e9e9e';
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * 500;
      const sy = Math.random() * 500;
      const sw = 12 + Math.random() * 24;
      ctx.fillRect(sx, sy, sw, 2);
    }
  } else if (type === 'wool') {
    // Wool: curly crimped interlocking wool fibers, soft fuzzy loft & loop density
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        const noise = (Math.random() - 0.5) * 32;
        const val = Math.floor(128 + noise);
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
    // Curled crimped fiber swirls
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 600; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      const r = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 1.5);
      ctx.stroke();
    }
    // Fuzzy loop micro-dots
    ctx.fillStyle = '#4f4f4f';
    for (let i = 0; i < 1500; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      ctx.fillRect(fx, fy, 1.5, 1.5);
    }
  } else if (type === 'ripstop') {
    // Softshell ripstop grid with micro crosshatch
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
    // Fine thread crosshatch
    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else if (type === 'neoprene') {
    // Scuba knit - smooth with subtle micro-cellular elasticity
    for (let y = 0; y < 512; y += 6) {
      for (let x = 0; x < 512; x += 6) {
        ctx.fillStyle = Math.random() > 0.5 ? '#848484' : '#7c7c7c';
        ctx.fillRect(x, y, 6, 6);
      }
    }
  } else if (type === 'leather') {
    // Natural organic grain
    ctx.fillStyle = '#656565';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const r = 0.8 + Math.random() * 2.2;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'chrome') {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#757575');
    grad.addColorStop(0.5, '#a5a5a5');
    grad.addColorStop(1, '#757575');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates rib knit texture for realistic cuffs, hem, collar
 */
export function createRibKnitTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);

  // Vertical ridges
  for (let x = 0; x < 128; x += 6) {
    ctx.fillStyle = '#5c5c5c';
    ctx.fillRect(x, 0, 2, 128);
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(x + 2, 0, 4, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Renders realistic twin-needle sewing seams
 */
export function drawSeamStitches(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  stitchColor = '#d4af37'
) {
  ctx.save();
  ctx.strokeStyle = stitchColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]); // Dashed thread stitches

  // Row 1
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Parallel Row 2 (twin needle stitch)
  ctx.beginPath();
  ctx.moveTo(startX, startY + 4);
  ctx.lineTo(endX, endY + 4);
  ctx.stroke();

  ctx.restore();
}

/**
 * Generates real Tangent-Space Normal Maps for PBR micro-surface reliefs (twill, denim slub, leather grain, wool fuzz)
 * Neutral flat normal is RGB(128, 128, 255)
 */
export function createFabricNormalMap(
  type: 'cotton' | 'ripstop' | 'neoprene' | 'chrome' | 'leather' | 'silk' | 'denim' | 'wool'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  // Initialize with neutral tangent normal: R:128, G:128, B:255
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128;
    data[i + 1] = 128;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  // Perturb normals based on textile micro-weave
  if (type === 'denim') {
    // 3x1 Diagonal twill relief
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const twill = (x + y) % 6;
        const bump = Math.sin((twill / 6) * Math.PI * 2);
        data[idx] = Math.min(255, Math.max(0, Math.floor(128 + bump * 40)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.floor(128 + bump * 40)));
        data[idx + 2] = Math.min(255, Math.max(180, Math.floor(255 - Math.abs(bump) * 25)));
      }
    }
  } else if (type === 'cotton') {
    // Interlocking looped yarns
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const nx = Math.sin(x * 0.4) * 24;
        const ny = Math.cos(y * 0.4) * 24;
        data[idx] = Math.floor(128 + nx);
        data[idx + 1] = Math.floor(128 + ny);
        data[idx + 2] = 245;
      }
    }
  } else if (type === 'ripstop') {
    // Reinforced crosshatch grid
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const isGridX = x % 32 < 3;
        const isGridY = y % 32 < 3;
        if (isGridX || isGridY) {
          data[idx] = isGridX ? 165 : 128;
          data[idx + 1] = isGridY ? 165 : 128;
          data[idx + 2] = 220;
        }
      }
    }
  } else if (type === 'leather') {
    // Natural organic pebble grain
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const cell = Math.sin(x * 0.15) * Math.sin(y * 0.15);
        data[idx] = Math.floor(128 + cell * 35);
        data[idx + 1] = Math.floor(128 + cell * 35);
        data[idx + 2] = 240;
      }
    }
  } else if (type === 'wool') {
    // Dense fuzzy loop crinkles
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const noiseX = (Math.random() - 0.5) * 36;
        const noiseY = (Math.random() - 0.5) * 36;
        data[idx] = Math.floor(128 + noiseX);
        data[idx + 1] = Math.floor(128 + noiseY);
        data[idx + 2] = 238;
      }
    }
  } else if (type === 'silk') {
    // Extremely subtle fine sheen lines
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const fineSheen = Math.sin(y * 0.8) * 12;
        data[idx] = 128;
        data[idx + 1] = Math.floor(128 + fineSheen);
        data[idx + 2] = 252;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates PBR Micro-Roughness maps so highlights drape naturally across cloth folds
 */
export function createFabricRoughnessMap(
  type: 'cotton' | 'ripstop' | 'neoprene' | 'chrome' | 'leather' | 'silk' | 'denim' | 'wool'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Default fabric roughness (grayscale: 0=mirror shiny, 255=completely matte)
  let baseVal = 220; // 0.86 roughness for matte cotton
  if (type === 'leather') baseVal = 130; // 0.51
  if (type === 'silk') baseVal = 95; // 0.37
  if (type === 'chrome') baseVal = 25; // 0.10
  if (type === 'neoprene') baseVal = 180; // 0.70

  ctx.fillStyle = `rgb(${baseVal}, ${baseVal}, ${baseVal})`;
  ctx.fillRect(0, 0, 256, 256);

  // Micro-variation noise so reflections feel tactile rather than plastic
  for (let y = 0; y < 256; y += 4) {
    for (let x = 0; x < 256; x += 4) {
      const delta = (Math.random() - 0.5) * 24;
      const v = Math.min(255, Math.max(0, Math.floor(baseVal + delta)));
      ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates high-fidelity Studio HDRI environment texture (softboxes, kicker lights, neutral ceiling)
 * Prevents flat plastic rendering and supplies natural soft reflections for MeshPhysicalMaterial
 */
export function createStudioHDREnvironment(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Neutral studio backdrop gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#1a1d24'); // subtle dark charcoal ceiling
  bgGrad.addColorStop(0.4, '#262930');
  bgGrad.addColorStop(0.7, '#181a1f');
  bgGrad.addColorStop(1, '#0e1014'); // dark floor
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Key Studio Softbox (Large rectangular warm light bank)
  const keySoftbox = ctx.createRadialGradient(260, 200, 20, 260, 200, 180);
  keySoftbox.addColorStop(0, 'rgba(255, 250, 240, 0.95)');
  keySoftbox.addColorStop(0.5, 'rgba(255, 245, 230, 0.6)');
  keySoftbox.addColorStop(1, 'rgba(255, 245, 230, 0)');
  ctx.fillStyle = keySoftbox;
  ctx.fillRect(80, 40, 360, 320);

  // Fill Light Softbox (Cool daylight diffused bank on opposite side)
  const fillSoftbox = ctx.createRadialGradient(780, 220, 20, 780, 220, 160);
  fillSoftbox.addColorStop(0, 'rgba(235, 245, 255, 0.8)');
  fillSoftbox.addColorStop(0.5, 'rgba(220, 235, 255, 0.4)');
  fillSoftbox.addColorStop(1, 'rgba(220, 235, 255, 0)');
  ctx.fillStyle = fillSoftbox;
  ctx.fillRect(620, 60, 320, 320);

  // Overhead Overhead Strip Softbox (Gives crisp top shoulder highlights)
  const topStrip = ctx.createLinearGradient(0, 40, 0, 120);
  topStrip.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  topStrip.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = topStrip;
  ctx.fillRect(200, 30, 624, 90);

  // Kicker / Rim Backlight (Accentuates fabric edges and sheen plaukeliai)
  const rimLight = ctx.createRadialGradient(512, 180, 10, 512, 180, 140);
  rimLight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  rimLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rimLight;
  ctx.fillRect(400, 80, 224, 200);

  const envTex = new THREE.CanvasTexture(canvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.needsUpdate = true;
  return envTex;
}

/**
 * Creates high-fidelity Rubber Outsole Normal Map with waffle tread, herringbone traction, and ribbed sidewall
 */
export function createSneakerSoleNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  // Tangent-space neutral base (128, 128, 255)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128;
    data[i + 1] = 128;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  // Waffle tread grid + herringbone flex bevels
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const modX = x % 32;
      const modY = y % 32;
      const isGroove = modX < 4 || modY < 4;

      if (isGroove) {
        // Recessed tread lug groove
        data[idx] = modX < 4 ? 90 : 128;
        data[idx + 1] = modY < 4 ? 90 : 128;
        data[idx + 2] = 210;
      } else {
        // Micro-grip pebble rubber texture on the raised lug surface
        const rubberGrip = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 18;
        data[idx] = Math.floor(128 + rubberGrip);
        data[idx + 1] = Math.floor(128 + rubberGrip);
        data[idx + 2] = 245;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates high-fidelity Tumbled Leather Normal Map with micro-pores and stitching grain
 */
export function createSneakerLeatherNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      // Organic multi-octave pebble cell structure
      const cell1 = Math.sin(x * 0.22) * Math.cos(y * 0.22);
      const cell2 = Math.cos(x * 0.44 + y * 0.15) * 0.5;
      const relief = (cell1 + cell2) * 26;

      data[idx] = Math.min(255, Math.max(0, Math.floor(128 + relief)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.floor(128 + relief * 0.85)));
      data[idx + 2] = Math.floor(255 - Math.abs(relief) * 0.4);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural tactile displacement map generator for realistic fabric micro-height relief
 */
export function createFabricDisplacementMap(
  type: 'cotton' | 'ripstop' | 'neoprene' | 'chrome' | 'leather' | 'silk' | 'denim' | 'wool'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Neutral mid-grey base (128 = 0 displacement bias)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  if (type === 'cotton') {
    // Interlocking looped knitted yarn height valleys and ridges
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        const isLoop = ((x + y) / 4) % 2 === 0;
        const val = isLoop ? 158 : 98;
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
    // Subtle cross-weave wave
    for (let y = 0; y < 512; y += 32) {
      const grad = ctx.createLinearGradient(0, y, 0, y + 32);
      grad.addColorStop(0, 'rgba(100, 100, 100, 0.2)');
      grad.addColorStop(0.5, 'rgba(156, 156, 156, 0.2)');
      grad.addColorStop(1, 'rgba(100, 100, 100, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, 512, 32);
    }
  } else if (type === 'denim') {
    // Diagonal twill ridge elevation (3x1 weave step)
    for (let y = 0; y < 512; y += 6) {
      for (let x = 0; x < 512; x += 6) {
        const twill = (x + y) % 12;
        const elevation = Math.floor(128 + Math.sin((twill / 12) * Math.PI * 2) * 45);
        ctx.fillStyle = `rgb(${elevation}, ${elevation}, ${elevation})`;
        ctx.fillRect(x, y, 6, 6);
      }
    }
    // High-low yarn slub displacement peaks
    for (let i = 0; i < 60; i++) {
      const sx = Math.random() * 490;
      const sy = Math.random() * 490;
      const sw = 16 + Math.random() * 30;
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(sx, sy, sw, 3);
    }
  } else if (type === 'wool') {
    // Lofty crimped wool fibers and crinkle clusters
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 1.5 + Math.random() * 4;
      const val = 140 + Math.floor(Math.random() * 65);
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'leather') {
    // Organic cellular pebble grain micro-crevices
    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 1 + Math.random() * 3.5;
      const val = 145 + Math.floor(Math.random() * 50);
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'ripstop') {
    // Elevated square ripstop grid
    ctx.strokeStyle = '#c5c5c5';
    ctx.lineWidth = 3.5;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
  } else {
    // Silk / neoprene / fine fibers
    for (let y = 0; y < 512; y += 4) {
      const v = 128 + Math.floor(Math.sin(y * 0.15) * 22);
      ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
      ctx.fillRect(0, y, 512, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates high-contrast micro-roughness variations for tactile haptic shader perception
 */
export function createHapticRoughnessMap(
  type: 'cotton' | 'ripstop' | 'neoprene' | 'chrome' | 'leather' | 'silk' | 'denim' | 'wool'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  let baseVal = 210;
  if (type === 'leather') baseVal = 140;
  if (type === 'silk') baseVal = 85;
  if (type === 'chrome') baseVal = 20;
  if (type === 'neoprene') baseVal = 175;

  ctx.fillStyle = `rgb(${baseVal}, ${baseVal}, ${baseVal})`;
  ctx.fillRect(0, 0, 256, 256);

  // Exaggerated micro-roughness noise: threads alternate between shiny peaks and matte valleys
  for (let y = 0; y < 256; y += 4) {
    for (let x = 0; x < 256; x += 4) {
      const isPeak = ((x + y) / 4) % 2 === 0;
      const variation = isPeak ? -38 : 38;
      const val = Math.min(255, Math.max(0, baseVal + variation + Math.floor((Math.random() - 0.5) * 20)));
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

