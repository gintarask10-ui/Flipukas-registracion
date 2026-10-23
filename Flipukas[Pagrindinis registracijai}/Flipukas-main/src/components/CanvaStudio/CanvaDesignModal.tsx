import React, { useEffect, useRef, useState } from 'react';
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowUp,
  Camera,
  Check,
  Circle,
  Compass,
  Copy,
  Crown,
  Download,
  Eraser,
  Feather,
  Flame,
  FlipHorizontal,
  FlipVertical,
  Grid,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Maximize2,
  Minus,
  Moon,
  Move,
  Paintbrush,
  Palette,
  Plus,
  QrCode,
  Redo2,
  RotateCw,
  Shapes,
  Shield,
  Smile,
  Sparkles,
  Square,
  Star,
  Sun,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { CanvasDesignElement, DesignPlacement } from '../../types/clothing';

interface CanvaDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToGarment: (
    canvas: HTMLCanvasElement,
    placement?: DesignPlacement,
    elements?: CanvasDesignElement[]
  ) => void;
  garmentColor: string;
  initialPlacement?: DesignPlacement;
  initialElements?: CanvasDesignElement[];
}

// Curated streetwear fashion color palette
const FASHION_PALETTE = [
  '#ffffff', '#000000', '#f59e0b', '#d97706', '#ef4444', '#dc2626',
  '#ec4899', '#8b5cf6', '#6366f1', '#38bdf8', '#0284c7', '#10b981',
  '#059669', '#84cc16', '#e2e8f0', '#94a3b8', '#475569', '#1e293b',
  '#fde047', '#fed7aa', '#fbcfe8', '#a7f3d0', '#bae6fd', '#ddd6fe',
];

