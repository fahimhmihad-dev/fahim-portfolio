import * as THREE from "three";

/**
 * Procedural 3D geometries for the interactive mechanical keyboard.
 *
 * Want to swap in your own custom .glb model later?
 * Replace the `<mesh geometry={keycapGeo} />` inside `keyboard-scene.tsx` with a
 * `@react-three/drei` `useGLTF('/assets/my-keycap.glb')` mesh or swap the whole
 * board with your custom Three.js scene.
 */

function roundedRectPoints(halfW: number, halfD: number, radius: number, segmentsPerCorner = 6) {
  const pts: Array<[number, number]> = [];
  const r = Math.min(radius, halfW * 0.9, halfD * 0.9);
  for (let corner = 0; corner < 4; corner++) {
    const startAngle = corner * (Math.PI / 2);
    const cx = (corner === 0 || corner === 3 ? 1 : -1) * (halfW - r);
    const cz = (corner < 2 ? 1 : -1) * (halfD - r);
    for (let s = 0; s <= segmentsPerCorner; s++) {
      const theta = startAngle + (s / segmentsPerCorner) * (Math.PI / 2);
      pts.push([cx + Math.cos(theta) * r, cz + Math.sin(theta) * r]);
    }
  }
  return pts;
}

/**
 * Builds a smooth sculpted keycap lofted from base skirt to beveled top plateau.
 */
export function createKeycapGeometry(): THREE.BufferGeometry {
  const layers = [
    { hw: 0.46, hd: 0.46, r: 0.11, y: 0.0 },
    { hw: 0.455, hd: 0.455, r: 0.11, y: 0.08 },
    { hw: 0.40, hd: 0.40, r: 0.10, y: 0.44 },
    { hw: 0.37, hd: 0.37, r: 0.095, y: 0.52 },
    { hw: 0.34, hd: 0.34, r: 0.085, y: 0.56 },
  ];

  const cornerSegs = 5;
  const ringLen = (cornerSegs + 1) * 4;
  const positions: number[] = [];
  const indices: number[] = [];

  for (const layer of layers) {
    const pts = roundedRectPoints(layer.hw, layer.hd, layer.r, cornerSegs);
    for (const [x, z] of pts) {
      positions.push(x, layer.y, z);
    }
  }

  // Side walls between successive rings
  for (let l = 0; l < layers.length - 1; l++) {
    const rowA = l * ringLen;
    const rowB = (l + 1) * ringLen;
    for (let i = 0; i < ringLen; i++) {
      const next = (i + 1) % ringLen;
      indices.push(rowA + i, rowA + next, rowB + i);
      indices.push(rowA + next, rowB + next, rowB + i);
    }
  }

  // Top cap with slight ergonomic dish center (slightly lower at center)
  const topLayer = layers[layers.length - 1];
  const topRingStart = (layers.length - 1) * ringLen;
  const topCenterIdx = positions.length / 3;
  positions.push(0, topLayer.y - 0.015, 0);

  for (let i = 0; i < ringLen; i++) {
    const next = (i + 1) % ringLen;
    indices.push(topCenterIdx, topRingStart + next, topRingStart + i);
  }

  // Bottom cap
  const botCenterIdx = positions.length / 3;
  positions.push(0, 0, 0);
  for (let i = 0; i < ringLen; i++) {
    const next = (i + 1) % ringLen;
    indices.push(botCenterIdx, i, next);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the beveled anodized aluminum keyboard housing with a recessed switch well.
 */
export function createRoundedSlabGeometry(
  width: number,
  depth: number,
  height: number,
  radius: number,
  bevelSize = 0.06
): THREE.BufferGeometry {
  const hw = width / 2;
  const hd = depth / 2;
  const shape = new THREE.Shape();
  const r = Math.min(radius, hw * 0.45, hd * 0.45);

  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.05, height - bevelSize * 2),
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize,
    bevelThickness: bevelSize,
    curveSegments: 12,
  });

  // Rotate so extrusion runs vertically along +Y starting at y = 0
  extrude.rotateX(-Math.PI / 2);
  extrude.translate(0, bevelSize, 0);
  extrude.computeVertexNormals();
  return extrude;
}
