import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCcw, RefreshCw, Move, Sparkles, Layers, Fingerprint } from 'lucide-react';
import { CustomizationState, FabricMaterial, GarmentType, MacroZone } from '../../types/clothing';
import { buildGarmentModel, GarmentMeshes } from './garmentModels';
import { createPatternCanvasTexture } from './patternGenerators';
import {
  createFabricNormalMap,
  createFabricRoughnessMap,
  createFabricTexture,
  createFabricDisplacementMap,
  createHapticRoughnessMap,
  createRibKnitTexture,
  createStudioHDREnvironment,
  createSneakerSoleNormalMap,
  createSneakerLeatherNormalMap,
} from './textureGenerators';
import { GARMENT_HOTSPOTS, GarmentHotspot } from '../../data/garmentHotspots';
import { HotspotInfoModal } from './HotspotInfoModal';

/**
 * Calculates WCAG relative color luminance to determine whether garment is light or dark
 */
export function calculateColorLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

interface ThreeGarmentViewerProps {
  garmentType: GarmentType;
  customization: CustomizationState;
  activeFabric: FabricMaterial;
  drawingCanvas?: HTMLCanvasElement | null;
  isBrightStudio?: boolean;
  className?: string;
  onSnapshotReady?: (dataUrl: string) => void;
  onLoaded?: () => void;
  onToggleAutoRotate?: () => void;
  arMode?: boolean;
  arScale?: number;
  arElevation?: number;
  hapticFeedback?: boolean;
  onToggleHaptic?: () => void;
  clothPhysics?: boolean;
  clothMotionMode?: 'walk' | 'turn' | 'breeze' | 'idle';
  tourStep?: 'texture' | 'hardware' | 'custom-text' | 'full' | null;
}