export const CanvaDesignModal: React.FC<CanvaDesignModalProps> = ({
  isOpen,
  onClose,
  onApplyToGarment,
  garmentColor,
  initialPlacement = 'chest',
  initialElements,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'shapes' | 'stickers' | 'text' | 'draw' | 'upload' | 'templates'>('shapes');

  // Placement on garment: Center Chest, Full Back Print, Pocket/Left Chest
  const [placement, setPlacement] = useState<DesignPlacement>(initialPlacement);

  // Workspace light/dark theme toggle for comfort (Canva light by default!)
  const [workspaceTheme, setWorkspaceTheme] = useState<'light' | 'dark' | 'garment'>('light');
  const [showGrid, setShowGrid] = useState(false);

  // Freehand Drawing state
  const [drawTool, setDrawTool] = useState<'stitch' | 'spray' | 'brush' | 'highlighter' | 'eraser'>('stitch');
  const [drawColor, setDrawColor] = useState('#f59e0b');
  const [drawWidth, setDrawWidth] = useState(6);
  const isDrawingOnCanvasRef = useRef(false);
  const activePathRef = useRef<{ x: number; y: number }[]>([]);

  // History for Undo / Redo
  const [history, setHistory] = useState<CanvasDesignElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Default design elements or initial elements
  const [elements, setElements] = useState<CanvasDesignElement[]>(() => {
    if (initialElements && initialElements.length > 0) {
      return initialElements;
    }
    return [
      {
        id: 'init-bg-frame',
        type: 'shape',
        shapeType: 'rect',
        x: 512,
        y: 280,
        width: 440,
        height: 250,
        rotation: 0,
        fill: 'rgba(255,255,255,0.06)',
        stroke: '#f59e0b',
        strokeWidth: 4,
        opacity: 1,
      },
      {
        id: 'init-star',
        type: 'shape',
        shapeType: 'star8',
        x: 512,
        y: 195,
        width: 105,
        height: 105,
        rotation: 0,
        fill: '#f59e0b',
        stroke: '#ffffff',
        strokeWidth: 3,
        opacity: 1,
      },
      {
        id: 'init-text-1',
        type: 'text',
        text: 'FLIPUKAS',
        fontSize: 56,
        fontFamily: 'Outfit',
        x: 512,
        y: 305,
        width: 320,
        height: 60,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'transparent',
        strokeWidth: 0,
        letterSpacing: 4,
        textEffect: 'solid',
        opacity: 1,
      },
      {
        id: 'init-text-2',
        type: 'text',
        text: 'VILNIUS // 2026',
        fontSize: 22,
        fontFamily: 'Space Mono',
        x: 512,
        y: 360,
        width: 260,
        height: 35,
        rotation: 0,
        fill: '#f59e0b',
        stroke: 'transparent',
        strokeWidth: 0,
        letterSpacing: 2,
        textEffect: 'stitch',
        opacity: 1,
      },
    ];
  });

  // Keep elements synced when modal is reopened with external layers
  useEffect(() => {
    if (isOpen && initialElements && initialElements.length > 0) {
      setElements(initialElements);
      setHistory([initialElements]);
      setHistoryIndex(0);
      setSelectedId(initialElements[0]?.id || null);
    }
  }, [isOpen]);

  const [selectedId, setSelectedId] = useState<string | null>('init-text-1');
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Record history when elements change
  const pushState = (newElements: CanvasDesignElement[]) => {
    setElements(newElements);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newElements]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // Ultra-high definition canvas renderer (1024x560)
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional background grid for alignment
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = workspaceTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    elements.forEach((el) => {
      ctx.save();
      ctx.translate(el.x, el.y);
      if (el.rotation !== 0) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      if (el.flipX || el.flipY) {
        ctx.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
      }
      ctx.globalAlpha = el.opacity ?? 1.0;

      ctx.fillStyle = el.fill;
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;

      if (el.type === 'shape') {
        const hw = el.width / 2;
        const hh = el.height / 2;

        if (el.shapeType === 'rect') {
          ctx.beginPath();
          ctx.roundRect(-hw, -hh, el.width, el.height, 14);
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
        drawBadgeGraphic(ctx, el.badgeType || 'barcode', hw, el.fill, el.stroke);
      } else if (el.type === 'image' && el.imageEl) {
        ctx.drawImage(el.imageEl, -el.width / 2, -el.height / 2, el.width, el.height);
      } else if (el.type === 'drawPath' && el.points && el.points.length > 1) {
        drawFreehandPath(ctx, el.points, el.stroke, el.strokeWidth, el.toolType || 'stitch');
      } else if (el.type === 'text') {
        renderStyledText(ctx, el);
      }

      // Selection bounding box
      if (el.id === selectedId) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(-el.width / 2 - 8, -el.height / 2 - 8, el.width + 16, el.height + 16);

        // Corner handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#0284c7';
        const hSize = 10;
        ctx.fillRect(el.width / 2 + 3, el.height / 2 + 3, hSize, hSize);
        ctx.fillRect(-el.width / 2 - 13, el.height / 2 + 3, hSize, hSize);
        ctx.fillRect(el.width / 2 + 3, -el.height / 2 - 13, hSize, hSize);
        ctx.fillRect(-el.width / 2 - 13, -el.height / 2 - 13, hSize, hSize);
      }

      ctx.restore();
    });

    onApplyToGarment(canvas, placement);
  };

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [elements, selectedId, isOpen, showGrid, workspaceTheme, placement]);

  // Geometric draw helpers
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, ro: number, ri: number, pts: number) => {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? ro : ri;
      const a = (i * Math.PI) / pts - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(cx, cy + size * 0.2);
    ctx.bezierCurveTo(cx, cy - topCurveHeight, cx - size, cy - topCurveHeight, cx - size, cy + size * 0.2);
    ctx.bezierCurveTo(cx - size, cy + size * 0.6, cx, cy + size * 0.9, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + size * 0.9, cx + size, cy + size * 0.6, cx + size, cy + size * 0.2);
    ctx.bezierCurveTo(cx + size, cy - topCurveHeight, cx, cy - topCurveHeight, cx, cy + size * 0.2);
    ctx.closePath();
  };

  const drawShield = (ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) => {
    ctx.beginPath();
    ctx.moveTo(cx - w, cy - h);
    ctx.lineTo(cx + w, cy - h);
    ctx.lineTo(cx + w, cy + h * 0.2);
    ctx.bezierCurveTo(cx + w, cy + h * 0.7, cx, cy + h, cx, cy + h);
    ctx.bezierCurveTo(cx, cy + h, cx - w, cy + h * 0.7, cx - w, cy + h * 0.2);
    ctx.closePath();
  };

  const drawLightning = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.2, cy - s);
    ctx.lineTo(cx + s * 0.45, cy - s * 0.1);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + s * 0.35, cy + s);
    ctx.lineTo(-s * 0.4, cy + s * 0.1);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.1);
    ctx.closePath();
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const drawBadgeGraphic = (
    ctx: CanvasRenderingContext2D,
    type: string,
    size: number,
    fill: string,
    stroke: string
  ) => {
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
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = fill || '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-size * 0.35, -size * 0.2, size * 0.14, 0, Math.PI * 2);
      ctx.arc(size * 0.35, -size * 0.2, size * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = size * 0.12;
      ctx.beginPath();
      ctx.arc(0, size * 0.1, size * 0.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (type === 'flame') {
      ctx.fillStyle = fill || '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.bezierCurveTo(-size, size * 0.5, -size * 0.8, -size * 0.4, -size * 0.3, -size);
      ctx.bezierCurveTo(-size * 0.1, -size * 0.4, size * 0.2, -size * 0.6, 0, -size * 0.2);
      ctx.bezierCurveTo(size * 0.5, -size * 0.8, size, -size * 0.2, size * 0.6, size * 0.4);
      ctx.bezierCurveTo(size * 0.8, size * 0.8, 0, size, 0, size);
      ctx.fill();
    } else if (type === 'butterfly') {
      ctx.fillStyle = fill || '#a855f7';
      const w = size * 0.9;
      ctx.beginPath();
      ctx.ellipse(-w * 0.5, -w * 0.3, w * 0.45, w * 0.35, -0.2, 0, Math.PI * 2);
      ctx.ellipse(w * 0.5, -w * 0.3, w * 0.45, w * 0.35, 0.2, 0, Math.PI * 2);
      ctx.ellipse(-w * 0.4, w * 0.3, w * 0.35, w * 0.25, 0.3, 0, Math.PI * 2);
      ctx.ellipse(w * 0.4, w * 0.3, w * 0.35, w * 0.25, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -w * 0.5, 4, w);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.fillStyle = stroke;
      ctx.font = `bold ${size * 0.8}px Outfit`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 0);
    }
  };

  // Freehand path renderer (Stitch, Spray, Brush)
  const drawFreehandPath = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    color: string,
    width: number,
    tool: string
  ) => {
    if (points.length < 2) return;

    ctx.save();
    if (tool === 'stitch') {
      // Raised embroidery stitch thread
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'square';
      ctx.setLineDash([8, 5]);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Stitch drop shadow for 3D embroidery realism
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = width * 0.7;
      ctx.beginPath();
      ctx.moveTo(points[0].x + 1.5, points[0].y + 1.5);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + 1.5, points[i].y + 1.5);
      }
      ctx.stroke();
    } else if (tool === 'spray') {
      // Graffiti spray particles
      ctx.fillStyle = color;
      points.forEach((pt) => {
        for (let i = 0; i < 6; i++) {
          const offsetX = (Math.random() - 0.5) * width * 2.5;
          const offsetY = (Math.random() - 0.5) * width * 2.5;
          const rad = Math.random() * (width * 0.3) + 1;
          ctx.beginPath();
          ctx.arc(pt.x + offsetX, pt.y + offsetY, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else {
      // Smooth Brush / Marker
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  // Styled Text with Curved Arc or Effects
  const renderStyledText = (ctx: CanvasRenderingContext2D, el: CanvasDesignElement) => {
    const text = el.text || '';
    const fontSize = el.fontSize || 38;
    const fontFamily = el.fontFamily || 'Outfit';
    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (el.textEffect === 'stitch') {
      // Embroidered thread text with dashed outline & drop shadow
      ctx.fillStyle = el.fill;
      ctx.fillText(text, 0, 0);

      ctx.strokeStyle = el.stroke && el.stroke !== 'transparent' ? el.stroke : 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeText(text, 0, 0);
    } else if (el.textEffect === 'glow') {
      ctx.shadowColor = el.fill;
      ctx.shadowBlur = 18;
      ctx.fillStyle = el.fill;
      ctx.fillText(text, 0, 0);
      ctx.shadowBlur = 0;
    } else if (el.isCurved && (el.curveRadius || 120)) {
      // Curved arc text along radius
      const radius = el.curveRadius || 140;
      const anglePerChar = 0.12;
      const totalAngle = anglePerChar * text.length;
      let startAngle = -totalAngle / 2;

      ctx.save();
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const angle = startAngle + i * anglePerChar;
        ctx.save();
        ctx.rotate(angle);
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
  };

  // Mouse coordinate helpers on HD Canvas
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1024 / rect.width;
    const scaleY = 560 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    // If user is currently in Freehand Draw tab, draw onto canvas!
    if (activeTab === 'draw') {
      isDrawingOnCanvasRef.current = true;
      activePathRef.current = [pos];
      return;
    }

    // Select existing element
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const hw = el.width / 2 + 16;
      const hh = el.height / 2 + 16;
      if (pos.x >= el.x - hw && pos.x <= el.x + hw && pos.y >= el.y - hh && pos.y <= el.y + hh) {
        setSelectedId(el.id);
        isDraggingRef.current = true;
        dragOffsetRef.current = { x: pos.x - el.x, y: pos.y - el.y };
        return;
      }
    }
    setSelectedId(null);
  };

  // Canvas Mouse Move
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (activeTab === 'draw' && isDrawingOnCanvasRef.current) {
      activePathRef.current.push(pos);
      // Quick live preview of the current stroke
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && activePathRef.current.length > 1) {
        const last = activePathRef.current[activePathRef.current.length - 2];
        ctx.save();
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = drawWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    if (!isDraggingRef.current || !selectedId) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedId) {
          return {
            ...el,
            x: Math.round(pos.x - dragOffsetRef.current.x),
            y: Math.round(pos.y - dragOffsetRef.current.y),
          };
        }
        return el;
      })
    );
  };

  // Canvas Mouse Up
  const handleCanvasMouseUp = () => {
    if (activeTab === 'draw' && isDrawingOnCanvasRef.current) {
      isDrawingOnCanvasRef.current = false;
      if (activePathRef.current.length > 2) {
        // Commit new drawn stroke as element
        const newPathElement: CanvasDesignElement = {
          id: `draw-${Date.now()}`,
          type: 'drawPath',
          points: [...activePathRef.current],
          toolType: drawTool === 'eraser' ? 'brush' : drawTool,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
          fill: 'transparent',
          stroke: drawTool === 'eraser' ? (workspaceTheme === 'garment' ? garmentColor : '#ffffff') : drawColor,
          strokeWidth: drawWidth,
          opacity: 1,
        };
        pushState([...elements, newPathElement]);
      }
      activePathRef.current = [];
      return;
    }

    if (isDraggingRef.current) {
      pushState(elements);
    }
    isDraggingRef.current = false;
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = 200;
        const height = width / aspect;

        const newEl: CanvasDesignElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          imageSrc: src,
          imageEl: img,
          x: 512,
          y: 280,
          width,
          height,
          rotation: 0,
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: 1,
        };
        pushState([...elements, newEl]);
        setSelectedId(newEl.id);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Add Element Functions
  const addShape = (shapeType: CanvasDesignElement['shapeType']) => {
    const newEl: CanvasDesignElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 512,
      y: 280,
      width: 130,
      height: 130,
      rotation: 0,
      fill: '#f59e0b',
      stroke: '#ffffff',
      strokeWidth: 3,
      opacity: 1,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addBadge = (badgeType: CanvasDesignElement['badgeType']) => {
    const newEl: CanvasDesignElement = {
      id: `badge-${Date.now()}`,
      type: 'badge',
      badgeType,
      x: 512,
      y: 280,
      width: 140,
      height: 110,
      rotation: 0,
      fill: '#f59e0b',
      stroke: '#ffffff',
      strokeWidth: 2,
      opacity: 1,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addText = (textValue = 'NAUJAS TEKSTAS', effect: CanvasDesignElement['textEffect'] = 'solid') => {
    const newEl: CanvasDesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: textValue,
      fontSize: 42,
      fontFamily: 'Outfit',
      x: 512,
      y: 280,
      width: 280,
      height: 50,
      rotation: 0,
      fill: '#ffffff',
      stroke: 'transparent',
      strokeWidth: 0,
      textEffect: effect,
      letterSpacing: 2,
      opacity: 1,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  // Preset Template Loader
  const loadPreset = (presetName: string) => {
    if (presetName === 'cyber') {
      const cyberEls: CanvasDesignElement[] = [
        {
          id: 'c-bg',
          type: 'shape',
          shapeType: 'rect',
          x: 512,
          y: 280,
          width: 480,
          height: 280,
          rotation: 0,
          fill: 'rgba(56, 189, 248, 0.08)',
          stroke: '#38bdf8',
          strokeWidth: 3,
        },
        {
          id: 'c-star',
          type: 'shape',
          shapeType: 'star8',
          x: 512,
          y: 195,
          width: 120,
          height: 120,
          rotation: 0,
          fill: '#38bdf8',
          stroke: '#ffffff',
          strokeWidth: 3,
        },
        {
          id: 'c-t1',
          type: 'text',
          text: 'VILNIUS // CYBER',
          fontSize: 48,
          fontFamily: 'Space Mono',
          x: 512,
          y: 310,
          width: 380,
          height: 60,
          rotation: 0,
          fill: '#ffffff',
          stroke: 'transparent',
          strokeWidth: 0,
          textEffect: 'glow',
        },
        {
          id: 'c-t2',
          type: 'text',
          text: '54.6872° N, 25.2797° E',
          fontSize: 20,
          fontFamily: 'Space Mono',
          x: 512,
          y: 365,
          width: 280,
          height: 30,
          rotation: 0,
          fill: '#38bdf8',
          stroke: 'transparent',
          strokeWidth: 0,
        },
      ];
      pushState(cyberEls);
      setSelectedId('c-t1');
    } else if (presetName === 'varsity') {
      const varsityEls: CanvasDesignElement[] = [
        {
          id: 'v-arc',
          type: 'text',
          text: 'VILNIUS TECH',
          fontSize: 52,
          fontFamily: 'Outfit',
          isCurved: true,
          curveRadius: 130,
          x: 512,
          y: 230,
          width: 380,
          height: 70,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#f59e0b',
          strokeWidth: 3,
        },
        {
          id: 'v-shield',
          type: 'shape',
          shapeType: 'shield',
          x: 512,
          y: 285,
          width: 90,
          height: 100,
          rotation: 0,
          fill: '#f59e0b',
          stroke: '#ffffff',
          strokeWidth: 3,
        },
        {
          id: 'v-sub',
          type: 'text',
          text: '1996 · ATHLETIC CLUB',
          fontSize: 24,
          fontFamily: 'Space Mono',
          x: 512,
          y: 375,
          width: 320,
          height: 40,
          rotation: 0,
          fill: '#ffffff',
          stroke: 'transparent',
          strokeWidth: 0,
        },
      ];
      pushState(varsityEls);
      setSelectedId('v-arc');
    } else if (presetName === 'flames') {
      const flameEls: CanvasDesignElement[] = [
        {
          id: 'f-1',
          type: 'badge',
          badgeType: 'flame',
          x: 512,
          y: 230,
          width: 140,
          height: 140,
          rotation: 0,
          fill: '#ef4444',
          stroke: '#f59e0b',
          strokeWidth: 2,
        },
        {
          id: 'f-t1',
          type: 'text',
          text: 'NO RULES',
          fontSize: 64,
          fontFamily: 'Outfit',
          x: 512,
          y: 335,
          width: 320,
          height: 70,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#ef4444',
          strokeWidth: 2,
        },
        {
          id: 'f-barcode',
          type: 'badge',
          badgeType: 'barcode',
          x: 512,
          y: 395,
          width: 130,
          height: 50,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#ef4444',
          strokeWidth: 1,
        },
      ];
      pushState(flameEls);
      setSelectedId('f-t1');
    } else if (presetName === 'heritage') {
      const heritageEls: CanvasDesignElement[] = [
        {
          id: 'h-vytis',
          type: 'badge',
          badgeType: 'vytis',
          x: 512,
          y: 220,
          width: 130,
          height: 120,
          rotation: 0,
          fill: '#f59e0b',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          id: 'h-t1',
          type: 'text',
          text: 'LIETUVA',
          fontSize: 54,
          fontFamily: 'Outfit',
          x: 512,
          y: 325,
          width: 320,
          height: 60,
          rotation: 0,
          fill: '#ffffff',
          stroke: 'transparent',
          strokeWidth: 0,
          letterSpacing: 6,
        },
        {
          id: 'h-t2',
          type: 'text',
          text: 'AUTHENTIC HERITAGE // MMXXVI',
          fontSize: 18,
          fontFamily: 'Space Mono',
          x: 512,
          y: 375,
          width: 320,
          height: 30,
          rotation: 0,
          fill: '#f59e0b',
          stroke: 'transparent',
          strokeWidth: 0,
        },
      ];
      pushState(heritageEls);
      setSelectedId('h-t1');
    } else if (presetName === 'smile') {
      const smileEls: CanvasDesignElement[] = [
        {
          id: 's-smile',
          type: 'badge',
          badgeType: 'smile',
          x: 512,
          y: 230,
          width: 140,
          height: 140,
          rotation: 0,
          fill: '#fde047',
          stroke: '#000000',
          strokeWidth: 4,
        },
        {
          id: 's-t1',
          type: 'text',
          text: 'HAVE A GOOD SHIFT',
          fontSize: 44,
          fontFamily: 'Outfit',
          x: 512,
          y: 340,
          width: 380,
          height: 55,
          rotation: 0,
          fill: '#ffffff',
          stroke: 'transparent',
          strokeWidth: 0,
        },
      ];
      pushState(smileEls);
      setSelectedId('s-smile');
    }
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `flipukas_dizainas_${placement}_${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden">
      {/* Main Studio Modal Window */}
      <div className="w-full max-w-6xl h-[92vh] max-h-[880px] bg-white text-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
        {/* Top Canva Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-neutral-950 font-bold shadow-sm">
                FP
              </div>
              <div>
                <span className="font-bold text-sm text-neutral-900 font-display">Flipukas Canva Studija</span>
                <span className="hidden sm:inline-block text-[11px] text-neutral-500 ml-2">Drabužių Grafika & Siuvinėjimas</span>
              </div>
            </div>

            {/* Undo / Redo */}
            <div className="flex items-center gap-1 ml-4 border-l border-neutral-200 pl-3">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 text-neutral-700 transition"
                title="Atšaukti (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 text-neutral-700 transition"
                title="Pakartoti (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Placement on Garment Selector */}
          <div className="flex items-center gap-1 bg-neutral-200/80 p-1 rounded-xl">
            <button
              onClick={() => {
                setPlacement('chest');
                onApplyToGarment(canvasRef.current!, 'chest');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                placement === 'chest'
                  ? 'bg-white text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Krūtinė (Priekis)
            </button>
            <button
              onClick={() => {
                setPlacement('back');
                onApplyToGarment(canvasRef.current!, 'back');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                placement === 'back'
                  ? 'bg-white text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Didysis Printas (Nugara)
            </button>
            <button
              onClick={() => {
                setPlacement('pocket');
                onApplyToGarment(canvasRef.current!, 'pocket');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                placement === 'pocket'
                  ? 'bg-white text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Kišenė / Širdis
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Grid toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              title="Rodyti tinklelio linijas"
              className={`p-2 rounded-xl border text-xs transition ${
                showGrid ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Canvas Theme Selector */}
            <button
              onClick={() => {
                const modes: ('light' | 'dark' | 'garment')[] = ['light', 'dark', 'garment'];
                const next = modes[(modes.indexOf(workspaceTheme) + 1) % modes.length];
                setWorkspaceTheme(next);
              }}
              title="Keisti drobės foną (Šviesus / Tamsus / Drabužio spalva)"
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 text-xs flex items-center gap-1.5"
            >
              {workspaceTheme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline text-[11px]">Šviesus</span>
                </>
              ) : workspaceTheme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-sky-500" />
                  <span className="hidden sm:inline text-[11px]">Tamsus</span>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-400" style={{ backgroundColor: garmentColor }} />
                  <span className="hidden sm:inline text-[11px]">Drabužis</span>
                </>
              )}
            </button>

            {/* Download PNG */}
            <button
              onClick={handleDownloadPNG}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs flex items-center gap-1"
              title="Atsisiųsti PNG failą"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Save & Apply Button */}
            <button
              onClick={() => {
                if (canvasRef.current) {
                  onApplyToGarment(canvasRef.current, placement, elements);
                }
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Išsaugoti ant 3D</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Sidebar + Center Canvas Studio */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Vertical Icon Bar (Canva style) */}
          <div className="w-18 bg-neutral-100 border-r border-neutral-200 flex flex-col items-center py-4 gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('shapes')}
              className={`w-14 py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'shapes' ? 'bg-white shadow text-amber-600 font-bold' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Shapes className="w-5 h-5" />
              <span className="text-[10px]">Figūros</span>
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`w-14 py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'stickers' ? 'bg-white shadow text-amber-600 font-bold' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px]">Lipdukai</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`w-14 py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'text' ? 'bg-white shadow text-amber-600 font-bold' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Type className="w-5 h-5" />
              <span className="text-[10px]">Tekstas</span>
            </button>

            <button
              onClick={() => setActiveTab('draw')}
              className={`w-14 py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'draw' ? 'bg-white shadow text-amber-600 font-bold' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Paintbrush className="w-5 h-5" />
              <span className="text-[10px]">Piešti</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`w-14 py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'upload' ? 'bg-white shadow text-amber-600 font-bold' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="text-[10px]">Foto</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-14 py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'templates' ? 'bg-white shadow text-amber-600 font-bold' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <LayoutTemplate className="w-5 h-5" />
              <span className="text-[10px]">Šablonai</span>
            </button>
          </div>

          {/* Secondary Options Drawer (Wide Canva flyout) */}
          <div className="w-72 bg-neutral-50/70 border-r border-neutral-200 flex flex-col overflow-y-auto p-4 shrink-0">
            {/* Tab: Shapes */}
            {activeTab === 'shapes' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-1">Geometrinės Figūros</h4>
                  <p className="text-[11px] text-neutral-500">Pasirink figūrą, kurią nori įdėti ant drabužio:</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'star8', label: '8-kiber', icon: Sparkles, color: 'text-amber-500' },
                    { id: 'star', label: 'Žvaigždė', icon: Star, color: 'text-amber-500' },
                    { id: 'shield', label: 'Skydas', icon: Shield, color: 'text-blue-500' },
                    { id: 'heart', label: 'Širdelė', icon: Heart, color: 'text-rose-500' },
                    { id: 'lightning', label: 'Žaibas', icon: Zap, color: 'text-amber-500' },
                    { id: 'circle', label: 'Apskritimas', icon: Circle, color: 'text-emerald-500' },
                    { id: 'rect', label: 'Kvadratas', icon: Square, color: 'text-neutral-700' },
                    { id: 'diamond', label: 'Rombas', icon: DiamondIcon, color: 'text-purple-500' },
                    { id: 'triangle', label: 'Trikampis', icon: TriangleIcon, color: 'text-cyan-500' },
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addShape(item.id as any)}
                        className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 hover:shadow-sm flex flex-col items-center gap-1.5 transition text-neutral-700"
                      >
                        <IconComp className={`w-6 h-6 ${item.color}`} />
                        <span className="text-[11px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Stickers & Decals */}
            {activeTab === 'stickers' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-1">Mados Ženklai & Lipdukai</h4>
                  <p className="text-[11px] text-neutral-500">Gatvės stiliaus, technologijų ir baltiškos grafikos elementai:</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => addBadge('barcode')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <span className="font-mono text-xs tracking-tighter font-bold">|||| | || |||</span>
                    <span className="text-[11px] font-semibold text-neutral-800">Brūkšninis Kodas</span>
                  </button>

                  <button
                    onClick={() => addBadge('flame')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <Flame className="w-5 h-5 text-red-500" />
                    <span className="text-[11px] font-semibold text-neutral-800">Liepsna</span>
                  </button>

                  <button
                    onClick={() => addBadge('smile')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <Smile className="w-5 h-5 text-amber-500" />
                    <span className="text-[11px] font-semibold text-neutral-800">Acid Smile</span>
                  </button>

                  <button
                    onClick={() => addBadge('vytis')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="text-[11px] font-semibold text-neutral-800">Gedimino Stulpai</span>
                  </button>

                  <button
                    onClick={() => addBadge('crown')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="text-[11px] font-semibold text-neutral-800">Karūna</span>
                  </button>

                  <button
                    onClick={() => addBadge('butterfly')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="text-[11px] font-semibold text-neutral-800">Drugelis</span>
                  </button>

                  <button
                    onClick={() => addBadge('cross')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 flex flex-col items-center gap-1 text-center"
                  >
                    <div className="w-4 h-5 border-2 border-neutral-800 flex items-center justify-center font-bold text-xs">+</div>
                    <span className="text-[11px] font-semibold text-neutral-800">Gothic Kryžius</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Typography & Text */}
            {activeTab === 'text' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-1">Teksto Redaktorius</h4>
                  <p className="text-[11px] text-neutral-500">Pridėk tekstą ir pasirink jo šriftą bei stilių:</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => addText('DIDELĖ ANTRAŠTĖ')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 text-left font-display font-extrabold text-base text-neutral-900"
                  >
                    + Didelė antraštė
                  </button>
                  <button
                    onClick={() => addText('VILNIUS TECHWEAR', 'stitch')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 text-left font-mono text-xs text-amber-600 font-bold"
                  >
                    + Siuvinėtas techninis tekstas
                  </button>
                  <button
                    onClick={() => addText('CYBER SHIFT', 'glow')}
                    className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 text-left font-display text-sm text-sky-600 font-bold"
                  >
                    + Neoninis švytintis tekstas
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Freehand Draw & Stitch */}
            {activeTab === 'draw' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-1">Laisvas Piešimas & Siūlės</h4>
                  <p className="text-[11px] text-neutral-500">Vilk pele ant drobės, kad pieštum ar siuvinėtum:</p>
                </div>

                {/* Tool choices */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDrawTool('stitch')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                      drawTool === 'stitch' ? 'bg-amber-100 border-amber-400 font-bold text-amber-900' : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Feather className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px]">Siūlės (Stitch)</span>
                  </button>

                  <button
                    onClick={() => setDrawTool('spray')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                      drawTool === 'spray' ? 'bg-amber-100 border-amber-400 font-bold text-amber-900' : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4 text-red-500" />
                    <span className="text-[11px]">Graffiti Spray</span>
                  </button>

                  <button
                    onClick={() => setDrawTool('brush')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                      drawTool === 'brush' ? 'bg-amber-100 border-amber-400 font-bold text-amber-900' : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4 text-sky-500" />
                    <span className="text-[11px]">Teptukas</span>
                  </button>

                  <button
                    onClick={() => setDrawTool('eraser')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                      drawTool === 'eraser' ? 'bg-amber-100 border-amber-400 font-bold text-amber-900' : 'bg-white border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Eraser className="w-4 h-4 text-neutral-600" />
                    <span className="text-[11px]">Trintukas</span>
                  </button>
                </div>

                {/* Brush Width Slider */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Storis:</span>
                    <span className="font-mono">{drawWidth} px</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={28}
                    value={drawWidth}
                    onChange={(e) => setDrawWidth(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Color Palette for Drawing */}
                <div>
                  <div className="text-xs text-neutral-600 mb-2 font-medium">Siūlo / Dažų spalva:</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {FASHION_PALETTE.slice(0, 18).map((col) => (
                      <button
                        key={col}
                        onClick={() => setDrawColor(col)}
                        className={`w-7 h-7 rounded-lg border transition ${
                          drawColor === col ? 'ring-2 ring-amber-500 scale-110 border-white' : 'border-neutral-300'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Upload Photo / Logo */}
            {activeTab === 'upload' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-1">Įkelti Savo Nuotrauką</h4>
                  <p className="text-[11px] text-neutral-500">Įkelk savo PNG, JPG logotipą ar nuotrauką ant drabužio:</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-amber-400 rounded-2xl bg-amber-50/50 hover:bg-amber-100/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-amber-900"
                >
                  <Upload className="w-8 h-8 text-amber-500" />
                  <span className="text-xs font-bold">Pasirinkti failą iš kompiuterio</span>
                  <span className="text-[10px] text-neutral-500">PNG su skaidriu fonu, JPG arba SVG</span>
                </button>
              </div>
            )}

            {/* Tab: Curated Templates */}
            {activeTab === 'templates' && (
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-1">Paruošti Šablonai</h4>
                  <p className="text-[11px] text-neutral-500">Vieno paspaudimo mados dizainai:</p>
                </div>

                <button
                  onClick={() => loadPreset('cyber')}
                  className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-sky-400 text-left shadow-sm transition"
                >
                  <div className="text-xs font-bold text-sky-600">Cyberpunk Vilnius 8-Star</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Futuristinė žvaigždė & koordinatės</div>
                </button>

                <button
                  onClick={() => loadPreset('varsity')}
                  className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-400 text-left shadow-sm transition"
                >
                  <div className="text-xs font-bold text-amber-600">Vintage Varsity 1996</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Lenktas lanko tekstas & herbas</div>
                </button>

                <button
                  onClick={() => loadPreset('flames')}
                  className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-red-400 text-left shadow-sm transition"
                >
                  <div className="text-xs font-bold text-red-600">Streetwear Flame Rebel</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Ugnies grafika & brūkšninis kodas</div>
                </button>

                <button
                  onClick={() => loadPreset('heritage')}
                  className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-amber-500 text-left shadow-sm transition"
                >
                  <div className="text-xs font-bold text-amber-700">Baltic Modern Heritage</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Gedimino stulpai & Lietuva</div>
                </button>

                <button
                  onClick={() => loadPreset('smile')}
                  className="p-3 rounded-xl bg-white border border-neutral-200 hover:border-yellow-400 text-left shadow-sm transition"
                >
                  <div className="text-xs font-bold text-yellow-600">Acid Smile Y2K</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Pozityvi gatvės estetika</div>
                </button>
              </div>
            )}
          </div>

          {/* Center Main Canvas Board (Bright, Clean, High Productivity) */}
          <div className="flex-1 flex flex-col bg-slate-100 p-5 overflow-auto relative">
            {/* Top Element Floating Toolbar (When item is selected) */}
            {selectedElement ? (
              <div className="mb-3 p-2.5 rounded-2xl bg-white border border-neutral-200 shadow-md flex flex-wrap items-center gap-2.5 text-xs">
                {/* Text editing field */}
                {selectedElement.type === 'text' && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setElements((prev) =>
                          prev.map((el) => (el.id === selectedElement.id ? { ...el, text: val } : el))
                        );
                      }}
                      className="px-2.5 py-1.5 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-900 text-xs w-36 font-medium focus:ring-1 focus:ring-amber-400 outline-none"
                    />

                    {/* Font Family Selector */}
                    <select
                      value={selectedElement.fontFamily || 'Outfit'}
                      onChange={(e) => {
                        const font = e.target.value;
                        setElements((prev) =>
                          prev.map((el) => (el.id === selectedElement.id ? { ...el, fontFamily: font } : el))
                        );
                      }}
                      className="px-2 py-1.5 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-900 text-xs font-medium cursor-pointer"
                    >
                      <option value="Outfit">Outfit (Modern)</option>
                      <option value="Space Mono">Space Mono (Tech)</option>
                      <option value="Impact">Impact (Streetwear)</option>
                      <option value="Playfair Display">Playfair (Serif)</option>
                      <option value="Courier New">Courier (Typewriter)</option>
                    </select>

                    {/* Curved Arc text toggle & slider */}
                    <button
                      onClick={() => {
                        setElements((prev) =>
                          prev.map((el) =>
                            el.id === selectedElement.id
                              ? { ...el, isCurved: !el.isCurved, curveRadius: el.curveRadius || 140 }
                              : el
                          )
                        );
                      }}
                      className={`px-2 py-1 rounded-lg border text-xs font-medium transition ${
                        selectedElement.isCurved ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold' : 'border-neutral-200 text-neutral-600'
                      }`}
                      title="Lenkti tekstą lanku"
                    >
                      ⌒ Lankas
                    </button>
                  </div>
                )}

                {/* Fill Color Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 text-[11px]">Spalva:</span>
                  <input
                    type="color"
                    value={selectedElement.fill.startsWith('#') ? selectedElement.fill : '#ffffff'}
                    onChange={(e) => {
                      const col = e.target.value;
                      setElements((prev) =>
                        prev.map((el) => (el.id === selectedElement.id ? { ...el, fill: col } : el))
                      );
                    }}
                    className="w-7 h-7 rounded-lg border border-neutral-300 cursor-pointer bg-transparent"
                  />
                </div>

                {/* Stroke Color & Width */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 text-[11px]">Apvadas:</span>
                  <input
                    type="color"
                    value={selectedElement.stroke.startsWith('#') ? selectedElement.stroke : '#f59e0b'}
                    onChange={(e) => {
                      const col = e.target.value;
                      setElements((prev) =>
                        prev.map((el) =>
                          el.id === selectedElement.id ? { ...el, stroke: col, strokeWidth: el.strokeWidth || 3 } : el
                        )
                      );
                    }}
                    className="w-7 h-7 rounded-lg border border-neutral-300 cursor-pointer bg-transparent"
                  />
                  <input
                    type="range"
                    min={0}
                    max={12}
                    value={selectedElement.strokeWidth || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setElements((prev) =>
                        prev.map((el) => (el.id === selectedElement.id ? { ...el, strokeWidth: val } : el))
                      );
                    }}
                    className="w-16 accent-amber-500"
                    title="Apvado storis"
                  />
                </div>

                {/* Scale / Size Slider */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 text-[11px]">Dydis:</span>
                  <input
                    type="range"
                    min={30}
                    max={500}
                    value={selectedElement.width}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setElements((prev) =>
                        prev.map((el) =>
                          el.id === selectedElement.id
                            ? {
                                ...el,
                                width: val,
                                height:
                                  el.type === 'text'
                                    ? val * 0.25
                                    : el.type === 'image' && el.imageEl
                                    ? val / (el.imageEl.width / el.imageEl.height)
                                    : val,
                                fontSize: el.type === 'text' ? Math.round(val * 0.18) : el.fontSize,
                              }
                            : el
                        )
                      );
                    }}
                    className="w-20 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 text-[11px]">Skaidrumas:</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={selectedElement.opacity ?? 1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setElements((prev) =>
                        prev.map((el) => (el.id === selectedElement.id ? { ...el, opacity: val } : el))
                      );
                    }}
                    className="w-16 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Rotate 45° */}
                <button
                  onClick={() => {
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedElement.id ? { ...el, rotation: (el.rotation + 45) % 360 } : el
                      )
                    );
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                  title="Pasukti 45 laipsniais"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Flip Horizontal */}
                <button
                  onClick={() => {
                    setElements((prev) =>
                      prev.map((el) => (el.id === selectedElement.id ? { ...el, flipX: !el.flipX } : el))
                    );
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                  title="Apversti horizontaliai"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>

                {/* Center Horizontal */}
                <button
                  onClick={() => {
                    setElements((prev) =>
                      prev.map((el) => (el.id === selectedElement.id ? { ...el, x: 512 } : el))
                    );
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                  title="Centruoti horizontaliai"
                >
                  <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => {
                    const clone = {
                      ...selectedElement,
                      id: `clone-${Date.now()}`,
                      x: selectedElement.x + 30,
                      y: selectedElement.y + 30,
                    };
                    pushState([...elements, clone]);
                    setSelectedId(clone.id);
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                  title="Dubliuoti elementą"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    const next = elements.filter((el) => el.id !== selectedElement.id);
                    pushState(next);
                    setSelectedId(null);
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-red-50 text-red-600 ml-auto"
                  title="Ištrinti elementą"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="mb-3 text-xs text-neutral-500 font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Spausk ant bet kurio elemento, kad jį perkeltum, padidintum ar keistum spalvą.</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-400">
                  Pozicija: {placement === 'chest' ? 'Krūtinė (Priekis)' : placement === 'back' ? 'Nugara' : 'Kišenė'}
                </div>
              </div>
            )}

            {/* Canvas Stage Workspace */}
            <div className="flex-1 flex items-center justify-center min-h-[380px]">
              <div
                className="relative rounded-2xl shadow-xl overflow-hidden border border-neutral-300"
                style={{
                  backgroundColor:
                    workspaceTheme === 'garment'
                      ? garmentColor
                      : workspaceTheme === 'dark'
                      ? '#121214'
                      : '#ffffff',
                }}
              >
                {/* Seam guide lines simulating real clothing pattern bounds */}
                <div className="absolute inset-5 border border-dashed border-neutral-400/30 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="text-[10px] font-mono text-neutral-400/70 tracking-widest uppercase">
                    SIUVINĖJIMO IR SPAUDOS ZONA // {placement.toUpperCase()}
                  </div>
                  <div className="text-right text-[10px] font-mono text-neutral-400/70 tracking-widest uppercase">
                    1024 × 560 HD TEXTURE
                  </div>
                </div>

                <canvas
                  ref={canvasRef}
                  width={1024}
                  height={560}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="cursor-crosshair touch-none"
                  style={{ width: '600px', height: '328px' }}
                />
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span>HD 1024x560 tekstūra gyvai sinchronizuojama su 3D WebGL modeliu</span>
              <span>Flipukas Studio 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple helper icon components for diamond & triangle
const DiamondIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-5 h-5 rotate-45 border-2 border-current bg-current/10 ${className}`} />
);

const TriangleIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-current ${className}`} />
);
