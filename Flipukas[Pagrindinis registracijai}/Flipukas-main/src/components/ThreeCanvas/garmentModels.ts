import * as THREE from 'three';
import { GarmentType } from '../../types/clothing';

export interface GarmentMeshes {
  root: THREE.Group;
  bodyMeshes: THREE.Mesh[];
  sleeveMeshes: THREE.Mesh[];
  accentMeshes: THREE.Mesh[];
  hardwareMeshes: THREE.Mesh[];
  customCanvasMesh: THREE.Mesh | null;
  backCanvasMesh?: THREE.Mesh | null;
  liningMeshes: THREE.Mesh[];
  leftSleeveGroup?: THREE.Group;
  rightSleeveGroup?: THREE.Group;
  hoodGroup?: THREE.Group;
  frontPanelGroup?: THREE.Group;
}

/**
 * Creates high-detail organic cloth mesh with realistic wrinkles, seams, and drapery (simulating Marvelous Designer mesh drape)
 */
function createOrganicClothCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments = 64,
  heightSegments = 48,
  foldIntensity = 0.038
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, true);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Normalized Y coordinate (0 at bottom, 1 at top)
    const normY = (v.y + height / 2) / height;
    const angle = Math.atan2(v.z, v.x);

    // 1. Natural horizontal cloth drape creases & gravity sag
    const primaryWrinkle = Math.sin(normY * Math.PI * 6) * Math.cos(angle * 3) * foldIntensity;
    const secondaryWrinkle = Math.cos(normY * Math.PI * 4 + angle * 2) * (foldIntensity * 0.7);

    // 2. High-frequency micro-creases (textile drape tension)
    const microCrease = Math.sin(normY * 28 + angle * 5) * (foldIntensity * 0.28);

    // 3. Natural anatomical chest & back protrusion
    const isFront = angle > -Math.PI / 2 && angle < Math.PI / 2;
    const chestProtrusion = isFront ? Math.sin(normY * Math.PI) * 0.055 : 0;
    const spineDrape = !isFront ? Math.sin(normY * Math.PI * 1.5) * 0.025 : 0;

    // 4. Side seam pinch (natural tailored drape along lateral seams)
    const isSide = Math.abs(Math.sin(angle)) < 0.25;
    const sidePinch = isSide ? -0.018 * Math.sin(normY * Math.PI) : 0;

    const totalDisp = primaryWrinkle + secondaryWrinkle + microCrease + sidePinch;

    v.x += Math.cos(angle) * totalDisp + (isFront ? chestProtrusion * 0.25 : 0);
    v.z += Math.sin(angle) * totalDisp + (isFront ? chestProtrusion : -spineDrape);

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates organic curved sleeve with natural elbow bend, sleeve creases, and cuff pooling
 */
