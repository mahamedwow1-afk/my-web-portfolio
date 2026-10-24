import * as THREE from 'three'

export interface Testimonial {
  name: string
  role: string
  text: string
  rating?: number
}

export function createSynthwaveEnvironment(scene: THREE.Scene) {
  // ─── Neon Background ────────────────────────────────────────
  scene.background = new THREE.Color(0x0a0014)
  scene.fog = new THREE.FogExp2(0x0a0014, 0.008)

  // ─── Lighting Setup ─────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x2d1b69, 0.8)
  scene.add(ambient)

  // Purple/pink neon lights
  const light1 = new THREE.PointLight(0xff00ff, 2, 100)
  light1.position.set(-50, 30, -50)
  scene.add(light1)

  const light2 = new THREE.PointLight(0x00ffff, 2, 100)
  light2.position.set(50, 30, 50)
  scene.add(light2)

  const light3 = new THREE.PointLight(0xff0080, 1.5, 80)
  light3.position.set(0, 40, 0)
  scene.add(light3)

  // ─── Neon Grid Floor ────────────────────────────────────────
  const gridSize = 300
  const gridDivisions = 60
  const gridMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
  const grid = new THREE.GridHelper(gridSize, gridDivisions, 0xff00ff, 0x00ffff)
  grid.position.y = 0
  scene.add(grid)

  // Second grid layer (deeper)
  const grid2 = new THREE.GridHelper(gridSize, gridDivisions, 0xff00ff, 0x00ffff)
  grid2.position.y = -0.1
  grid2.material = new THREE.LineBasicMaterial({ color: 0x8800ff, linewidth: 1, transparent: true, opacity: 0.3 })
  scene.add(grid2)

  // ─── Glowing Ground Plane ───────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a0014,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.9
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.05
  ground.receiveShadow = true
  scene.add(ground)

  // ─── Neon Trees ─────────────────────────────────────────────
  function createNeonTree(x: number, z: number) {
    const group = new THREE.Group()

    // Trunk (glowing)
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 3, 6)
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5
    })
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 1.5
    group.add(trunk)

    // Canopy (neon green cone)
    const canopyGeo = new THREE.ConeGeometry(1.5, 3, 6)
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.6,
      flatShading: true
    })
    const canopy = new THREE.Mesh(canopyGeo, canopyMat)
    canopy.position.y = 4.5
    group.add(canopy)

    // Glow ring at base
    const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 16)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.05
    group.add(ring)

    group.position.set(x, 0, z)
    scene.add(group)
    return group
  }

  // Scatter neon trees randomly
  for (let i = 0; i < 80; i++) {
    const x = (Math.random() - 0.5) * 250
    const z = (Math.random() - 0.5) * 250
    // Keep center area clear
    if (Math.hypot(x, z) > 20) {
      createNeonTree(x, z)
    }
  }

  // ─── Floating Particles ─────────────────────────────────────
  const particleCount = 300
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 300
    positions[i * 3 + 1] = Math.random() * 30 + 1
    positions[i * 3 + 2] = (Math.random() - 0.5) * 300

    // Random neon colors
    const colorChoice = Math.random()
    if (colorChoice < 0.33) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1 // Magenta
    } else if (colorChoice < 0.66) {
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1 // Cyan
    } else {
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.5 // Green
    }
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particleMat = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  // ─── Mountains in Background ────────────────────────────────
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const dist = 120 + Math.random() * 30
    const x = Math.cos(angle) * dist
    const z = Math.sin(angle) * dist

    const mountainGeo = new THREE.ConeGeometry(20 + Math.random() * 15, 30 + Math.random() * 20, 4)
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a3e,
      emissive: 0x4a0080,
      emissiveIntensity: 0.3,
      flatShading: true
    })
    const mountain = new THREE.Mesh(mountainGeo, mountainMat)
    mountain.position.set(x, 15, z)
    scene.add(mountain)

    // Neon outline
    const edges = new THREE.EdgesGeometry(mountainGeo)
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.4 })
    const wireframe = new THREE.LineSegments(edges, lineMat)
    wireframe.position.copy(mountain.position)
    scene.add(wireframe)
  }

  // ─── Road/Path Markers ──────────────────────────────────────
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x2d1b69,
    emissive: 0x8800ff,
    emissiveIntensity: 0.2
  })

  // Main roads
  const roads = [
    { x: 0, z: 0, w: 6, d: 120 },
    { x: 0, z: 0, w: 120, d: 6 }
  ]

  roads.forEach(r => {
    const geo = new THREE.PlaneGeometry(r.w, r.d)
    const mesh = new THREE.Mesh(geo, pathMat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(r.x, 0.02, r.z)
    scene.add(mesh)
  })

  return { particles, lights: [light1, light2, light3] }
}
