import * as THREE from 'three'

export interface Testimonial {
  name: string
  role: string
  text: string
  rating?: number
}

export function createSynthwaveEnvironment(scene: THREE.Scene) {
  // ─── Background & Fog ───────────────────────────────────────
  scene.background = new THREE.Color(0x09071b)
  scene.fog = new THREE.FogExp2(0x09071b, 0.008)

  // ─── Starfield ──────────────────────────────────────────────
  const starCount = 3000
  const starGeo = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    const radius = 300 + Math.random() * 400
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    starPositions[i3 + 2] = radius * Math.cos(phi)

    const colorChoice = Math.random()
    if (colorChoice < 0.5) {
      starColors[i3] = 1; starColors[i3 + 1] = 1; starColors[i3 + 2] = 1
    } else if (colorChoice < 0.75) {
      starColors[i3] = 0.6; starColors[i3 + 1] = 0.8; starColors[i3 + 2] = 1
    } else {
      starColors[i3] = 1; starColors[i3 + 1] = 0.6; starColors[i3 + 2] = 0.8
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

  // ─── Nebula Clouds ──────────────────────────────────────────
  for (let i = 0; i < 12; i++) {
    const geo = new THREE.SphereGeometry(40 + Math.random() * 60, 16, 16)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.75 + Math.random() * 0.2, 0.9, 0.3),
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const cloud = new THREE.Mesh(geo, mat)
    cloud.position.set(
      (Math.random() - 0.5) * 400,
      60 + Math.random() * 120,
      (Math.random() - 0.5) * 400
    )
    cloud.scale.set(1, 0.4, 1)
    scene.add(cloud)
  }

  // ─── Lighting ───────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x1a0b2e, 0.8)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0x4a0080, 0x0a0014, 0.4)
  scene.add(hemi)

  const rimLight1 = new THREE.DirectionalLight(0x00ffff, 1.2)
  rimLight1.position.set(-50, 30, -50)
  scene.add(rimLight1)

  const rimLight2 = new THREE.DirectionalLight(0xff00ff, 1.0)
  rimLight2.position.set(50, 30, 50)
  scene.add(rimLight2)

  const sunLight = new THREE.DirectionalLight(0xff6600, 1.5)
  sunLight.position.set(100, 80, -100)
  scene.add(sunLight)

  // ─── Reflective Ground ──────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(600, 600)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a0014,
    roughness: 0.15,
    metalness: 0.9,
    transparent: true,
    opacity: 0.9
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.1
  ground.receiveShadow = true
  scene.add(ground)

  // ─── Neon Grid Floor ────────────────────────────────────────
  const gridSize = 600
  const divisions = 120
  const cellSize = gridSize / divisions

  const linePositions: number[] = []
  const lineColors: number[] = []

  for (let i = -divisions / 2; i <= divisions / 2; i++) {
    const x = i * cellSize
    const z = -gridSize / 2
    linePositions.push(x, 0, z, x, 0, z + cellSize)
    lineColors.push(0, 1, 1, 0, 1, 1)
    linePositions.push(x, 0, z, x + cellSize, 0, z)
    lineColors.push(0, 1, 1, 0, 1, 1)
  }

  for (let i = -divisions / 2; i <= divisions / 2; i += 5) {
    const x = i * cellSize
    linePositions.push(x, 0.02, -gridSize / 2, x, 0.02, gridSize / 2)
    lineColors.push(1, 0, 1, 1, 0, 1)
    linePositions.push(-gridSize / 2, 0.02, x, gridSize / 2, 0.02, x)
    lineColors.push(1, 0, 1, 1, 0, 1)
  }

  const gridGeo = new THREE.BufferGeometry()
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  gridGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))

  const gridMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })
  const grid = new THREE.LineSegments(gridGeo, gridMat)
  scene.add(grid)

  // Secondary grid
  const grid2Geo = new THREE.BufferGeometry()
  const grid2Positions: number[] = []
  for (let i = -divisions / 2; i <= divisions / 2; i++) {
    const x = i * cellSize
    grid2Positions.push(x, -0.1, -gridSize / 2, x, -0.1, gridSize / 2)
    grid2Positions.push(-gridSize / 2, -0.1, x, gridSize / 2, -0.1, x)
  }
  grid2Geo.setAttribute('position', new THREE.Float32BufferAttribute(grid2Positions, 3))
  const grid2Mat = new THREE.LineBasicMaterial({
    color: 0x4a0080,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  })
  const grid2 = new THREE.LineSegments(grid2Geo, grid2Mat)
  scene.add(grid2)

  // ─── Floating Particles ─────────────────────────────────────
  const particleCount = 500
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 400
    positions[i * 3 + 1] = Math.random() * 50 + 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400

    const hue = Math.random()
    if (hue < 0.33) {
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1
    } else if (hue < 0.66) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1
    } else {
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.5
    }
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particleMat = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  // ─── Mountains ──────────────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    const dist = 180 + Math.random() * 60
    const x = Math.cos(angle) * dist
    const z = Math.sin(angle) * dist
    const height = 50 + Math.random() * 40

    const geo = new THREE.ConeGeometry(30 + Math.random() * 15, height, 4)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a0a3e,
      emissive: 0x4a0080,
      emissiveIntensity: 0.3,
      flatShading: true,
      transparent: true,
      opacity: 0.7
    })
    const mountain = new THREE.Mesh(geo, mat)
    mountain.position.set(x, height / 2 - 10, z)
    scene.add(mountain)

    const edges = new THREE.EdgesGeometry(geo)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
    const wireframe = new THREE.LineSegments(edges, lineMat)
    wireframe.position.copy(mountain.position)
    scene.add(wireframe)
  }

  // ─── Horizon Glow ───────────────────────────────────────────
  const glowGeo = new THREE.PlaneGeometry(600, 20)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.set(0, 15, -200)
  scene.add(glow)

  const glow2 = glow.clone()
  glow2.material = glowMat.clone()
  glow2.material.color = new THREE.Color(0x00ffff)
  glow2.material.opacity = 0.15
  glow2.position.z = -180
  glow2.scale.set(1.2, 0.5, 1)
  scene.add(glow2)

  // ─── Neon Trees ─────────────────────────────────────────────
  for (let i = 0; i < 100; i++) {
    const x = (Math.random() - 0.5) * 350
    const z = (Math.random() - 0.5) * 350
    if (Math.hypot(x, z) > 30) {
      const treeGroup = new THREE.Group()

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 3, 6)
      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.6
      })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 1.5
      treeGroup.add(trunk)

      // Canopy layers
      for (let j = 0; j < 3; j++) {
        const canopyGeo = new THREE.ConeGeometry(1.8 - j * 0.4, 2, 6)
        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0x00ff88,
          emissive: 0x00ff88,
          emissiveIntensity: 0.5 + j * 0.1,
          flatShading: true
        })
        const canopy = new THREE.Mesh(canopyGeo, canopyMat)
        canopy.position.y = 4 + j * 1.2
        treeGroup.add(canopy)
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
      treeGroup.add(ring)

      treeGroup.position.set(x, 0, z)
      scene.add(treeGroup)
    }
  }

  return { stars, particles }
}