export const ThreeGarmentViewer: React.FC<ThreeGarmentViewerProps> = ({
  garmentType,
  customization,
  activeFabric,
  drawingCanvas,
  isBrightStudio = true,
  className = '',
  onSnapshotReady,
  onLoaded,
  onToggleAutoRotate,
  arMode = false,
  arScale = 1.0,
  arElevation = 0.0,
  hapticFeedback = false,
  onToggleHaptic,
  clothPhysics = false,
  clothMotionMode = 'walk',
  tourStep = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const lastHapticVibrateRef = useRef<number>(0);

  // Dynamic references for 60fps render loop
  const clothPhysicsRef = useRef(clothPhysics);
  clothPhysicsRef.current = clothPhysics;
  const clothMotionModeRef = useRef(clothMotionMode);
  clothMotionModeRef.current = clothMotionMode;
  const activeFabricRef = useRef(activeFabric);
  activeFabricRef.current = activeFabric;

  // 3D Technical Hotspots State
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<GarmentHotspot | null>(null);
  const [projectedHotspots, setProjectedHotspots] = useState<
    Array<{ hotspot: GarmentHotspot; x: number; y: number; visible: boolean }>
  >([]);
  const garmentTypeRef = useRef(garmentType);
  garmentTypeRef.current = garmentType;

  // References to Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const garmentMeshesRef = useRef<GarmentMeshes | null>(null);

  // Lighting refs
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const topLightRef = useRef<THREE.DirectionalLight | null>(null);
  const frontLightRef = useRef<THREE.DirectionalLight | null>(null);
  const backLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const innerShadowMeshRef = useRef<THREE.Mesh | null>(null);

  // Interaction / Orbit state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const rotationTargetRef = useRef({ x: 0.05, y: 0 });
  const rotationCurrentRef = useRef({ x: 0.05, y: 0 });

  // Camera targets for presets and Macro zones
  const cameraTargetPos = useRef(new THREE.Vector3(0, 0, 3.2));
  const cameraLookTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Exploded interpolation progress
  const explodedProgressRef = useRef(0);

  // Material instances
  const materialsRef = useRef<{
    primary: THREE.MeshPhysicalMaterial;
    secondary: THREE.MeshPhysicalMaterial;
    accent: THREE.MeshPhysicalMaterial;
    hardware: THREE.MeshStandardMaterial;
    lining: THREE.MeshStandardMaterial;
    customCanvas: THREE.MeshStandardMaterial;
  } | null>(null);

  // Custom canvas texture ref
  const customTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const patternTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 600;

    // 1. Scene - Crystal clear without murky dark fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (Near clip reduced to 0.05 so extreme micro-zoom works seamlessly!)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 50);
    camera.position.set(0, 0.1, 3.2);
    cameraRef.current = camera;

    // 3. Renderer with calibrated brightness
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.debug.checkShaderErrors = false;
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35; // Bright, crisp exposure
    rendererRef.current = renderer;

    // 4. Radiant High-Key Studio Lighting System (Ultra-bright & crystal clear)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 3.2);
    keyLight.position.set(3.5, 6, 4.5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    fillLight.position.set(-4, 3.5, 2.5);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Direct Front Illuminator: ensures chest prints, embroidery and fabric seams pop brilliantly
    const frontLight = new THREE.DirectionalLight(0xffffff, 2.0);
    frontLight.position.set(0, 1.2, 4.5);
    scene.add(frontLight);
    frontLightRef.current = frontLight;

    // Back Illuminator: ensures back designs and back seams are brightly visible
    const backLight = new THREE.DirectionalLight(0xffffff, 2.0);
    backLight.position.set(0, 1.2, -4.5);
    scene.add(backLight);
    backLightRef.current = backLight;

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Overhead ceiling soft spotlight
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0, 7, 1);
    scene.add(topLight);
    topLightRef.current = topLight;

    // 5. Multi-Layer Floor Platform with Soft Contact Shadows (Zero floating in air)
    const isSneaker = garmentType === 'sneakers';
    const floorY = isSneaker ? -0.22 : -1.6;

    const floorGeo = new THREE.CircleGeometry(2.4, 48);
    const floorMat = new THREE.MeshBasicMaterial({
      color: isBrightStudio ? 0x475569 : 0x09090b,
      transparent: true,
      opacity: isBrightStudio ? 0.12 : 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = floorY;
    scene.add(floor);
    floorMeshRef.current = floor;

    // Direct Inner Contact Shadow disc directly under shoe soles or garment hem
    const innerShadowGeo = new THREE.CircleGeometry(isSneaker ? 1.05 : 1.45, 36);
    const innerShadowMat = new THREE.MeshBasicMaterial({
      color: 0x050507,
      transparent: true,
      opacity: isBrightStudio ? 0.32 : 0.76,
    });
    const innerShadow = new THREE.Mesh(innerShadowGeo, innerShadowMat);
    innerShadow.rotation.x = -Math.PI / 2;
    innerShadow.position.y = floorY + 0.005;
    scene.add(innerShadow);
    innerShadowMeshRef.current = innerShadow;

    // 5.1 Studio HDRI Environment Map (Eliminates flat plastic look, gives softbox gradient reflections)
    const studioEnv = createStudioHDREnvironment();
    scene.environment = studioEnv;

    // 6. Base Materials with PBR Normal, Roughness, and Sheen
    const bumpTex = createFabricTexture('cotton');
    const normalTex = createFabricNormalMap('cotton');
    const roughnessTex = createFabricRoughnessMap('cotton');
    const ribTex = createRibKnitTexture();

    // Custom drawing texture setup
    const initialCanvas = document.createElement('canvas');
    initialCanvas.width = 512;
    initialCanvas.height = 256;
    const initialTex = new THREE.CanvasTexture(initialCanvas);
    initialTex.generateMipmaps = false;
    initialTex.minFilter = THREE.LinearFilter;
    initialTex.magFilter = THREE.LinearFilter;
    initialTex.needsUpdate = true;
    customTextureRef.current = initialTex;

    const materials = {
      primary: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#161618'),
        roughness: 0.84,
        metalness: 0.01,
        bumpMap: bumpTex,
        bumpScale: 0.12,
        normalMap: normalTex,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughnessMap: roughnessTex,
        sheen: 0.9,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color('#38383e'),
      }),
      secondary: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#27272a'),
        roughness: 0.86,
        metalness: 0.01,
        bumpMap: ribTex,
        bumpScale: 0.14,
        sheen: 0.75,
        sheenRoughness: 0.45,
        sheenColor: new THREE.Color('#404045'),
      }),
      accent: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#d97706'),
        roughness: 0.65,
        metalness: 0.08,
        sheen: 0.5,
        sheenRoughness: 0.4,
      }),
      hardware: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#cbd5e1'),
        roughness: 0.22,
        metalness: 0.88,
      }),
      lining: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#3f3f46'),
        roughness: 0.95,
        metalness: 0.0,
      }),
      customCanvas: new THREE.MeshStandardMaterial({
        map: initialTex,
        transparent: true,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    };
    materialsRef.current = materials;

    // 7. Initial Garment Model
    const garmentGroup = new THREE.Group();
    scene.add(garmentGroup);
    garmentGroupRef.current = garmentGroup;

    const meshes = buildGarmentModel(garmentType, materials);
    garmentGroup.add(meshes.root);
    garmentMeshesRef.current = meshes;

    // Notify skeleton screen that initial 3D scene is rendered
    requestAnimationFrame(() => {
      onLoaded?.();
    });

    // Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // 8. Animation & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-turntable rotation if enabled
      if (customization.autoRotate && !isDraggingRef.current) {
        rotationTargetRef.current.y += 0.007;
      }

      // Smooth damping on rotation
      rotationCurrentRef.current.x += (rotationTargetRef.current.x - rotationCurrentRef.current.x) * 0.08;
      rotationCurrentRef.current.y += (rotationTargetRef.current.y - rotationCurrentRef.current.y) * 0.08;

      if (garmentGroupRef.current) {
        garmentGroupRef.current.rotation.x = rotationCurrentRef.current.x;
        garmentGroupRef.current.rotation.y = rotationCurrentRef.current.y;
      }

      // Smooth camera interpolation towards target (including micro zoom!)
      camera.position.lerp(cameraTargetPos.current, 0.08);
      camera.lookAt(cameraLookTarget.current);

      // Smooth exploded view interpolation
      const targetExploded = customization.exploded ? 1 : 0;
      explodedProgressRef.current += (targetExploded - explodedProgressRef.current) * 0.08;
      const expProg = explodedProgressRef.current;

      const currentMeshes = garmentMeshesRef.current;
      if (currentMeshes) {
        if (currentMeshes.leftSleeveGroup) {
          currentMeshes.leftSleeveGroup.position.x = -0.82 - expProg * 0.45;
          currentMeshes.leftSleeveGroup.position.y = 0.60 + expProg * 0.1;
        }
        if (currentMeshes.rightSleeveGroup) {
          currentMeshes.rightSleeveGroup.position.x = 0.82 + expProg * 0.45;
          currentMeshes.rightSleeveGroup.position.y = 0.60 + expProg * 0.1;
        }
        if (currentMeshes.hoodGroup) {
          currentMeshes.hoodGroup.position.y = expProg * 0.4;
        }
        if (currentMeshes.frontPanelGroup) {
          currentMeshes.frontPanelGroup.position.z = expProg * 0.35;
        }
      }

      // Real-time Cloth Physics Drape & Movement Simulation
      if (garmentGroupRef.current && !customization.exploded) {
        const t = clock.getElapsedTime();
        const fabric = activeFabricRef.current;

        // Fabric drape fluidity factor based on textile properties
        let fluidity = 1.0;
        if (fabric?.textureType === 'silk') fluidity = 1.6;
        else if (fabric?.textureType === 'denim') fluidity = 0.62;
        else if (fabric?.textureType === 'wool') fluidity = 1.15;
        else if (fabric?.textureType === 'ripstop') fluidity = 0.85;
        else if (fabric?.textureType === 'neoprene') fluidity = 0.75;

        if (clothPhysicsRef.current) {
          const mode = clothMotionModeRef.current;

          if (mode === 'walk') {
            // Model Walking: rhythmic harmonic arm swings and gait bounce
            const walkSpeed = 3.6;
            const armSwing = Math.sin(t * walkSpeed) * (0.32 * fluidity);

            if (currentMeshes?.leftSleeveGroup) {
              currentMeshes.leftSleeveGroup.rotation.x = armSwing;
              currentMeshes.leftSleeveGroup.rotation.z = -0.06 + Math.cos(t * walkSpeed) * (0.05 * fluidity);
            }
            if (currentMeshes?.rightSleeveGroup) {
              currentMeshes.rightSleeveGroup.rotation.x = -armSwing;
              currentMeshes.rightSleeveGroup.rotation.z = 0.06 - Math.cos(t * walkSpeed) * (0.05 * fluidity);
            }

            // Hip sway & stride bounce
            const gaitBounce = Math.abs(Math.sin(t * walkSpeed)) * 0.045 - 0.02;
            const hipSway = Math.sin(t * (walkSpeed * 0.5)) * (0.035 * fluidity);
            const torsoRoll = Math.sin(t * (walkSpeed * 0.5)) * (0.045 * fluidity);

            garmentGroupRef.current.position.y = gaitBounce;
            garmentGroupRef.current.position.x = hipSway;
            garmentGroupRef.current.rotation.z = torsoRoll;
            garmentGroupRef.current.rotation.x = rotationCurrentRef.current.x + Math.sin(t * walkSpeed) * 0.025;

            // Trailing hem lag wave
            if (currentMeshes?.frontPanelGroup) {
              currentMeshes.frontPanelGroup.position.z = Math.sin(t * walkSpeed) * (0.025 * fluidity);
            }
          } else if (mode === 'turn') {
            // Runway Spin: dynamic 360 rotation with centrifugal fabric flair & drape inertia
            rotationTargetRef.current.y += 0.024;

            const flair = 0.20 + 0.16 * fluidity;
            const turnSway = Math.sin(t * 2.8) * (0.04 * fluidity);

            if (currentMeshes?.leftSleeveGroup) {
              currentMeshes.leftSleeveGroup.rotation.z = -flair - turnSway;
              currentMeshes.leftSleeveGroup.rotation.x = -0.14 * fluidity;
            }
            if (currentMeshes?.rightSleeveGroup) {
              currentMeshes.rightSleeveGroup.rotation.z = flair + turnSway;
              currentMeshes.rightSleeveGroup.rotation.x = 0.14 * fluidity;
            }

            // Front panel & hem centrifugal wave
            if (currentMeshes?.frontPanelGroup) {
              currentMeshes.frontPanelGroup.position.z = 0.025 * fluidity + Math.sin(t * 3.4) * (0.018 * fluidity);
            }
            if (currentMeshes?.hoodGroup) {
              currentMeshes.hoodGroup.rotation.x = -0.05 * fluidity;
            }

            garmentGroupRef.current.position.y = Math.sin(t * 2.2) * 0.018;
            garmentGroupRef.current.position.x = Math.sin(t * 2.8) * (0.012 * fluidity);
            garmentGroupRef.current.rotation.z = Math.sin(t * 2.8) * (0.015 * fluidity);
          } else if (mode === 'breeze') {
            // Wind Gusts: aerodynamic fluttering in direction of the wind
            const wind = (Math.sin(t * 5.2) * 0.08 + Math.cos(t * 11.4) * 0.035) * fluidity;

            if (currentMeshes?.leftSleeveGroup) {
              currentMeshes.leftSleeveGroup.rotation.x = wind * 1.5;
              currentMeshes.leftSleeveGroup.rotation.z = -0.06 + wind * 0.7;
            }
            if (currentMeshes?.rightSleeveGroup) {
              currentMeshes.rightSleeveGroup.rotation.x = wind * 1.5;
              currentMeshes.rightSleeveGroup.rotation.z = 0.06 + wind * 0.7;
            }

            garmentGroupRef.current.rotation.z = wind * 0.45;
            garmentGroupRef.current.position.y = Math.sin(t * 2.5) * 0.01;
            garmentGroupRef.current.position.x = wind * 0.15;
          } else {
            // Idle Drape
            const breath = Math.sin(t * 1.6) * 0.008;
            garmentGroupRef.current.position.y = breath;
            garmentGroupRef.current.position.x = 0;
            garmentGroupRef.current.rotation.z = 0;
            if (currentMeshes?.leftSleeveGroup) {
              currentMeshes.leftSleeveGroup.rotation.x = 0;
              currentMeshes.leftSleeveGroup.rotation.z = 0;
            }
            if (currentMeshes?.rightSleeveGroup) {
              currentMeshes.rightSleeveGroup.rotation.x = 0;
              currentMeshes.rightSleeveGroup.rotation.z = 0;
            }
          }
        } else {
          // Standard Natural breathing when cloth physics is OFF
          const breath = Math.sin(t * 1.6) * 0.008;
          garmentGroupRef.current.position.y = breath;
          garmentGroupRef.current.position.x = 0;
          garmentGroupRef.current.rotation.z = 0;
          if (currentMeshes?.leftSleeveGroup) {
            currentMeshes.leftSleeveGroup.rotation.x = 0;
            currentMeshes.leftSleeveGroup.rotation.z = 0;
          }
          if (currentMeshes?.rightSleeveGroup) {
            currentMeshes.rightSleeveGroup.rotation.x = 0;
            currentMeshes.rightSleeveGroup.rotation.z = 0;
          }
        }
      }

      // Update 3D Hotspot Screen Projections (every 2 frames for smooth positioning)
      frameCount++;
      if (frameCount % 2 === 0) {
        const spots = GARMENT_HOTSPOTS[garmentTypeRef.current] || [];
        if (garmentGroupRef.current && cameraRef.current && spots.length > 0) {
          const gGroup = garmentGroupRef.current;
          const cam = cameraRef.current;

          const updated = spots.map((spot) => {
            const v = new THREE.Vector3(...spot.position);
            v.applyEuler(gGroup.rotation);
            v.add(gGroup.position);

            const toCamera = cam.position.clone().sub(v).normalize();
            const normal = v.clone().normalize();
            const dot = normal.dot(toCamera);

            v.project(cam);
            const x = (v.x * 0.5 + 0.5) * 100;
            const y = (-v.y * 0.5 + 0.5) * 100;
            const inFront = v.z < 1.0 && dot > -0.35;

            return {
              hotspot: spot,
              x,
              y,
              visible: inFront,
            };
          });

          setProjectedHotspots(updated);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, []);

  // Update Drawing Canvas Texture when user stitches, draws, or reverts/undoes
  useEffect(() => {
    if (!materialsRef.current) return;

    if (!drawingCanvas) {
      if (customTextureRef.current) {
        customTextureRef.current.dispose();
        customTextureRef.current = null;
      }
      materialsRef.current.customCanvas.map = null;
      materialsRef.current.customCanvas.needsUpdate = true;
      return;
    }

    if (customTextureRef.current) {
      customTextureRef.current.dispose();
    }
    const newTex = new THREE.CanvasTexture(drawingCanvas);
    newTex.generateMipmaps = false;
    newTex.minFilter = THREE.LinearFilter;
    newTex.magFilter = THREE.LinearFilter;
    newTex.needsUpdate = true;
    customTextureRef.current = newTex;
    materialsRef.current.customCanvas.map = newTex;
    materialsRef.current.customCanvas.needsUpdate = true;
  }, [drawingCanvas]);

  // Update Garment Model when garmentType changes
  useEffect(() => {
    if (!garmentGroupRef.current || !materialsRef.current) return;

    while (garmentGroupRef.current.children.length > 0) {
      garmentGroupRef.current.remove(garmentGroupRef.current.children[0]);
    }

    const meshes = buildGarmentModel(garmentType, materialsRef.current);
    garmentGroupRef.current.add(meshes.root);
    garmentMeshesRef.current = meshes;
    requestAnimationFrame(() => {
      onLoaded?.();
    });
  }, [garmentType, onLoaded]);

  // Update Materials & Textures when customization changes
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats) return;

    const fabricTex = createFabricTexture(activeFabric.textureType);
    const normalTex = createFabricNormalMap(activeFabric.textureType);
    const roughnessTex = createFabricRoughnessMap(activeFabric.textureType);

    mats.primary.bumpMap = fabricTex;
    mats.primary.color.set(customization.primaryColor);
    mats.primary.wireframe = customization.wireframe;
    mats.primary.metalness = activeFabric.metalness;

    // Visual Haptic Feedback: Apply subtle displacement maps and shader roughness variations
    if (hapticFeedback) {
      const dispTex = createFabricDisplacementMap(activeFabric.textureType);
      mats.primary.displacementMap = dispTex;
      mats.primary.displacementScale = 0.024;
      mats.primary.displacementBias = -0.012;

      const hapticRoughness = createHapticRoughnessMap(activeFabric.textureType);
      mats.primary.roughnessMap = hapticRoughness;
      mats.primary.roughness = Math.min(1.0, activeFabric.roughness + 0.06);

      mats.primary.bumpScale = (activeFabric.bumpScale || 0.12) * 1.85;
      mats.primary.normalScale = new THREE.Vector2(1.35, 1.35);
    } else {
      mats.primary.displacementMap = null;
      mats.primary.displacementScale = 0;
      mats.primary.displacementBias = 0;
      mats.primary.bumpScale = activeFabric.bumpScale;
      mats.primary.normalScale = new THREE.Vector2(0.85, 0.85);
      mats.primary.roughnessMap = roughnessTex;
      mats.primary.roughness = activeFabric.roughness;
    }

    // PBR Sheen / Microfiber cloth fuzz effect
    mats.primary.sheen = activeFabric.textureType === 'silk' ? 0.4 : 0.9;
    mats.primary.sheenRoughness = 0.38;
    mats.primary.sheenColor = new THREE.Color(customization.primaryColor).clone().offsetHSL(0, 0, 0.15);

    // Clearcoat for leather / technical rainproof
    if (activeFabric.textureType === 'leather') {
      mats.primary.clearcoat = 0.35;
      mats.primary.clearcoatRoughness = 0.25;
    } else {
      mats.primary.clearcoat = 0.0;
    }

    // High-Fidelity Sneaker Specialized PBR Maps (Tumbled leather upper & vulcanized rubber sole)
    if (garmentType === 'sneakers') {
      const sneakerLeatherNorm = createSneakerLeatherNormalMap();
      const sneakerSoleNorm = createSneakerSoleNormalMap();

      mats.primary.bumpMap = null;
      mats.primary.normalMap = sneakerLeatherNorm;
      mats.primary.normalScale = new THREE.Vector2(1.15, 1.15);
      mats.primary.roughness = 0.48;
      mats.primary.metalness = 0.04;
      mats.primary.clearcoat = 0.22;
      mats.primary.clearcoatRoughness = 0.25;

      mats.secondary.bumpMap = null;
      mats.secondary.normalMap = sneakerSoleNorm;
      mats.secondary.normalScale = new THREE.Vector2(1.25, 1.25);
      mats.secondary.roughness = 0.84;
      mats.secondary.metalness = 0.02;

      mats.accent.bumpMap = null;
      mats.accent.normalMap = sneakerSoleNorm;
      mats.accent.normalScale = new THREE.Vector2(1.1, 1.1);
      mats.accent.roughness = 0.78;
    }

    mats.primary.needsUpdate = true;

    // Custom Pattern Texture handling (supports layer visibility toggle)
    if (customization.pattern && customization.pattern.type !== 'none' && customization.pattern.visible !== false) {
      if (patternTextureRef.current) {
        patternTextureRef.current.dispose();
      }
      const patTex = createPatternCanvasTexture(customization.pattern, customization.primaryColor);
      patternTextureRef.current = patTex;
      mats.primary.map = patTex;
    } else {
      if (patternTextureRef.current) {
        patternTextureRef.current.dispose();
        patternTextureRef.current = null;
      }
      mats.primary.map = null;
    }

    mats.secondary.color.set(customization.secondaryColor);
    mats.secondary.wireframe = customization.wireframe;
    mats.secondary.needsUpdate = true;

    mats.accent.color.set(customization.accentColor);
    mats.accent.wireframe = customization.wireframe;
    mats.accent.needsUpdate = true;

    mats.hardware.color.set(customization.hardwareColor);
    mats.hardware.metalness = 0.9;
    mats.hardware.roughness = 0.22;
    mats.hardware.wireframe = customization.wireframe;
    mats.hardware.needsUpdate = true;

    mats.lining.wireframe = customization.wireframe;

    // Multi-Layer Contact Shadow grounding on floor
    if (floorMeshRef.current && innerShadowMeshRef.current) {
      const isSneaker = garmentType === 'sneakers';
      const floorY = isSneaker ? -0.22 : -1.6;

      floorMeshRef.current.position.y = floorY;
      innerShadowMeshRef.current.position.y = floorY + 0.005;

      const floorMat = floorMeshRef.current.material as THREE.MeshBasicMaterial;
      const innerMat = innerShadowMeshRef.current.material as THREE.MeshBasicMaterial;

      const lum = calculateColorLuminance(customization.primaryColor);
      const isAuto = !customization.studioTheme || (customization.studioTheme as string) === 'auto';
      // Contrast rule: If garment is dark, studio is bright; if garment is light, studio is dark
      const isEffectiveBright = isAuto ? lum <= 0.42 : customization.studioTheme === 'bright';

      if (floorMat && innerMat) {
        if (arMode) {
          floorMat.color.set(0x000000);
          floorMat.opacity = 0.25;
          innerMat.color.set(0x000000);
          innerMat.opacity = 0.45;
          floorMeshRef.current.position.y = floorY + (arElevation || 0);
          innerShadowMeshRef.current.position.y = floorY + 0.005 + (arElevation || 0);
        } else {
          floorMat.color.set(isEffectiveBright ? 0x475569 : 0x09090b);
          floorMat.opacity = isEffectiveBright ? 0.15 : 0.65;
          innerMat.color.set(isEffectiveBright ? 0x1e293b : 0x050507);
          innerMat.opacity = isEffectiveBright ? 0.32 : 0.78;
        }
        floorMat.needsUpdate = true;
        innerMat.needsUpdate = true;
      }
    }

    if (garmentGroupRef.current) {
      const scaleBase = arMode ? (arScale || 1.0) : 1.0;
      const elevation = arMode ? (arElevation || 0.0) : 0.0;
      garmentGroupRef.current.position.y = elevation;

      // Base scaling by standard size
      const sizeScaleMap: Record<string, { sx: number; sy: number; sz: number }> = {
        XS: { sx: 0.90, sy: 0.94, sz: 0.90 },
        S: { sx: 0.95, sy: 0.97, sz: 0.95 },
        M: { sx: 1.00, sy: 1.00, sz: 1.00 },
        L: { sx: 1.06, sy: 1.03, sz: 1.06 },
        XL: { sx: 1.12, sy: 1.06, sz: 1.12 },
        XXL: { sx: 1.18, sy: 1.09, sz: 1.18 },
      };

      let scaleX = 1.0;
      let scaleY = 1.0;
      let scaleZ = 1.0;

      // If custom body measurements are active and applied
      const cm = customization.customMeasurements;
      if (cm && cm.isCustomApplied && cm.chest && cm.height) {
        const chestCm = cm.unit === 'in' ? cm.chest * 2.54 : cm.chest;
        const heightCm = cm.unit === 'in' ? cm.height * 2.54 : cm.height;
        const waistCm = cm.unit === 'in' ? (cm.waist || cm.chest * 0.82) * 2.54 : (cm.waist || cm.chest * 0.82);

        // Reference baseline: Size M (chest: 104cm, height: 178cm, waist: 86cm)
        scaleX = Math.max(0.80, Math.min(1.35, chestCm / 104));
        scaleY = Math.max(0.85, Math.min(1.25, heightCm / 178));
        scaleZ = Math.max(0.80, Math.min(1.35, (chestCm * 0.6 + waistCm * 0.4) / 96.8));
      } else {
        const std = sizeScaleMap[customization.size] || sizeScaleMap.M;
        scaleX = std.sx;
        scaleY = std.sy;
        scaleZ = std.sz;
      }

      // Apply fit silhouette modification (tailored vs regular vs oversized)
      if (customization.fitMode === 'oversized') {
        scaleX *= 1.10;
        scaleY *= 1.02;
        scaleZ *= 1.10;
      } else if (customization.fitMode === 'tailored') {
        scaleX *= 0.92;
        scaleY *= 0.98;
        scaleZ *= 0.90;
      }

      garmentGroupRef.current.scale.set(scaleX * scaleBase, scaleY * scaleBase, scaleZ * scaleBase);
    }
  }, [customization, activeFabric, arMode, arScale, arElevation, hapticFeedback]);

  // Update Lighting Presets with high radiance and brightness multiplier
  useEffect(() => {
    if (!keyLightRef.current || !fillLightRef.current || !rimLightRef.current || !ambientLightRef.current) return;

    const bMult = customization.studioBrightness || 1.0;

    const preset = customization.lightingPreset;

    if (preset === 'neon-night' || preset === 'cyber') {
      // Neon Night: Cyberpunk high-contrast with electric cyan & neon magenta/amber rims
      ambientLightRef.current.color.set(0x18182f);
      ambientLightRef.current.intensity = 1.6 * bMult;

      keyLightRef.current.color.set(0x00f0ff); // Electric cyan
      keyLightRef.current.intensity = 3.6 * bMult;
      keyLightRef.current.position.set(4, 5, 3);

      fillLightRef.current.color.set(0xff007f); // Neon magenta
      fillLightRef.current.intensity = 2.8 * bMult;

      if (frontLightRef.current) {
        frontLightRef.current.color.set(0xffffff);
        frontLightRef.current.intensity = 2.2 * bMult;
      }
      if (backLightRef.current) {
        backLightRef.current.color.set(0x00f0ff);
        backLightRef.current.intensity = 3.0 * bMult;
      }

      rimLightRef.current.color.set(0xfbbf24); // Warm neon amber accent rim
      rimLightRef.current.intensity = 3.2 * bMult;
    } else if (preset === 'golden-hour') {
      // Golden Hour: Rich warm sunset gold, soft sky fill, golden rim highlight
      ambientLightRef.current.color.set(0xffecc4);
      ambientLightRef.current.intensity = 2.2 * bMult;

      keyLightRef.current.color.set(0xff9f43); // Sunset warm gold
      keyLightRef.current.intensity = 3.8 * bMult;
      keyLightRef.current.position.set(4.5, 4.0, 3.5);

      fillLightRef.current.color.set(0x7dd3fc); // Soft blue sky bounce
      fillLightRef.current.intensity = 2.0 * bMult;

      if (frontLightRef.current) {
        frontLightRef.current.color.set(0xffedd5); // Warm peach front
        frontLightRef.current.intensity = 2.4 * bMult;
      }
      if (backLightRef.current) {
        backLightRef.current.color.set(0xf59e0b); // Golden glow back
        backLightRef.current.intensity = 2.8 * bMult;
      }

      rimLightRef.current.color.set(0xfef08a); // Warm sun rim
      rimLightRef.current.intensity = 2.8 * bMult;
    } else if (preset === 'daylight') {
      // Natural Daylight: Clean balanced sun & open sky
      ambientLightRef.current.color.set(0xe0f2fe);
      ambientLightRef.current.intensity = 2.3 * bMult;

      keyLightRef.current.color.set(0xfffff0);
      keyLightRef.current.intensity = 3.4 * bMult;

      fillLightRef.current.color.set(0xf1f5f9);
      fillLightRef.current.intensity = 2.4 * bMult;

      if (frontLightRef.current) {
        frontLightRef.current.color.set(0xffffff);
        frontLightRef.current.intensity = 2.2 * bMult;
      }
      if (backLightRef.current) {
        backLightRef.current.color.set(0xffffff);
        backLightRef.current.intensity = 2.2 * bMult;
      }

      rimLightRef.current.color.set(0xffffff);
      rimLightRef.current.intensity = 2.2 * bMult;
    } else {
      // Studio White (Default - pristine, high-key, ultra-clear product lighting)
      ambientLightRef.current.color.set(0xffffff);
      ambientLightRef.current.intensity = 2.2 * bMult;

      keyLightRef.current.color.set(0xfffbf0);
      keyLightRef.current.intensity = 3.3 * bMult;

      fillLightRef.current.color.set(0xf8fafc);
      fillLightRef.current.intensity = 2.3 * bMult;

      if (frontLightRef.current) {
        frontLightRef.current.color.set(0xffffff);
        frontLightRef.current.intensity = 2.2 * bMult;
      }
      if (backLightRef.current) {
        backLightRef.current.color.set(0xffffff);
        backLightRef.current.intensity = 2.2 * bMult;
      }

      rimLightRef.current.color.set(0xffffff);
      rimLightRef.current.intensity = 2.3 * bMult;
    }

    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = 1.45 * bMult;
    }
  }, [customization.lightingPreset, customization.studioBrightness]);

  // Update Camera Target Preset with micro zoom modes and Macro Zones
  useEffect(() => {
    const isSneaker = garmentType === 'sneakers';
    const targetY = isSneaker ? 0 : 0.05;

    // Guided Tour sequence overrides camera targets with silky-smooth interpolation
    if (tourStep) {
      if (tourStep === 'texture') {
        // Feature 1: Texture Quality & Fabric Weave Close-up
        cameraLookTarget.current.set(0, isSneaker ? 0.2 : 0.18, isSneaker ? 0 : 0.46);
        cameraTargetPos.current.set(0, isSneaker ? 0.22 : 0.20, isSneaker ? 0.65 : 0.95);
        rotationTargetRef.current = { x: 0.08, y: 0.12 };
      } else if (tourStep === 'hardware') {
        // Feature 2: Hardware details (drawstrings, metallic aglets, zippers, eyelets, seams)
        cameraLookTarget.current.set(isSneaker ? 0.25 : -0.22, isSneaker ? 0.15 : 0.25, isSneaker ? 0.2 : 0.38);
        cameraTargetPos.current.set(isSneaker ? 0.35 : -0.18, isSneaker ? 0.25 : 0.32, isSneaker ? 0.75 : 1.10);
        rotationTargetRef.current = { x: 0.10, y: -0.25 };
      } else if (tourStep === 'custom-text') {
        // Feature 3: Custom text placement, monogram or graphic emblem
        const isBack = customization.placement === 'back';
        cameraLookTarget.current.set(0, isSneaker ? 0.15 : 0.26, isBack ? -0.45 : 0.45);
        cameraTargetPos.current.set(0, isSneaker ? 0.18 : 0.28, isBack ? -1.15 : 1.15);
        rotationTargetRef.current = { x: 0.05, y: isBack ? -Math.PI : 0 };
      } else if (tourStep === 'full') {
        // Feature 4: Full Hero Runway 360° dynamic view
        cameraLookTarget.current.set(0, targetY, 0);
        cameraTargetPos.current.set(0, targetY, isSneaker ? 2.8 : 3.2);
        rotationTargetRef.current = { x: 0.05, y: 0.2 };
      }
      return;
    }

    const zone = customization.macroZone;

    if (zone && zone !== 'full') {
      if (zone === 'fabric-weave') {
        // Ultra-Macro focus on thread weave (0.45m distance!)
        cameraLookTarget.current.set(0, isSneaker ? 0.2 : 0.16, isSneaker ? 0 : 0.52);
        cameraTargetPos.current.set(0, isSneaker ? 0.22 : 0.16, isSneaker ? 0.55 : 0.88);
        rotationTargetRef.current = { x: 0.05, y: 0 };
      } else if (zone === 'chest-design') {
        // Macro focus on user design / canvas
        cameraLookTarget.current.set(0, 0.22, 0.52);
        cameraTargetPos.current.set(0, 0.22, 1.15);
        rotationTargetRef.current = { x: 0.06, y: 0 };
      } else if (zone === 'hood-drawstrings') {
        // Macro focus on hood strings
        cameraLookTarget.current.set(-0.16, 0.38, 0.45);
        cameraTargetPos.current.set(-0.16, 0.42, 1.05);
        rotationTargetRef.current = { x: 0.08, y: 0 };
      } else if (zone === 'pocket-seams') {
        // Macro focus on pocket seams
        cameraLookTarget.current.set(0, -0.22, 0.52);
        cameraTargetPos.current.set(0, -0.20, 1.15);
        rotationTargetRef.current = { x: 0.12, y: 0 };
      } else if (zone === 'cuff-elastic') {
        // Macro focus on sleeve cuff
        cameraLookTarget.current.set(-0.82, -0.62, 0);
        cameraTargetPos.current.set(-0.80, -0.55, 0.85);
        rotationTargetRef.current = { x: 0.15, y: 0.35 };
      }
      return;
    }

    const preset = customization.cameraPreset;

    cameraLookTarget.current.set(0, targetY, 0);

    if (preset === 'front') {
      cameraTargetPos.current.set(0, targetY, isSneaker ? 2.8 : 3.2);
      rotationTargetRef.current = { x: 0.04, y: 0 };
    } else if (preset === 'side') {
      cameraTargetPos.current.set(isSneaker ? 2.6 : 3.1, targetY, 0.4);
      rotationTargetRef.current = { x: 0.04, y: -Math.PI / 2 };
    } else if (preset === 'back') {
      cameraTargetPos.current.set(0, targetY, isSneaker ? -2.8 : -3.2);
      rotationTargetRef.current = { x: 0.04, y: -Math.PI };
    } else if (preset === 'detail') {
      // EXTREME MICRO-ZOOM
      cameraLookTarget.current.set(0, isSneaker ? 0.2 : 0.22, 0);
      cameraTargetPos.current.set(0, isSneaker ? 0.25 : 0.22, 0.95);
      rotationTargetRef.current = { x: 0.08, y: 0 };
    } else if (preset === 'iso') {
      cameraTargetPos.current.set(2.2, 1.6, 2.4);
      rotationTargetRef.current = { x: 0.22, y: -0.6 };
    }

    if (customization.placement === 'back' && customization.macroZone === 'full' && preset === 'front') {
      cameraTargetPos.current.set(0, targetY, isSneaker ? -2.8 : -3.2);
      rotationTargetRef.current = { x: 0.04, y: -Math.PI };
    }
  }, [customization.cameraPreset, customization.macroZone, customization.placement, garmentType, tourStep]);

  // Pointer Interaction Handlers for 360 Orbit, Smooth Pan, and Multi-Touch Pinch
  const handlePointerDown = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsInteracting(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (activePointersRef.current.size === 1) {
      // Check if it's a pan trigger: right click (button 2), middle click (button 1), or Shift+drag
      const isPan = e.button === 2 || e.button === 1 || e.shiftKey;
      isPanningRef.current = isPan;
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (activePointersRef.current.size === 2) {
      // 2-finger pinch gesture start
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1 && isDraggingRef.current) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      if (isPanningRef.current) {
        // Pan: smoothly offset camera target and position
        cameraLookTarget.current.x -= deltaX * 0.003;
        cameraLookTarget.current.y += deltaY * 0.003;
        cameraTargetPos.current.x -= deltaX * 0.003;
        cameraTargetPos.current.y += deltaY * 0.003;
      } else {
        // 360 Orbit rotation
        rotationTargetRef.current.y += deltaX * 0.007;
        const newX = rotationTargetRef.current.x + deltaY * 0.005;
        rotationTargetRef.current.x = Math.max(-0.6, Math.min(0.6, newX));

        if (hapticFeedback && 'vibrate' in navigator) {
          const now = performance.now();
          if (!lastHapticVibrateRef.current || now - lastHapticVibrateRef.current > 140) {
            lastHapticVibrateRef.current = now;
            try {
              navigator.vibrate?.(8);
            } catch {
              // ignore
            }
          }
        }
      }

      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (activePointersRef.current.size === 2 && pinchStartDistRef.current !== null) {
      // 2-finger pinch-to-zoom
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const deltaDist = pinchStartDistRef.current - currentDist;

      const currentLen = cameraTargetPos.current.length();
      const newDist = Math.max(0.85, Math.min(5.0, currentLen + deltaDist * 0.006));
      cameraTargetPos.current.setLength(newDist);
      pinchStartDistRef.current = currentDist;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      isDraggingRef.current = false;
      isPanningRef.current = false;
      pinchStartDistRef.current = null;
      setIsInteracting(false);
    }
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Micro-Zoom Wheel Handler: safe distance 0.85m to 5.0m prevents inner mesh clipping
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.002;
    const currentLen = cameraTargetPos.current.length();
    const newDist = currentLen + zoomFactor;
    if (newDist >= 0.85 && newDist <= 5.0) {
      cameraTargetPos.current.setLength(newDist);
    }
  };

  // Quick Zoom and Reset Actions
  const handleZoomIn = () => {
    const curLen = cameraTargetPos.current.length();
    const nextLen = Math.max(0.85, curLen * 0.82);
    cameraTargetPos.current.setLength(nextLen);
  };

  const handleZoomOut = () => {
    const curLen = cameraTargetPos.current.length();
    const nextLen = Math.min(4.8, curLen * 1.22);
    cameraTargetPos.current.setLength(nextLen);
  };

  const handleResetCamera = () => {
    const isSneaker = garmentType === 'sneakers';
    cameraLookTarget.current.set(0, isSneaker ? 0 : 0.05, 0);
    cameraTargetPos.current.set(0, isSneaker ? 0 : 0.05, isSneaker ? 2.8 : 3.2);
    rotationTargetRef.current = { x: 0.05, y: 0 };
  };

  const handleFocusHotspot = (hotspot: GarmentHotspot) => {
    const [hx, hy, hz] = hotspot.position;
    cameraLookTarget.current.set(hx * 0.35, hy * 0.85, hz * 0.35);
    cameraTargetPos.current.set(hx * 0.65, hy + 0.15, Math.max(1.15, hz + 1.35));
  };

  const lum = calculateColorLuminance(customization.primaryColor);
  const isAutoContrast = !customization.studioTheme || (customization.studioTheme as string) === 'auto';
  const isLightGarment = lum > 0.42;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => e.preventDefault()} // Allow right-click pan without context menu popup
      className={`relative w-full h-full min-h-[460px] select-none overflow-hidden touch-none ${className}`}
    >
      <canvas
        id="three-garment-canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full canvas-grab touch-none"
      />

      {/* 3D Interactive Technical Hotspots (Click to view fabric & construction) */}
      {showHotspots && !customization.exploded && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {projectedHotspots.map(({ hotspot, x, y, visible }, idx) => {
            if (!visible) return null;
            return (
              <div
                key={hotspot.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-75 group"
              >
                <button
                  type="button"
                  onClick={() => setActiveHotspot(hotspot)}
                  className="relative flex items-center justify-center p-2 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title={`${hotspot.title} — Spustelėk peržiūrėti specifikaciją`}
                >
                  {/* Outer Pulsing Wave Ring */}
                  <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping opacity-75" />

                  {/* Middle Glow Ring */}
                  <span className="absolute -inset-1 rounded-full bg-amber-500/30 blur-xs" />

                  {/* Core Pin */}
                  <span className="relative w-6 h-6 rounded-full bg-neutral-950 border-2 border-amber-400 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-all">
                    {idx + 1}
                  </span>

                  {/* Hover Tag Tooltip */}
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-neutral-950/95 border border-neutral-700/80 text-white text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{hotspot.title}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating 3D Navigation HUD (Hotspots Toggle, Zoom In, Zoom Out, Reset, Rotate) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800 shadow-xl">
        {/* Toggle 3D Hotspots Button */}
        <button
          type="button"
          onClick={() => setShowHotspots((prev) => !prev)}
          title={showHotspots ? 'Paslėpti techninius 3D taškus' : 'Rodyti techninius 3D taškus'}
          className={`p-2 rounded-lg transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
            showHotspots
              ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono hidden sm:inline">
            {showHotspots ? 'Taškai (ON)' : 'Taškai (OFF)'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Priartinti (Zoom +)"
          className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white transition cursor-pointer active:scale-95"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Nutolinti (Zoom -)"
          className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white transition cursor-pointer active:scale-95"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetCamera}
          title="Atstatyti kamerą į pradinę poziciją"
          className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white transition cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Visual Haptic Feedback Toggle Button */}
        {onToggleHaptic && (
          <button
            type="button"
            onClick={onToggleHaptic}
            title={
              hapticFeedback
                ? 'Išjungti vizualią haptiką (Displacement & Roughness ON)'
                : 'Įjungti vizualią haptiką (Displacement & Roughness OFF)'
            }
            className={`p-2 rounded-lg transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              hapticFeedback
                ? 'bg-emerald-400 text-neutral-950 font-bold shadow-md'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono hidden sm:inline">
              {hapticFeedback ? 'Haptika (ON)' : 'Haptika (OFF)'}
            </span>
          </button>
        )}

        {onToggleAutoRotate && (
          <button
            type="button"
            onClick={onToggleAutoRotate}
            title={customization.autoRotate ? 'Sustabdyti sukimąsi' : '360° Automatinis sukimas'}
            className={`p-2 rounded-lg transition cursor-pointer active:scale-95 ${
              customization.autoRotate
                ? 'bg-amber-400 text-neutral-950'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${customization.autoRotate ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Visual Haptic Active Badge */}
      {hapticFeedback && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-[11px] font-mono flex items-center gap-2 shadow-xl animate-fadeIn">
          <Fingerprint className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Haptinis Režimas: Audinio reljefas & mikro-roughness aktyvūs</span>
        </div>
      )}

      {/* 3D Hotspot Technical Spec Modal */}
      <HotspotInfoModal
        hotspot={activeHotspot}
        onClose={() => setActiveHotspot(null)}
        onFocusHotspot={handleFocusHotspot}
        onNext={() => {
          const spots = GARMENT_HOTSPOTS[garmentType] || [];
          const curIdx = spots.findIndex((s) => s.id === activeHotspot?.id);
          const next = spots[(curIdx + 1) % spots.length];
          setActiveHotspot(next);
          handleFocusHotspot(next);
        }}
        onPrev={() => {
          const spots = GARMENT_HOTSPOTS[garmentType] || [];
          const curIdx = spots.findIndex((s) => s.id === activeHotspot?.id);
          const prev = spots[(curIdx - 1 + spots.length) % spots.length];
          setActiveHotspot(prev);
          handleFocusHotspot(prev);
        }}
      />

      {/* Dynamic AI Contrast & Interaction Hint Bar */}
      <div
        className={`absolute bottom-4 left-4 transition-opacity duration-300 pointer-events-none text-xs text-neutral-400 font-mono flex items-center gap-2 flex-wrap ${
          isInteracting ? 'opacity-30' : isHovered ? 'opacity-95' : 'opacity-70'
        }`}
      >
        <span className="px-2 py-0.5 rounded bg-neutral-950/80 border border-neutral-800 text-[10px] text-neutral-300">
          360° Sukti · Dešinys / Shift: Pan
        </span>

        {isAutoContrast && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Kontrastas: {isLightGarment ? 'Tamsi studija (Šviesiam modeliui)' : 'Šviesi studija (Tamsiam modeliui)'}</span>
          </span>
        )}
      </div>
    </div>
  );
};
