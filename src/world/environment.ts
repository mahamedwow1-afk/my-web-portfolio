import * as THREE from 'three'

export interface Testimonial {
  name: string
  role: string
  text: string
  rating?: number
}

export function createSynthwaveEnvironment(scene: THREE.Scene) {
  // ─── Starry Nebula Sky ──────────────────────────────────────
  scene.background = new THREE.Color(0x050510)
  scene.fog = new THREE.FogExp2(0x0a0014, 0.006)

  // ─── Starfield ──────────────────────────────────────────────
  const starCount = 2000
  const starGeo = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const radius = 200 + Math.random() * 300
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = radius * Math.cos(phi)
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    // Random star colors (white, blue, pink)
    const colorChoice = Math.random()
    if (colorChoice < 0.6) {
      starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1
    } else if (colorChoice < 0.8) {
      starColors[i * 3] = 0.6; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1
    } else {
      starColors[i * 3] = 1; starColors[i * 3 + 1] = 0.6; starColors[i * 3 + 2] = 0.8
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

  // ─── Nebula Clouds ──────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const nebulaGeo = new THREE.SphereGeometry(30 + Math.random() * 50, 16, 16)
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.7, 0.8, 0.3),
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    })
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat)
    nebula.position.set(
      (Math.random() - 0.5) * 300,
      50 + Math.random() * 100,
      (Math.random() - 0.5) * 300
    )
    nebula.scale.set(1, 0.5, 1)
    scene.add(nebula)
  }

  // ─── Planet ─────────────────────────────────────────────────
  const planetGeo = new THREE.SphereGeometry(15, 32, 32)
  const planetMat = new THREE.MeshBasicMaterial({
    color: 0xff0080,
    transparent: true,
    opacity: 0.6
  })
  const planet = new THREE.Mesh(planetGeo, planetMat)
  planet.position.set(80, 80, -100)
  scene.add(planet)

  // Planet ring
  const ringGeo = new THREE.TorusGeometry(22, 2, 8, 32)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.4
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.copy(planet.position)
  ring.rotation.x = Math.PI / 3
  scene.add(ring)

  // ─── Lighting ───────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x1a0a3e, 1.0)
  scene.add(ambient)

  const light1 = new THREE.PointLight(0xff00ff, 3, 150)
  light1.position.set(-60, 40, -60)
  scene.add(light1)

  const light2 = new THREE.PointLight(0x00ffff, 3, 150)
  light2.position.set(60, 40, 60)
  scene.add(light2)

  const light3 = new THREE.PointLight(0xff0080, 2, 120)
  light3.position.set(0, 50, 0)
  scene.add(light3)

  // ─── Neon Grid Floor ────────────────────────────────────────
  const gridSize = 400
  const gridDivisions = 80
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 2,
    transparent: true,
    opacity: 0.7
  })
  const grid = new THREE.GridHelper(gridSize, gridDivisions, 0xff00ff, 0x00ffff)
  grid.position.y = 0
  scene.add(grid)

  // Second grid layer
  const grid2 = new THREE.GridHelper(gridSize, gridDivisions, 0xff00ff, 0x00ffff)
  grid2.position.y = -0.1
  grid2.material = new THREE.LineBasicMaterial({
    color: 0x8800ff,
    linewidth: 1,
    transparent: true,
    opacity: 0.3
  })
  scene.add(grid2)

  // Glowing ground
  const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a0014,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.05
  ground.receiveShadow = true
  scene.add(ground)

  // ─── Neon Trees ─────────────────────────────────────────────
  function createNeonTree(x: number, z: number) {
    const group = new THREE.Group()

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 3, 6)
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.6
    })
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 1.5
    group.add(trunk)

    // Canopy (multiple layers)
    for (let i = 0; i < 3; i++) {
      const canopyGeo = new THREE.ConeGeometry(1.8 - i * 0.4, 2, 6)
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.5 + i * 0.1,
        flatShading: true
      })
      const canopy = new THREE.Mesh(canopyGeo, canopyMat)
      canopy.position.y = 4 + i * 1.2
      group.add(canopy)
    }

    // Glow ring
    const ringGeo = new THREE.TorusGeometry(2, 0.06, 8, 16)
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

  // Scatter neon trees
  for (let i = 0; i < 100; i++) {
    const x = (Math.random() - 0.5) * 300
    const z = (Math.random() - 0.5) * 300
    if (Math.hypot(x, z) > 25) {
      createNeonTree(x, z)
    }
  }

  // ─── Mountains ──────────────────────────────────────────────
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2
    const dist = 140 + Math.random() * 40
    const x = Math.cos(angle) * dist
    const z = Math.sin(angle) * dist

    const height = 40 + Math.random() * 30
    const mountainGeo = new THREE.ConeGeometry(25 + Math.random() * 10, height, 4)
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a3e,
      emissive: 0x4a0080,
      emissiveIntensity: 0.4,
      flatShading: true
    })
    const mountain = new THREE.Mesh(mountainGeo, mountainMat)
    mountain.position.set(x, height / 2, z)
    scene.add(mountain)

    // Neon wireframe
    const edges = new THREE.EdgesGeometry(mountainGeo)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.5
    })
    const wireframe = new THREE.LineSegments(edges, lineMat)
    wireframe.position.copy(mountain.position)
    scene.add(wireframe)
  }

  // ─── Floating Particles ─────────────────────────────────────
  const particleCount = 400
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 350
    positions[i * 3 + 1] = Math.random() * 40 + 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 350

    const colorChoice = Math.random()
    if (colorChoice < 0.33) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1
    } else if (colorChoice < 0.66) {
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1
    } else {
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.5
    }
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particleMat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  // ─── Roads ──────────────────────────────────────────────────
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x2d1b69,
    emissive: 0x8800ff,
    emissiveIntensity: 0.3
  })

  const roads = [
    { x: 0, z: 0, w: 8, d: 150 },
    { x: 0, z: 0, w: 150, d: 8 }
  ]

  roads.forEach(r => {
    const geo = new THREE.PlaneGeometry(r.w, r.d)
    const mesh = new THREE.Mesh(geo, pathMat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(r.x, 0.02, r.z)
    scene.add(mesh)
  })

  return { particles, lights: [light1, light2, light3], stars, planet, ring }
}
