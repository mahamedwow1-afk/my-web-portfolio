import * as THREE from 'three'

export interface Testimonial {
  name: string
  role: string
  text: string
  avatar: string
}

export function createEnvironment(scene: THREE.Scene) {
  // ─── Better Lighting ────────────────────────────────────────
  // Warm ambient
  const ambient = new THREE.AmbientLight(0xffeedd, 0.4)
  scene.add(ambient)

  // Golden hour sun
  const sun = new THREE.DirectionalLight(0xffaa55, 2.2)
  sun.position.set(60, 50, -40)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 250
  sun.shadow.camera.left = -100
  sun.shadow.camera.right = 100
  sun.shadow.camera.top = 100
  sun.shadow.camera.bottom = -100
  sun.shadow.bias = -0.001
  scene.add(sun)

  // Cool fill from opposite side
  const fill = new THREE.DirectionalLight(0x4488cc, 0.5)
  fill.position.set(-40, 30, 50)
  scene.add(fill)

  // Hemisphere for sky/ground color blending
  const hemi = new THREE.HemisphereLight(0xffd4a0, 0x1e293b, 0.5)
  scene.add(hemi)

  // ─── Sun visual (glowing orb) ──────────────────────────────
  const sunGeo = new THREE.SphereGeometry(4, 16, 16)
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 })
  const sunMesh = new THREE.Mesh(sunGeo, sunMat)
  sunMesh.position.copy(sun.position).multiplyScalar(2)
  scene.add(sunMesh)

  // Sun glow halo
  const glowGeo = new THREE.SphereGeometry(7, 16, 16)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffaa55,
    transparent: true,
    opacity: 0.15
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.copy(sunMesh.position)
  scene.add(glow)

  // ─── Ground with gradient-like material ────────────────────
  const groundGeo = new THREE.PlaneGeometry(300, 300, 60, 60)
  // Slight vertex displacement for terrain feel
  const pos = groundGeo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getY(i)
    const dist = Math.sqrt(x * x + z * z)
    // Flatten center area, gentle hills at edges
    if (dist > 40) {
      pos.setZ(i, (Math.sin(x * 0.05) * Math.cos(z * 0.05)) * 1.5)
    }
  }
  groundGeo.computeVertexNormals()

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.1
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Grid lines (subtle)
  const grid = new THREE.GridHelper(300, 60, 0x334155, 0x1e293b)
  grid.position.y = 0.03
  scene.add(grid)

  // ─── Fog ───────────────────────────────────────────────────
  scene.fog = new THREE.FogExp2(0x1a1a2e, 0.005)
  scene.background = new THREE.Color(0x1a1a2e)

  // ─── Decorative Trees ──────────────────────────────────────
  function createTree(x: number, z: number, scale: number = 1) {
    const group = new THREE.Group()

    const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, 3 * scale, 6)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 1.5 * scale
    trunk.castShadow = true
    group.add(trunk)

    const topGeo = new THREE.ConeGeometry(1.8 * scale, 3.5 * scale, 6)
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.7,
      flatShading: true
    })
    const top = new THREE.Mesh(topGeo, topMat)
    top.position.y = 4.5 * scale
    top.castShadow = true
    group.add(top)

    group.position.set(x, 0, z)
    scene.add(group)
    return group
  }

  // Place trees scattered
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 25 + Math.random() * 100
    const x = Math.cos(angle) * dist
    const z = Math.sin(angle) * dist
    const scale = 0.7 + Math.random() * 0.6
    createTree(x, z, scale)
  }

  // ─── Rocks ──────────────────────────────────────────────────
  function createRock(x: number, z: number) {
    const geo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.8, 1)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      flatShading: true
    })
    const rock = new THREE.Mesh(geo, mat)
    rock.position.set(x, 0.3, z)
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    rock.castShadow = true
    rock.receiveShadow = true
    scene.add(rock)
  }

  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 180
    const z = (Math.random() - 0.5) * 180
    if (Math.hypot(x, z) > 15) createRock(x, z)
  }

  // ─── Path/road between zones ────────────────────────────────
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
    metalness: 0.05
  })

  // Main paths connecting zones
  const paths = [
    // Horizontal path
    { x: 0, z: 0, w: 50, d: 3 },
    // Vertical path
    { x: 0, z: 0, w: 3, d: 50 },
    // Diagonal paths
    { x: -20, z: -20, w: 20, d: 3, rot: Math.PI / 4 },
    { x: 20, z: -20, w: 20, d: 3, rot: -Math.PI / 4 },
  ]

  paths.forEach(p => {
    const geo = new THREE.PlaneGeometry(p.w, p.d)
    const mesh = new THREE.Mesh(geo, pathMat)
    mesh.rotation.x = -Math.PI / 2
    if (p.rot) mesh.rotation.z = p.rot
    mesh.position.set(p.x, 0.05, p.z)
    mesh.receiveShadow = true
    scene.add(mesh)
  })

  // ─── Floating particles (dust/pollen in golden light) ──────
  const particleCount = 200
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200
    positions[i * 3 + 1] = Math.random() * 20 + 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMat = new THREE.PointsMaterial({
    color: 0xffd4a0,
    size: 0.3,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  return { particles, sunMesh, glow }
}
