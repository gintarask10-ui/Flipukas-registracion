import { CanvasDesignElement, GarmentLayer, LayerType } from '../types/clothing';

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 560;

/**
 * Helper to draw a star
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points = 5
) {
  ctx.beginPath();
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Helper to draw a heart
 */
export function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(cx, cy + size * 0.2);
  ctx.bezierCurveTo(cx, cy - topCurveHeight, cx - size, cy - topCurveHeight, cx - size, cy + size * 0.2);
  ctx.bezierCurveTo(cx - size, cy + size * 0.6, cx, cy + size * 0.9, cx, cy + size);
  ctx.bezierCurveTo(cx, cy + size * 0.9, cx + size, cy + size * 0.6, cx + size, cy + size * 0.2);
  ctx.bezierCurveTo(cx + size, cy - topCurveHeight, cx, cy - topCurveHeight, cx, cy + size * 0.2);
  ctx.closePath();
}

/**
 * Helper to draw a shield
 */
export function drawShield(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - h);
  ctx.lineTo(cx + w, cy - h);
  ctx.lineTo(cx + w, cy + h * 0.2);
  ctx.bezierCurveTo(cx + w, cy + h * 0.7, cx, cy + h, cx, cy + h);
  ctx.bezierCurveTo(cx, cy + h, cx - w, cy + h * 0.7, cx - w, cy + h * 0.2);
  ctx.closePath();
}

/**
 * Helper to draw lightning
 */
export function drawLightning(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.2, cy - s);
  ctx.lineTo(cx + s * 0.45, cy - s * 0.1);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + s * 0.35, cy + s);
  ctx.lineTo(cx - s * 0.4, cy + s * 0.1);
  ctx.lineTo(cx - s * 0.05, cy - s * 0.1);
  ctx.closePath();
}

/**
 * Helper to draw hexagon
 */
export function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Helper to draw badge graphics
 */