function createCurvedSleeveGeometry(
  radiusTop: number,
  radiusBottom: number,
  length: number,
  radialSegments = 48,
  heightSegments = 40
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, radialSegments, heightSegments);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = 1 - (v.y + length / 2) / length; // 0 at shoulder, 1 at wrist

    // Natural bend forward and down at the elbow (peak around t = 0.5)
    const elbowBend = Math.sin(t * Math.PI) * 0.14;
    v.z += elbowBend;

    // Organic wrinkles around inner and outer elbow
    if (t > 0.32 && t < 0.68) {
      const elbowFolds = Math.sin(v.y * 30) * 0.028;
      v.x += elbowFolds;
      v.z += Math.cos(v.y * 22) * 0.015;
    }

    // Fabric pooling / gathering above the wrist cuff
    if (t > 0.75 && t < 0.95) {
      const cuffGathering = Math.sin(v.y * 40) * 0.022;
      v.x += cuffGathering;
      v.z += cuffGathering;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates realistic trouser leg geometry with articulated knee creases and ankle stacking folds
 */
function createPantsLegGeometry(
  radiusTop: number,
  radiusBottom: number,
  length: number,
  radialSegments = 48,
  heightSegments = 48
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, radialSegments, heightSegments);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const normY = (v.y + length / 2) / length; // 0 at ankle, 1 at hip

    // 1. Natural knee bend forward (normY around 0.5)
    const kneeForward = Math.sin(normY * Math.PI) * 0.09;
    v.z += kneeForward;

    // 2. Articulated horizontal knee folds & creases (normY between 0.42 and 0.58)
    if (normY > 0.40 && normY < 0.60) {
      const kneeWrinkles = Math.sin((normY - 0.5) * 45) * 0.025;
      v.z += kneeWrinkles;
    }

    // 3. Authentic ankle stack folds (normY between 0.05 and 0.25) where fabric clusters above sneakers
    if (normY > 0.05 && normY < 0.28) {
      const ankleStack = Math.sin((normY - 0.15) * 55) * 0.028;
      v.x += ankleStack * 0.7;
      v.z += ankleStack;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates high-detail anatomical sculpted sneaker upper (eliminating boxy Roblox geometries)
 */
function createSculptedSneakerUpperGeometry(): THREE.BufferGeometry {
  const rings = 40;
  const segments = 32;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rings; r++) {
    const t = r / rings; // 0 at heel (-0.88), 1 at toe (+0.84)
    const z = -0.88 + t * 1.72;

    // Anatomical width curve along foot length
    let w = 0.30;
    if (t < 0.22) {
      // Heel cup
      w = 0.28 + Math.sin((t / 0.22) * Math.PI * 0.5) * 0.04;
    } else if (t < 0.45) {
      // Waist / arch taper (medial indent)
      const archT = (t - 0.22) / 0.23;
      w = 0.32 - Math.sin(archT * Math.PI) * 0.06;
    } else if (t < 0.78) {
      // Ball of foot (widest area)
      const ballT = (t - 0.45) / 0.33;
      w = 0.28 + Math.sin(ballT * Math.PI) * 0.12;
    } else {
      // Toe taper
      const toeT = (t - 0.78) / 0.22;
      w = 0.38 * (1 - toeT * 0.45);
    }

    // Anatomical height curve
    let h = 0.44;
    if (t < 0.25) {
      // Heel collar
      h = 0.52 - (t / 0.25) * 0.06;
    } else if (t < 0.55) {
      // Instep / tongue throat
      h = 0.48 + Math.sin(((t - 0.25) / 0.3) * Math.PI) * 0.05;
    } else {
      // Vamp sloping down to toe box
      const vampT = (t - 0.55) / 0.45;
      h = 0.50 - vampT * 0.32;
    }

    // Dynamic toe spring (toe lifts naturally upward off the ground)
    const toeSpring = t > 0.60 ? Math.pow((t - 0.60) / 0.40, 2) * 0.11 : 0;
    const baseY = toeSpring + 0.08;

    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Foot cross-section: wider at bottom, arched at top, slight medial asymmetry
      const xMod = sinA * w * (cosA < 0 ? 0.95 : 1.05);
      const yMod = baseY + (cosA + 1) * 0.5 * h;
      const zMod = z + cosA * 0.04;

      // Micro surface wrinkles near flex points (ball of foot)
      const flexWrinkle =
        t > 0.55 && t < 0.72 && cosA > 0.3 ? Math.sin(z * 40) * 0.012 : 0;

      positions.push(xMod, yMod + flexWrinkle, zMod);
      uvs.push(s / segments, t);
    }
  }

  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s;
      const b = (r + 1) * (segments + 1) + s;
      const c = (r + 1) * (segments + 1) + (s + 1);
      const d = r * (segments + 1) + (s + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates high-fidelity molded chunky sneaker midsole with heel crash-pad, arch bevel, and toe bumper
 */
function createSculptedSneakerMidsoleGeometry(): THREE.BufferGeometry {
  const rings = 36;
  const segments = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const z = -0.92 + t * 1.82; // slightly longer than upper to wrap heel & toe

    // Sole width
    let w = 0.36;
    if (t < 0.25) {
      w = 0.36;
    } else if (t < 0.5) {
      w = 0.31; // arch carve
    } else if (t < 0.8) {
      w = 0.44; // wide forefoot stabilizer
    } else {
      w = 0.34;
    }

    // Midsole thickness: thicker at heel wedge, thinner at forefoot
    const thickness = 0.22 - t * 0.08;
    const toeSpring = t > 0.65 ? Math.pow((t - 0.65) / 0.35, 2) * 0.13 : 0;
    const heelBevel = t < 0.15 ? (1 - t / 0.15) * 0.04 : 0;

    const bottomY = -0.16 + toeSpring + heelBevel;

    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Chamfered / molded sneaker sidewall profile
      const x = sinA * w * 1.05;
      const y = bottomY + (cosA + 1) * 0.5 * thickness;

      // Side ribbed grooving for streetwear aesthetics
      const sideRib =
        Math.abs(sinA) > 0.7 && t > 0.2 && t < 0.8 ? Math.sin(z * 32) * 0.015 : 0;

      positions.push(x + (sinA > 0 ? sideRib : -sideRib), y, z);
      uvs.push(s / segments, t);
    }
  }

  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s;
      const b = (r + 1) * (segments + 1) + s;
      const c = (r + 1) * (segments + 1) + (s + 1);
      const d = r * (segments + 1) + (s + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates authentic organic 3D garment models
 */
export function buildGarmentModel(
  type: GarmentType,
  materials: {
    primary: THREE.Material;
    secondary: THREE.Material;
    accent: THREE.Material;
    hardware: THREE.Material;
    lining: THREE.Material;
    customCanvas: THREE.Material;
  }
): GarmentMeshes {
  const root = new THREE.Group();
  const bodyMeshes: THREE.Mesh[] = [];
  const sleeveMeshes: THREE.Mesh[] = [];
  const accentMeshes: THREE.Mesh[] = [];
  const hardwareMeshes: THREE.Mesh[] = [];
  const liningMeshes: THREE.Mesh[] = [];
  let customCanvasMesh: THREE.Mesh | null = null;
  let backCanvasMesh: THREE.Mesh | null = null;

  let leftSleeveGroup: THREE.Group | undefined;
  let rightSleeveGroup: THREE.Group | undefined;
  let hoodGroup: THREE.Group | undefined;
  let frontPanelGroup: THREE.Group | undefined;

  if (type === 'hoodie') {
    // 1. Organic Draped Torso
    const torsoGeo = createOrganicClothCylinder(0.72, 0.68, 1.45, 48, 36, 0.035);
    torsoGeo.scale(1.12, 1, 0.82); // Realistic human torso proportion
    const torsoMesh = new THREE.Mesh(torsoGeo, materials.primary);
    torsoMesh.position.y = -0.05;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    root.add(torsoMesh);
    bodyMeshes.push(torsoMesh);

    // Inner Torso (for solid two-sided look)
    const innerTorsoGeo = torsoGeo.clone();
    innerTorsoGeo.scale(0.99, 0.99, 0.99);
    const innerTorsoMesh = new THREE.Mesh(innerTorsoGeo, materials.lining);
    innerTorsoMesh.position.y = -0.05;
    root.add(innerTorsoMesh);
    liningMeshes.push(innerTorsoMesh);

    // Elastic Rib-Knit Bottom Hem
    const hemGeo = new THREE.CylinderGeometry(0.66, 0.63, 0.18, 48);
    hemGeo.scale(1.1, 1, 0.8);
    const hemMesh = new THREE.Mesh(hemGeo, materials.secondary);
    hemMesh.position.y = -0.85;
    root.add(hemMesh);
    accentMeshes.push(hemMesh);

    // Realistic Kangaroo Pocket with curved hand entry and depth
    frontPanelGroup = new THREE.Group();
    const pocketShape = new THREE.Shape();
    pocketShape.moveTo(-0.42, -0.22);
    pocketShape.lineTo(0.42, -0.22);
    pocketShape.lineTo(0.35, 0.18);
    pocketShape.lineTo(-0.35, 0.18);
    pocketShape.closePath();

    const pocketGeo = new THREE.ExtrudeGeometry(pocketShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    const pocketMesh = new THREE.Mesh(pocketGeo, materials.primary);
    pocketMesh.position.set(0, -0.28, 0.52);
    pocketMesh.rotation.x = -0.06;
    pocketMesh.castShadow = true;
    frontPanelGroup.add(pocketMesh);
    bodyMeshes.push(pocketMesh);

    // Pocket Entry Seam Lines (Left & Right)
    const seamGeomL = new THREE.CylinderGeometry(0.012, 0.012, 0.38, 12);
    const seamL = new THREE.Mesh(seamGeomL, materials.accent);
    seamL.position.set(-0.38, -0.02, 0.54);
    seamL.rotation.z = 0.22;
    frontPanelGroup.add(seamL);
    accentMeshes.push(seamL);

    const seamR = new THREE.Mesh(seamGeomL, materials.accent);
    seamR.position.set(0.38, -0.02, 0.54);
    seamR.rotation.z = -0.22;
    frontPanelGroup.add(seamR);
    accentMeshes.push(seamR);

    root.add(frontPanelGroup);

    // 2. Realistic Cowl Drape Hood
    hoodGroup = new THREE.Group();

    // Sculpted Hood Shell
    const hoodGeo = new THREE.SphereGeometry(0.55, 36, 32, 0, Math.PI * 2, 0, Math.PI * 0.76);
    hoodGeo.scale(0.92, 1.25, 1.18);
    const posH = hoodGeo.attributes.position;
    const vH = new THREE.Vector3();
    for (let i = 0; i < posH.count; i++) {
      vH.fromBufferAttribute(posH, i);
      // Flatten front face to create open face cavity
      if (vH.z > 0.1) {
        vH.z -= Math.sin(vH.y * 3) * 0.15;
      }
      // Natural folds at back of head
      if (vH.z < -0.1) {
        vH.z += Math.sin(vH.y * 8) * 0.03;
      }
      posH.setXYZ(i, vH.x, vH.y, vH.z);
    }
    hoodGeo.computeVertexNormals();

    const hoodMesh = new THREE.Mesh(hoodGeo, materials.primary);
    hoodMesh.position.set(0, 0.96, -0.08);
    hoodMesh.rotation.x = 0.22;
    hoodMesh.castShadow = true;
    hoodGroup.add(hoodMesh);
    bodyMeshes.push(hoodMesh);

    // Hood Inner Lining
    const innerHoodGeo = hoodGeo.clone();
    innerHoodGeo.scale(0.96, 0.96, 0.96);
    const innerHoodMesh = new THREE.Mesh(innerHoodGeo, materials.lining);
    innerHoodMesh.position.set(0, 0.96, -0.08);
    innerHoodMesh.rotation.x = 0.22;
    hoodGroup.add(innerHoodMesh);
    liningMeshes.push(innerHoodMesh);

    // Rolled Hem Collar Opening
    const collarRimGeo = new THREE.TorusGeometry(0.38, 0.055, 20, 36);
    collarRimGeo.scale(1.05, 0.75, 1);
    const collarRimMesh = new THREE.Mesh(collarRimGeo, materials.secondary);
    collarRimMesh.rotation.x = Math.PI / 2;
    collarRimMesh.position.set(0, 0.74, 0.12);
    hoodGroup.add(collarRimMesh);
    accentMeshes.push(collarRimMesh);

    // Braided Cotton Drawstrings with Realistic Gravity Arc
    const curveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.72, 0.44),
      new THREE.Vector3(-0.20, 0.50, 0.50),
      new THREE.Vector3(-0.18, 0.25, 0.46),
      new THREE.Vector3(-0.17, 0.08, 0.42),
    ]);
    const cordL = new THREE.Mesh(new THREE.TubeGeometry(curveL, 24, 0.016, 12, false), materials.accent);
    hoodGroup.add(cordL);
    accentMeshes.push(cordL);

    // Metal Aglet L
    const agletL = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 16), materials.hardware);
    agletL.position.set(-0.17, 0.04, 0.42);
    hoodGroup.add(agletL);
    hardwareMeshes.push(agletL);

    // Cord R
    const curveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.72, 0.44),
      new THREE.Vector3(0.20, 0.50, 0.50),
      new THREE.Vector3(0.18, 0.25, 0.46),
      new THREE.Vector3(0.17, 0.08, 0.42),
    ]);
    const cordR = new THREE.Mesh(new THREE.TubeGeometry(curveR, 24, 0.016, 12, false), materials.accent);
    hoodGroup.add(cordR);
    accentMeshes.push(cordR);

    // Metal Aglet R
    const agletR = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 16), materials.hardware);
    agletR.position.set(0.17, 0.04, 0.42);
    hoodGroup.add(agletR);
    hardwareMeshes.push(agletR);

    root.add(hoodGroup);

    // 3. Realistic Relaxed Sleeves
    // Left Sleeve
    leftSleeveGroup = new THREE.Group();
    const sleeveGeoL = createCurvedSleeveGeometry(0.26, 0.19, 1.28, 36, 28);
    const sleeveL = new THREE.Mesh(sleeveGeoL, materials.secondary);
    sleeveL.position.set(0, -0.58, 0);
    sleeveL.castShadow = true;
    leftSleeveGroup.add(sleeveL);
    sleeveMeshes.push(sleeveL);

    // Ribbed Cuff L
    const cuffGeoL = new THREE.CylinderGeometry(0.18, 0.16, 0.16, 32);
    const cuffL = new THREE.Mesh(cuffGeoL, materials.accent);
    cuffL.position.set(0, -1.26, 0);
    leftSleeveGroup.add(cuffL);
    accentMeshes.push(cuffL);

    leftSleeveGroup.position.set(-0.82, 0.60, 0);
    leftSleeveGroup.rotation.z = 0.36;
    leftSleeveGroup.rotation.x = 0.12;
    root.add(leftSleeveGroup);

    // Right Sleeve
    rightSleeveGroup = new THREE.Group();
    const sleeveGeoR = createCurvedSleeveGeometry(0.26, 0.19, 1.28, 36, 28);
    const sleeveR = new THREE.Mesh(sleeveGeoR, materials.secondary);
    sleeveR.position.set(0, -0.58, 0);
    sleeveR.castShadow = true;
    rightSleeveGroup.add(sleeveR);
    sleeveMeshes.push(sleeveR);

    // Ribbed Cuff R
    const cuffR = new THREE.Mesh(cuffGeoL, materials.accent);
    cuffR.position.set(0, -1.26, 0);
    rightSleeveGroup.add(cuffR);
    accentMeshes.push(cuffR);

    rightSleeveGroup.position.set(0.82, 0.60, 0);
    rightSleeveGroup.rotation.z = -0.36;
    rightSleeveGroup.rotation.x = 0.12;
    root.add(rightSleeveGroup);

    // 4. Interactive Custom Drawing / Embroidery Canvas Layer (curved on chest)
    const customCanvasGeo = new THREE.PlaneGeometry(0.68, 0.44, 16, 8);
    // Subtle curvature to wrap snugly across the chest contours
    const pC = customCanvasGeo.attributes.position;
    const vC = new THREE.Vector3();
    for (let i = 0; i < pC.count; i++) {
      vC.fromBufferAttribute(pC, i);
      vC.z = -Math.pow(vC.x, 2) * 0.18; // Organic curve
      pC.setXYZ(i, vC.x, vC.y, vC.z);
    }
    customCanvasGeo.computeVertexNormals();

    customCanvasMesh = new THREE.Mesh(customCanvasGeo, materials.customCanvas);
    customCanvasMesh.position.set(0, 0.22, 0.53);
    root.add(customCanvasMesh);

    // Large Back Print Canvas Layer
    const backCanvasGeo = customCanvasGeo.clone();
    backCanvasMesh = new THREE.Mesh(backCanvasGeo, materials.customCanvas);
    backCanvasMesh.rotation.y = Math.PI;
    backCanvasMesh.position.set(0, 0.22, -0.53);
    root.add(backCanvasMesh);

  } else if (type === 'jacket') {
    // 2. Realistic Bomber Jacket
    const jacketGeo = createOrganicClothCylinder(0.74, 0.70, 1.42, 48, 36, 0.04);
    jacketGeo.scale(1.14, 1, 0.85);
    const jacketMesh = new THREE.Mesh(jacketGeo, materials.primary);
    jacketMesh.castShadow = true;
    root.add(jacketMesh);
    bodyMeshes.push(jacketMesh);

    // Ribbed Baseball Collar
    const collarGeo = new THREE.TorusGeometry(0.36, 0.07, 18, 36);
    collarGeo.scale(1.05, 0.8, 1);
    const collarMesh = new THREE.Mesh(collarGeo, materials.secondary);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.72, 0);
    root.add(collarMesh);
    accentMeshes.push(collarMesh);

    // Ribbed Waistband
    const bandGeo = new THREE.CylinderGeometry(0.68, 0.67, 0.18, 48);
    bandGeo.scale(1.1, 1, 0.82);
    const bandMesh = new THREE.Mesh(bandGeo, materials.secondary);
    bandMesh.position.y = -0.78;
    root.add(bandMesh);
    accentMeshes.push(bandMesh);

    // Heavy Metal Center Zipper with teeth
    const zipGeo = new THREE.BoxGeometry(0.04, 1.44, 0.05);
    const zipMesh = new THREE.Mesh(zipGeo, materials.hardware);
    zipMesh.position.set(0, -0.04, 0.60);
    root.add(zipMesh);
    hardwareMeshes.push(zipMesh);

    // Zipper Puller
    const pullGeo = new THREE.BoxGeometry(0.06, 0.12, 0.02);
    const pullMesh = new THREE.Mesh(pullGeo, materials.hardware);
    pullMesh.position.set(0, 0.28, 0.64);
    root.add(pullMesh);
    hardwareMeshes.push(pullMesh);

    // Slanted Flap Pockets
    const pocketGeo = new THREE.BoxGeometry(0.28, 0.18, 0.04);
    const pocketL = new THREE.Mesh(pocketGeo, materials.secondary);
    pocketL.position.set(-0.38, -0.15, 0.56);
    pocketL.rotation.z = -0.15;
    root.add(pocketL);
    accentMeshes.push(pocketL);

    const pocketR = new THREE.Mesh(pocketGeo, materials.secondary);
    pocketR.position.set(0.38, -0.15, 0.56);
    pocketR.rotation.z = 0.15;
    root.add(pocketR);
    accentMeshes.push(pocketR);

    // Sleeves
    leftSleeveGroup = new THREE.Group();
    const sleeveL = new THREE.Mesh(createCurvedSleeveGeometry(0.28, 0.20, 1.28, 36, 28), materials.primary);
    sleeveL.position.set(0, -0.58, 0);
    leftSleeveGroup.add(sleeveL);
    sleeveMeshes.push(sleeveL);

    // Tactical Arm Pocket on sleeve
    const armPkt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), materials.accent);
    armPkt.position.set(-0.22, -0.35, 0);
    leftSleeveGroup.add(armPkt);
    accentMeshes.push(armPkt);

    // Cuff L
    const cuffL = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.16, 32), materials.secondary);
    cuffL.position.set(0, -1.26, 0);
    leftSleeveGroup.add(cuffL);
    accentMeshes.push(cuffL);

    leftSleeveGroup.position.set(-0.85, 0.62, 0);
    leftSleeveGroup.rotation.z = 0.35;
    root.add(leftSleeveGroup);

    rightSleeveGroup = new THREE.Group();
    const sleeveR = new THREE.Mesh(createCurvedSleeveGeometry(0.28, 0.20, 1.28, 36, 28), materials.primary);
    sleeveR.position.set(0, -0.58, 0);
    rightSleeveGroup.add(sleeveR);
    sleeveMeshes.push(sleeveR);

    const cuffR = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.16, 32), materials.secondary);
    cuffR.position.set(0, -1.26, 0);
    rightSleeveGroup.add(cuffR);
    accentMeshes.push(cuffR);

    rightSleeveGroup.position.set(0.85, 0.62, 0);
    rightSleeveGroup.rotation.z = -0.35;
    root.add(rightSleeveGroup);

    // Custom Canvas Embroidery on chest
    const customCanvasGeo = new THREE.PlaneGeometry(0.48, 0.32);
    customCanvasMesh = new THREE.Mesh(customCanvasGeo, materials.customCanvas);
    customCanvasMesh.position.set(0.32, 0.30, 0.57);
    root.add(customCanvasMesh);

    const backCanvasGeo = new THREE.PlaneGeometry(0.64, 0.44);
    backCanvasMesh = new THREE.Mesh(backCanvasGeo, materials.customCanvas);
    backCanvasMesh.rotation.y = Math.PI;
    backCanvasMesh.position.set(0, 0.25, -0.57);
    root.add(backCanvasMesh);

  } else if (type === 'tshirt') {
    // 3. Relaxed Organic T-Shirt
    const teeGeo = createOrganicClothCylinder(0.75, 0.74, 1.42, 48, 36, 0.025);
    teeGeo.scale(1.10, 1, 0.78);
    const teeMesh = new THREE.Mesh(teeGeo, materials.primary);
    root.add(teeMesh);
    bodyMeshes.push(teeMesh);

    // Thick Ribbed Crew Collar
    const collarGeo = new THREE.TorusGeometry(0.34, 0.05, 18, 36);
    collarGeo.scale(1.05, 0.85, 1);
    const collarMesh = new THREE.Mesh(collarGeo, materials.secondary);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.72, 0);
    root.add(collarMesh);
    accentMeshes.push(collarMesh);

    // Drop-shoulder short sleeves with hem
    leftSleeveGroup = new THREE.Group();
    const slvGeo = new THREE.CylinderGeometry(0.28, 0.25, 0.68, 32);
    const slvMeshL = new THREE.Mesh(slvGeo, materials.primary);
    slvMeshL.position.set(0, -0.28, 0);
    leftSleeveGroup.add(slvMeshL);
    sleeveMeshes.push(slvMeshL);

    leftSleeveGroup.position.set(-0.86, 0.58, 0);
    leftSleeveGroup.rotation.z = 0.44;
    root.add(leftSleeveGroup);

    rightSleeveGroup = new THREE.Group();
    const slvMeshR = new THREE.Mesh(slvGeo, materials.primary);
    slvMeshR.position.set(0, -0.28, 0);
    rightSleeveGroup.add(slvMeshR);
    sleeveMeshes.push(slvMeshR);

    rightSleeveGroup.position.set(0.86, 0.58, 0);
    rightSleeveGroup.rotation.z = -0.44;
    root.add(rightSleeveGroup);

    // Large Chest Drawing / Print Area
    const customCanvasGeo = new THREE.PlaneGeometry(0.64, 0.48);
    customCanvasMesh = new THREE.Mesh(customCanvasGeo, materials.customCanvas);
    customCanvasMesh.position.set(0, 0.20, 0.56);
    root.add(customCanvasMesh);

    const backTeeGeo = new THREE.PlaneGeometry(0.68, 0.52);
    backCanvasMesh = new THREE.Mesh(backTeeGeo, materials.customCanvas);
    backCanvasMesh.rotation.y = Math.PI;
    backCanvasMesh.position.set(0, 0.20, -0.56);
    root.add(backCanvasMesh);

  } else if (type === 'cargo') {
    // 4. Realistic Cargo Pants with knee articulated bends
    // Elastic Waistband
    const waistGeo = new THREE.CylinderGeometry(0.66, 0.64, 0.22, 48);
    waistGeo.scale(1.1, 1, 0.8);
    const waistMesh = new THREE.Mesh(waistGeo, materials.secondary);
    waistMesh.position.y = 0.85;
    root.add(waistMesh);
    accentMeshes.push(waistMesh);

    // Metal buckle & belt
    const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), materials.hardware);
    buckleMesh.position.set(0, 0.85, 0.55);
    root.add(buckleMesh);
    hardwareMeshes.push(buckleMesh);

    // Legs with articulated knee bends & ankle stacking
    leftSleeveGroup = new THREE.Group();
    const legGeoL = createPantsLegGeometry(0.31, 0.20, 1.95, 48, 48);
    const legMeshL = new THREE.Mesh(legGeoL, materials.primary);
    legMeshL.position.set(0, -0.15, 0);
    leftSleeveGroup.add(legMeshL);
    bodyMeshes.push(legMeshL);

    // 3D Cargo Pocket with flap and stitch welt
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.28), materials.secondary);
    cargoBox.position.set(-0.28, 0.08, 0);
    leftSleeveGroup.add(cargoBox);
    accentMeshes.push(cargoBox);

    // Flap
    const flapGeo = new THREE.BoxGeometry(0.13, 0.08, 0.29);
    const flapMesh = new THREE.Mesh(flapGeo, materials.accent);
    flapMesh.position.set(-0.28, 0.28, 0);
    leftSleeveGroup.add(flapMesh);
    accentMeshes.push(flapMesh);

    // Ankle cuff
    const ankleL = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.16, 24), materials.accent);
    ankleL.position.set(0, -1.15, 0);
    leftSleeveGroup.add(ankleL);
    accentMeshes.push(ankleL);

    leftSleeveGroup.position.set(-0.35, 0, 0);
    root.add(leftSleeveGroup);

    rightSleeveGroup = new THREE.Group();
    const legMeshR = new THREE.Mesh(legGeoL, materials.primary);
    legMeshR.position.set(0, -0.15, 0);
    rightSleeveGroup.add(legMeshR);
    bodyMeshes.push(legMeshR);

    const cargoBoxR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.28), materials.secondary);
    cargoBoxR.position.set(0.28, 0.08, 0);
    rightSleeveGroup.add(cargoBoxR);
    accentMeshes.push(cargoBoxR);

    const flapMeshR = new THREE.Mesh(flapGeo, materials.accent);
    flapMeshR.position.set(0.28, 0.28, 0);
    rightSleeveGroup.add(flapMeshR);
    accentMeshes.push(flapMeshR);

    const ankleR = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.16, 24), materials.accent);
    ankleR.position.set(0, -1.15, 0);
    rightSleeveGroup.add(ankleR);
    accentMeshes.push(ankleR);

    rightSleeveGroup.position.set(0.35, 0, 0);
    root.add(rightSleeveGroup);

    // Pocket Canvas for custom embroidery
    const customCanvasGeo = new THREE.PlaneGeometry(0.24, 0.24);
    customCanvasMesh = new THREE.Mesh(customCanvasGeo, materials.customCanvas);
    customCanvasMesh.rotation.y = Math.PI / 2;
    customCanvasMesh.position.set(-0.35, 0.12, 0);
    leftSleeveGroup.add(customCanvasMesh);

  } else if (type === 'trench') {
    // 5. Prailginta Vėjastriukė / Lietpaltis
    const coatGeo = createOrganicClothCylinder(0.72, 0.92, 2.3, 48, 40, 0.04);
    coatGeo.scale(1.08, 1, 0.8);
    const coatMesh = new THREE.Mesh(coatGeo, materials.primary);
    coatMesh.position.y = -0.32;
    root.add(coatMesh);
    bodyMeshes.push(coatMesh);

    // High Storm Collar
    hoodGroup = new THREE.Group();
    const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.39, 0.42, 36, 1, true), materials.secondary);
    collarMesh.position.set(0, 0.90, 0);
    hoodGroup.add(collarMesh);
    accentMeshes.push(collarMesh);
    root.add(hoodGroup);

    // Sleeves
    leftSleeveGroup = new THREE.Group();
    const slvMeshL = new THREE.Mesh(createCurvedSleeveGeometry(0.26, 0.20, 1.35, 36, 28), materials.primary);
    slvMeshL.position.set(0, -0.6, 0);
    leftSleeveGroup.add(slvMeshL);
    sleeveMeshes.push(slvMeshL);

    leftSleeveGroup.position.set(-0.84, 0.68, 0);
    leftSleeveGroup.rotation.z = 0.30;
    root.add(leftSleeveGroup);

    rightSleeveGroup = new THREE.Group();
    const slvMeshR = new THREE.Mesh(createCurvedSleeveGeometry(0.26, 0.20, 1.35, 36, 28), materials.primary);
    slvMeshR.position.set(0, -0.6, 0);
    rightSleeveGroup.add(slvMeshR);
    sleeveMeshes.push(slvMeshR);

    rightSleeveGroup.position.set(0.84, 0.68, 0);
    rightSleeveGroup.rotation.z = -0.30;
    root.add(rightSleeveGroup);

    // Chest Canvas
    const customCanvasGeo = new THREE.PlaneGeometry(0.44, 0.32);
    customCanvasMesh = new THREE.Mesh(customCanvasGeo, materials.customCanvas);
    customCanvasMesh.position.set(0.26, 0.35, 0.56);
    root.add(customCanvasMesh);

  } else if (type === 'sneakers') {
    // 6. Realistic Sculpted Sneaker Architecture (Zero Boxy Shapes)
    const upperGroup = new THREE.Group();

    // 6.1 Sculpted Anatomical Upper (Contoured Shoe Last with Toe Spring & Heel Cup)
    const upperGeo = createSculptedSneakerUpperGeometry();
    const upperMesh = new THREE.Mesh(upperGeo, materials.primary);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    upperGroup.add(upperMesh);
    bodyMeshes.push(upperMesh);

    // 6.2 Toe Cap Mudguard Overlay (Curved reinforcement around forefoot)
    const mudguardGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.38, 32, 1, true, 0, Math.PI);
    mudguardGeo.scale(0.88, 0.52, 1.15);
    const mudguardMesh = new THREE.Mesh(mudguardGeo, materials.secondary);
    mudguardMesh.rotation.y = -Math.PI / 2;
    mudguardMesh.rotation.x = -0.15;
    mudguardMesh.position.set(0, 0.22, 0.48);
    upperGroup.add(mudguardMesh);
    accentMeshes.push(mudguardMesh);

    // 6.3 Padded Ankle Collar Cushion (Torus wrapping the foot opening)
    const collarGeo = new THREE.TorusGeometry(0.24, 0.055, 16, 32);
    collarGeo.scale(0.9, 1.15, 1.0);
    const collarMesh = new THREE.Mesh(collarGeo, materials.secondary);
    collarMesh.rotation.x = -Math.PI / 2.3;
    collarMesh.position.set(0, 0.50, -0.40);
    upperGroup.add(collarMesh);
    accentMeshes.push(collarMesh);

    // 6.4 Padded Curved Instep Tongue
    const tongueCurve = new THREE.CylinderGeometry(0.18, 0.22, 0.68, 24, 1, true, 0, Math.PI);
    tongueCurve.scale(1.0, 0.4, 1.2);
    const tongueMesh = new THREE.Mesh(tongueCurve, materials.primary);
    tongueMesh.rotation.x = 0.58;
    tongueMesh.position.set(0, 0.42, 0.02);
    upperGroup.add(tongueMesh);
    bodyMeshes.push(tongueMesh);

    // Tongue Top Woven Brand Label Tag
    const tongueTagGeo = new THREE.BoxGeometry(0.16, 0.08, 0.02);
    const tongueTag = new THREE.Mesh(tongueTagGeo, materials.accent);
    tongueTag.rotation.x = 0.55;
    tongueTag.position.set(0, 0.56, -0.14);
    upperGroup.add(tongueTag);
    accentMeshes.push(tongueTag);

    // 6.5 Eyestay Strips & Metal Eyelet Rings (5 Pairs)
    const eyeletGeo = new THREE.TorusGeometry(0.022, 0.007, 8, 16);
    const eyeletPositions = [
      { z: 0.32, y: 0.30, x: 0.16 },
      { z: 0.20, y: 0.35, x: 0.17 },
      { z: 0.08, y: 0.41, x: 0.17 },
      { z: -0.04, y: 0.47, x: 0.16 },
      { z: -0.16, y: 0.51, x: 0.15 },
    ];

    eyeletPositions.forEach((pos, idx) => {
      // Right Eyelet
      const eyeletR = new THREE.Mesh(eyeletGeo, materials.hardware);
      eyeletR.rotation.y = Math.PI / 2;
      eyeletR.position.set(pos.x, pos.y, pos.z);
      upperGroup.add(eyeletR);
      hardwareMeshes.push(eyeletR);

      // Left Eyelet
      const eyeletL = new THREE.Mesh(eyeletGeo, materials.hardware);
      eyeletL.rotation.y = -Math.PI / 2;
      eyeletL.position.set(-pos.x, pos.y, pos.z);
      upperGroup.add(eyeletL);
      hardwareMeshes.push(eyeletL);

      // Criss-Cross 3D Laces (Tubular interweaving threads)
      const laceLen = Math.sqrt(Math.pow(pos.x * 2, 2) + 0.015);
      const laceGeo = new THREE.CylinderGeometry(0.014, 0.014, laceLen, 12);
      const laceMesh = new THREE.Mesh(laceGeo, materials.secondary);
      laceMesh.rotation.z = Math.PI / 2;
      laceMesh.rotation.x = (idx % 2 === 0 ? 0.15 : -0.15);
      laceMesh.position.set(0, pos.y + 0.015, pos.z);
      upperGroup.add(laceMesh);
      bodyMeshes.push(laceMesh);
    });

    // 6.6 Tied Bow Knot on top with Aglets
    const knotGroup = new THREE.Group();
    const bowLoopGeo = new THREE.TorusGeometry(0.07, 0.014, 12, 24);

    const bowLoopL = new THREE.Mesh(bowLoopGeo, materials.secondary);
    bowLoopL.rotation.set(0.3, 0.5, 0.7);
    bowLoopL.position.set(-0.08, 0.55, -0.20);
    knotGroup.add(bowLoopL);

    const bowLoopR = new THREE.Mesh(bowLoopGeo, materials.secondary);
    bowLoopR.rotation.set(0.3, -0.5, -0.7);
    bowLoopR.position.set(0.08, 0.55, -0.20);
    knotGroup.add(bowLoopR);

    // Hanging lace tips with metallic aglets
    const agletL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 10), materials.secondary);
    agletL.rotation.set(0.4, 0.2, 0.3);
    agletL.position.set(-0.11, 0.44, -0.16);
    knotGroup.add(agletL);

    const agletR = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 10), materials.secondary);
    agletR.rotation.set(0.4, -0.2, -0.3);
    agletR.position.set(0.11, 0.44, -0.16);
    knotGroup.add(agletR);

    upperGroup.add(knotGroup);
    bodyMeshes.push(bowLoopL, bowLoopR, agletL, agletR);

    // 6.7 Heel Counter & Pull Tab (Achilles Webbing Loop)
    const heelCounterGeo = new THREE.CylinderGeometry(0.31, 0.34, 0.42, 24, 1, true, 0, Math.PI);
    heelCounterGeo.scale(0.9, 0.9, 0.9);
    const heelCounter = new THREE.Mesh(heelCounterGeo, materials.secondary);
    heelCounter.rotation.y = Math.PI / 2;
    heelCounter.position.set(0, 0.26, -0.66);
    upperGroup.add(heelCounter);
    accentMeshes.push(heelCounter);

    const pullTabGeo = new THREE.BoxGeometry(0.04, 0.22, 0.06);
    const pullTab = new THREE.Mesh(pullTabGeo, materials.accent);
    pullTab.rotation.x = -0.35;
    pullTab.position.set(0, 0.48, -0.76);
    upperGroup.add(pullTab);
    accentMeshes.push(pullTab);

    // 6.8 Sweeping Aerodynamic Streetwear Side Accent Wave (Lateral & Medial)
    const sideWaveCurve = new THREE.CylinderGeometry(0.018, 0.018, 1.1, 16);
    const sideWaveR = new THREE.Mesh(sideWaveCurve, materials.accent);
    sideWaveR.rotation.x = Math.PI / 2.15;
    sideWaveR.rotation.y = 0.22;
    sideWaveR.position.set(0.33, 0.24, -0.05);
    upperGroup.add(sideWaveR);
    accentMeshes.push(sideWaveR);

    const sideWaveL = new THREE.Mesh(sideWaveCurve, materials.accent);
    sideWaveL.rotation.x = Math.PI / 2.15;
    sideWaveL.rotation.y = -0.22;
    sideWaveL.position.set(-0.33, 0.24, -0.05);
    upperGroup.add(sideWaveL);
    accentMeshes.push(sideWaveL);

    root.add(upperGroup);

    // 6.9 Sculpted Chunky Midsole (Molded with Heel Wedge & Flex Grooves)
    const soleGroup = new THREE.Group();
    const midsoleGeo = createSculptedSneakerMidsoleGeometry();
    const midsoleMesh = new THREE.Mesh(midsoleGeo, materials.accent);
    midsoleMesh.castShadow = true;
    midsoleMesh.receiveShadow = true;
    soleGroup.add(midsoleMesh);
    accentMeshes.push(midsoleMesh);

    // 6.10 Multi-Lug Traction Outsole (Direct ground contact with rubber grip)
    const treadBaseGeo = new THREE.BoxGeometry(0.72, 0.06, 1.84);
    const treadMesh = new THREE.Mesh(treadBaseGeo, materials.secondary);
    treadMesh.position.set(0, -0.15, 0.02);
    soleGroup.add(treadMesh);
    bodyMeshes.push(treadMesh);

    // Deep flex traction lugs underneath
    for (let i = 0; i < 7; i++) {
      const lugGeo = new THREE.BoxGeometry(0.68, 0.035, 0.12);
      const lug = new THREE.Mesh(lugGeo, materials.secondary);
      lug.position.set(0, -0.19, -0.7 + i * 0.24);
      soleGroup.add(lug);
      bodyMeshes.push(lug);
    }

    root.add(soleGroup);

    // 6.11 Lateral Quarter Custom Graphic & Embroidery Canvas (Flush on sneaker upper)
    const customCanvasGeo = new THREE.PlaneGeometry(0.34, 0.20);
    customCanvasMesh = new THREE.Mesh(customCanvasGeo, materials.customCanvas);
    customCanvasMesh.rotation.y = Math.PI / 2;
    customCanvasMesh.position.set(0.34, 0.28, 0.02);
    root.add(customCanvasMesh);
  }

  return {
    root,
    bodyMeshes,
    sleeveMeshes,
    accentMeshes,
    hardwareMeshes,
    customCanvasMesh,
    backCanvasMesh,
    liningMeshes,
    leftSleeveGroup,
    rightSleeveGroup,
    hoodGroup,
    frontPanelGroup,
  };
}