export function drawBadgeGraphic(
  ctx: CanvasRenderingContext2D,
  type: string,
  size: number,
  fill: string,
  stroke: string
) {
  if (type === 'barcode') {
    ctx.fillStyle = fill || '#ffffff';
    const bw = size * 2;
    const bh = size * 0.8;
    const xStart = -bw / 2;
    const yStart = -bh / 2;

    let curX = xStart;
    const barWidths = [4, 8, 2, 6, 10, 4, 2, 8, 4, 12, 6, 2, 8, 4, 6];
    barWidths.forEach((w) => {
      ctx.fillRect(curX, yStart, w, bh);
      curX += w + 4;
    });

    ctx.fillStyle = stroke || '#f59e0b';
    ctx.font = 'bold 16px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0 1 2 4 9 8 7 6 5', 0, yStart + bh + 18);
  } else if (type === 'vytis') {
    ctx.fillStyle = fill || '#f59e0b';
    const s = size * 0.7;
    ctx.fillRect(-s * 0.7, -s * 0.7, s * 0.3, s * 1.4);
    ctx.fillRect(s * 0.4, -s * 0.7, s * 0.3, s * 1.4);
    ctx.fillRect(-s * 0.2, -s * 0.3, s * 0.4, s * 1.0);
    ctx.fillRect(-s * 0.7, s * 0.4, s * 1.4, s * 0.3);
  } else if (type === 'crown') {
    ctx.fillStyle = fill || '#f59e0b';
    const w = size;
    const h = size * 0.7;
    ctx.beginPath();
    ctx.moveTo(-w, -h * 0.3);
    ctx.lineTo(-w * 0.5, h * 0.2);
    ctx.lineTo(0, -h * 0.8);
    ctx.lineTo(w * 0.5, h * 0.2);
    ctx.lineTo(w, -h * 0.3);
    ctx.lineTo(w * 0.7, h * 0.7);
    ctx.lineTo(-w * 0.7, h * 0.7);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'cross') {
    ctx.fillStyle = fill || '#ffffff';
    const w = size * 0.3;
    const h = size * 1.1;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillRect(-h / 2.5, -h / 6, h * 0.8, w);
  } else if (type === 'smile') {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = fill || '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.2, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.2, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, size * 0.05, size * 0.45, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (type === 'flame') {
    ctx.fillStyle = fill || '#ef4444';
    const s = size * 0.9;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s, s * 0.5, -s * 0.9, -s * 0.2, -s * 0.2, -s);
    ctx.bezierCurveTo(-s * 0.1, -s * 0.4, s * 0.1, -s * 0.4, 0, -s * 0.1);
    ctx.bezierCurveTo(s * 0.2, -s * 0.6, s * 0.5, -s * 0.8, s * 0.3, -s);
    ctx.bezierCurveTo(s * 0.9, -s * 0.2, s, s * 0.5, 0, s);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'cyber-skull') {
    ctx.fillStyle = fill || '#38bdf8';
    ctx.strokeStyle = stroke || '#ffffff';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(0, -size * 0.15, size * 0.65, Math.PI, 0);
    ctx.lineTo(size * 0.45, size * 0.45);
    ctx.lineTo(-size * 0.45, size * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye sockets
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(-size * 0.25, -size * 0.15, size * 0.15, 0, Math.PI * 2);
    ctx.arc(size * 0.25, -size * 0.15, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Teeth grid
    ctx.strokeStyle = stroke || '#ffffff';
    ctx.lineWidth = 2;
    for (let x = -size * 0.3; x <= size * 0.3; x += size * 0.15) {
      ctx.beginPath();
      ctx.moveTo(x, size * 0.2);
      ctx.lineTo(x, size * 0.45);
      ctx.stroke();
    }
  } else if (type === 'wave') {
    ctx.strokeStyle = fill || '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    const w = size * 1.5;
    ctx.moveTo(-w / 2, 0);
    ctx.bezierCurveTo(-w / 4, -size * 0.6, 0, size * 0.6, w / 4, -size * 0.6);
    ctx.bezierCurveTo(w * 0.35, -size * 0.6, w * 0.4, 0, w / 2, 0);
    ctx.stroke();
  } else if (type === 'sun') {
    ctx.fillStyle = fill || '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = fill || '#f59e0b';
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * size * 0.6, Math.sin(a) * size * 0.6);
      ctx.lineTo(Math.cos(a) * size * 0.9, Math.sin(a) * size * 0.9);
      ctx.stroke();
    }
  } else if (type === 'badge-frame') {
    ctx.strokeStyle = fill || '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(-size, -size * 0.65, size * 2, size * 1.3);

    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.strokeRect(-size + 6, -size * 0.65 + 6, size * 2 - 12, size * 1.3 - 12);
    ctx.setLineDash([]);
  } else if (type === 'butterfly') {
    ctx.fillStyle = fill || '#ec4899';
    const s = size * 0.7;
    ctx.beginPath();
    ctx.ellipse(-s * 0.5, -s * 0.4, s * 0.6, s * 0.8, -0.4, 0, Math.PI * 2);
    ctx.ellipse(s * 0.5, -s * 0.4, s * 0.6, s * 0.8, 0.4, 0, Math.PI * 2);
    ctx.ellipse(-s * 0.4, s * 0.4, s * 0.4, s * 0.6, 0.3, 0, Math.PI * 2);
    ctx.ellipse(s * 0.4, s * 0.4, s * 0.4, s * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillRect(-2, -s, 4, s * 2);
  } else if (type === 'compass') {
    ctx.strokeStyle = fill || '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = stroke || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.75);
    ctx.lineTo(size * 0.2, 0);
    ctx.lineTo(0, size * 0.75);
    ctx.lineTo(-size * 0.2, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    // Default star badge
    drawStar(ctx, 0, 0, size * 0.8, size * 0.4, 5);
    ctx.fillStyle = fill || '#f59e0b';
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

/**
 * Render a single CanvasDesignElement onto canvas context
 */
export function renderSingleElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasDesignElement
) {
  if (el.visible === false || (el.opacity !== undefined && el.opacity <= 0)) {
    return; // Hidden
  }

  ctx.save();
  ctx.translate(el.x, el.y);
  if (el.rotation !== 0) {
    ctx.rotate((el.rotation * Math.PI) / 180);
  }
  if (el.flipX || el.flipY) {
    ctx.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
  }
  ctx.globalAlpha = Math.max(0, Math.min(1, el.opacity ?? 1.0));

  ctx.fillStyle = el.fill || '#ffffff';
  ctx.strokeStyle = el.stroke || 'transparent';
  ctx.lineWidth = el.strokeWidth || 0;

  if (el.type === 'shape') {
    const hw = el.width / 2;
    const hh = el.height / 2;

    if (el.stitchMode) {
      ctx.setLineDash([8, 5]);
    } else {
      ctx.setLineDash([]);
    }

    if (el.shapeType === 'rect') {
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-hw, -hh, el.width, el.height, 14);
      } else {
        ctx.rect(-hw, -hh, el.width, el.height);
      }
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, 0);
      ctx.lineTo(0, hh);
      ctx.lineTo(-hw, 0);
      ctx.closePath();
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'star') {
      drawStar(ctx, 0, 0, hw, hw * 0.45, 5);
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'star8') {
      drawStar(ctx, 0, 0, hw, hw * 0.35, 8);
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'heart') {
      drawHeart(ctx, 0, 0, hw);
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'lightning') {
      drawLightning(ctx, 0, 0, hw);
      ctx.fill();
    } else if (el.shapeType === 'shield') {
      drawShield(ctx, 0, 0, hw, hh);
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'hexagon') {
      drawHexagon(ctx, 0, 0, hw);
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.shapeType === 'cross') {
      const w = hw * 0.4;
      ctx.beginPath();
      ctx.fillRect(-w / 2, -hh, w, el.height);
      ctx.fillRect(-hw, -w / 2, el.width, w);
    }
  } else if (el.type === 'badge') {
    const hw = el.width / 2;
    drawBadgeGraphic(ctx, el.badgeType || 'vytis', hw, el.fill, el.stroke);
  } else if (el.type === 'image' && el.imageEl) {
    const hw = el.width / 2;
    const hh = el.height / 2;
    ctx.drawImage(el.imageEl, -hw, -hh, el.width, el.height);
  } else if (el.type === 'drawPath' && el.points && el.points.length > 0) {
    ctx.strokeStyle = el.stroke || el.fill || '#f59e0b';
    ctx.lineWidth = el.strokeWidth || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.toolType === 'stitch') {
      ctx.setLineDash([7, 4]);
    } else if (el.toolType === 'highlighter') {
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = Math.max(16, el.strokeWidth * 3);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(el.points[0].x - el.x, el.points[0].y - el.y);
    for (let pIdx = 1; pIdx < el.points.length; pIdx++) {
      ctx.lineTo(el.points[pIdx].x - el.x, el.points[pIdx].y - el.y);
    }
    ctx.stroke();
  } else if (el.type === 'text') {
    const fontFam = el.fontFamily || 'Outfit';
    const fontSz = el.fontSize || 42;
    const fontWt = el.fontWeight || 'bold';
    ctx.font = `${fontWt} ${fontSz}px "${fontFam}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (el.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }

    if (el.textEffect === 'glow') {
      ctx.shadowColor = el.fill || '#f59e0b';
      ctx.shadowBlur = 18;
    }

    if (el.textEffect === 'stitch') {
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = el.fill;
      ctx.lineWidth = 2.5;
    }

    const text = el.text || '';

    if (el.isCurved) {
      const radius = el.curveRadius || 180;
      const totalArc = (text.length * (fontSz * 0.6)) / radius;
      const startAngle = -Math.PI / 2 - totalArc / 2;

      ctx.save();
      for (let cIdx = 0; cIdx < text.length; cIdx++) {
        const char = text[cIdx];
        const angle = startAngle + (cIdx / (text.length - 1 || 1)) * totalArc;
        ctx.save();
        ctx.rotate(angle + Math.PI / 2);
        ctx.translate(0, -radius);
        ctx.fillStyle = el.fill;
        ctx.fillText(char, 0, 0);
        if (el.strokeWidth > 0) {
          ctx.strokeStyle = el.stroke;
          ctx.lineWidth = el.strokeWidth;
          ctx.strokeText(char, 0, 0);
        }
        ctx.restore();
      }
      ctx.restore();
    } else {
      ctx.fillStyle = el.fill;
      ctx.fillText(text, 0, 0);
      if (el.strokeWidth > 0) {
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = el.strokeWidth;
        ctx.strokeText(text, 0, 0);
      }
    }
  }

  ctx.restore();
}

/**
 * Renders an array of CanvasDesignElement onto an HTMLCanvasElement
 */
export function renderElementsToCanvas(
  elements: CanvasDesignElement[],
  targetCanvas?: HTMLCanvasElement,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT
): HTMLCanvasElement {
  const canvas = targetCanvas || document.createElement('canvas');
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, width, height);

  elements.forEach((el) => {
    renderSingleElement(ctx, el);
  });

  return canvas;
}

/**
 * Composite layer renderer:
 * In a layer manager stack, index 0 is typically the TOP visual layer.
 * So we draw from bottom (end of array) to top (start of array)
 * so that layer 0 appears on top of subsequent layers!
 */
export function renderLayersToCanvas(
  layers: GarmentLayer[],
  targetCanvas?: HTMLCanvasElement,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT
): HTMLCanvasElement {
  const canvas = targetCanvas || document.createElement('canvas');
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, width, height);

  // Filter out pattern layers (they are mapped via 3D materials) and invisible layers
  const graphicLayers = layers.filter(
    (l) => l.type !== 'pattern' && l.visible !== false && l.opacity > 0 && l.element
  );

  // Render bottom-to-top (reverse so index 0 is on top)
  const renderStack = [...graphicLayers].reverse();

  renderStack.forEach((layer) => {
    if (!layer.element) return;
    const effectiveElement: CanvasDesignElement = {
      ...layer.element,
      visible: layer.visible,
      opacity: (layer.opacity ?? 1.0) * (layer.element.opacity ?? 1.0),
    };
    renderSingleElement(ctx, effectiveElement);
  });

  return canvas;
}

/**
 * Default starter layers applied to the 3D garment model
 */
export function createDefaultGarmentLayers(
  primaryColor = '#ffffff',
  accentColor = '#f59e0b'
): GarmentLayer[] {
  return [
    {
      id: 'layer-brand-text',
      name: 'FLIPUKAS (Tekstas)',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 1.0,
      icon: 'Type',
      element: {
        id: 'init-text-1',
        name: 'Prekės ženklas',
        type: 'text',
        text: 'FLIPUKAS',
        fontSize: 54,
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        x: 512,
        y: 295,
        width: 320,
        height: 60,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'transparent',
        strokeWidth: 0,
        letterSpacing: 4,
        textEffect: 'solid',
        opacity: 1,
        visible: true,
        locked: false,
      },
    },
    {
      id: 'layer-star-badge',
      name: 'Aštuonkampė kiber žvaigždė',
      type: 'shape',
      visible: true,
      locked: false,
      opacity: 1.0,
      icon: 'Sparkles',
      element: {
        id: 'init-star',
        name: 'Aštuonkampė žvaigždė',
        type: 'shape',
        shapeType: 'star8',
        x: 512,
        y: 195,
        width: 100,
        height: 100,
        rotation: 0,
        fill: accentColor,
        stroke: '#ffffff',
        strokeWidth: 3,
        opacity: 1,
        visible: true,
        locked: false,
      },
    },
    {
      id: 'layer-sub-text',
      name: 'VILNIUS // 2026 (Siuvinėjimas)',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 1.0,
      icon: 'Type',
      element: {
        id: 'init-text-2',
        name: 'Siuvinėtas šūkis',
        type: 'text',
        text: 'VILNIUS // 2026',
        fontSize: 22,
        fontFamily: 'Space Mono',
        fontWeight: 'bold',
        x: 512,
        y: 355,
        width: 260,
        height: 35,
        rotation: 0,
        fill: accentColor,
        stroke: 'transparent',
        strokeWidth: 0,
        letterSpacing: 2,
        textEffect: 'stitch',
        opacity: 1,
        visible: true,
        locked: false,
      },
    },
    {
      id: 'layer-border-frame',
      name: 'Siūlės rėmelis (Apsauginis)',
      type: 'shape',
      visible: true,
      locked: true, // locked by default as protective background frame
      opacity: 0.85,
      icon: 'Square',
      element: {
        id: 'init-bg-frame',
        name: 'Dekoratyvinis rėmelis',
        type: 'shape',
        shapeType: 'rect',
        x: 512,
        y: 280,
        width: 440,
        height: 250,
        rotation: 0,
        fill: 'rgba(255,255,255,0.05)',
        stroke: accentColor,
        strokeWidth: 3,
        stitchMode: true,
        opacity: 0.85,
        visible: true,
        locked: true,
      },
    },
    {
      id: 'layer-pattern-overlay',
      name: 'Audinio raštas (Pattern)',
      type: 'pattern',
      visible: true,
      locked: false,
      opacity: 0.85,
      icon: 'Grid',
      patternConfig: {
        type: 'none',
        scale: 3,
        primaryColor,
        secondaryColor: accentColor,
        opacity: 0.85,
        rotation: 0,
        visible: true,
        locked: false,
      },
    },
  ];
}

/**
 * Reorder layer helper (moves an item from oldIndex to newIndex)
 */
export function reorderLayers(
  layers: GarmentLayer[],
  fromIndex: number,
  toIndex: number
): GarmentLayer[] {
  if (fromIndex < 0 || fromIndex >= layers.length || toIndex < 0 || toIndex >= layers.length) {
    return layers;
  }
  const next = [...layers];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}
