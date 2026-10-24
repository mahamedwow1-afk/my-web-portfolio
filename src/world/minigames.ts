import * as THREE from 'three'

export class NeonRamp {
  public group: THREE.Group
  public position: THREE.Vector3

  constructor(x: number, z: number, color: number = 0x00ffff) {
    this.group = new THREE.Group()
    this.position = this.group.position

    this.buildRamp(color)
    this.group.position.set(x, 0, z)
  }

  private buildRamp(color: number) {
    const colorThree = new THREE.Color(color)

    // Ramp surface - angled platform
    const rampGeo = new THREE.BoxGeometry(6, 0.3, 12)
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.3
    })
    const ramp = new THREE.Mesh(rampGeo, rampMat)
    ramp.position.y = 1.5
    ramp.rotation.x = -0.3  // 17 degree incline
    ramp.castShadow = true
    ramp.receiveShadow = true
    this.group.add(ramp)

    // Glowing edge strips
    const edgeGeo = new THREE.BoxGeometry(6.1, 0.05, 0.05)
    const edgeMat = new THREE.MeshStandardMaterial({
      color: colorThree,
      emissive: colorThree,
      emissiveIntensity: 4
    })

    // Top edge
    const topEdge = new THREE.Mesh(edgeGeo, edgeMat)
    topEdge.position.set(0, 2.8, -4.5)
    topEdge.rotation.x = -0.3
    this.group.add(topEdge)

    // Bottom edge
    const bottomEdge = new THREE.Mesh(edgeGeo, edgeMat)
    bottomEdge.position.set(0, 0.3, 4.5)
    this.group.add(bottomEdge)

    // Side edges
    const sideGeo = new THREE.BoxGeometry(0.05, 0.05, 12)
    const sideL = new THREE.Mesh(sideGeo, edgeMat.clone())
    sideL.position.set(-3, 1.5, 0)
    sideL.rotation.x = -0.3
    this.group.add(sideL)

    const sideR = sideL.clone()
    sideR.position.set(3, 1.5, 0)
    this.group.add(sideR)

    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.9,
      roughness: 0.2
    })
    const pillarPositions = [[-2.5, 0.75, 4], [2.5, 0.75, 4], [-2.5, 0.75, -2], [2.5, 0.75, -2]]
    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.set(pos[0], pos[1], pos[2])
      pillar.castShadow = true
      this.group.add(pillar)
    })

    // Glow light underneath
    const glowLight = new THREE.PointLight(colorThree, 2, 10)
    glowLight.position.set(0, 0.5, 0)
    this.group.add(glowLight)
  }
}

export class NeonRing {
  public group: THREE.Group
  public position: THREE.Vector3
  public baseY: number
  private bobTime: number

  constructor(x: number, y: number, z: number, color: number = 0xff00ff) {
    this.group = new THREE.Group()
    this.position = this.group.position
    this.baseY = y
    this.bobTime = Math.random() * Math.PI * 2

    this.buildRing(color)
    this.group.position.set(x, y, z)
  }

  private buildRing(color: number) {
    const colorThree = new THREE.Color(color)

    // Main ring
    const ringGeo = new THREE.TorusGeometry(3, 0.15, 16, 32)
    const ringMat = new THREE.MeshStandardMaterial({
      color: colorThree,
      emissive: colorThree,
      emissiveIntensity: 5,
      transparent: true,
      opacity: 0.9
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    this.group.add(ring)

    // Inner glow ring
    const innerRingGeo = new THREE.TorusGeometry(2.5, 0.05, 8, 32)
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: colorThree,
      emissiveIntensity: 3,
      transparent: true,
      opacity: 0.5
    })
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat)
    this.group.add(innerRing)

    // Point light in center
    const light = new THREE.PointLight(colorThree, 3, 8)
    this.group.add(light)
  }

  public update(delta: number) {
    this.bobTime += delta * 2
    this.group.position.y = this.baseY + Math.sin(this.bobTime) * 0.5
    this.group.rotation.x = Math.sin(this.bobTime * 0.5) * 0.1
  }
}

export function createMiniGameElements(scene: THREE.Scene) {
  const ramps: NeonRamp[] = []
  const rings: NeonRing[] = []

  // Scattered ramps around the map
  const rampPositions = [
    { x: 30, z: -30, color: 0x00ffff },
    { x: -35, z: 25, color: 0xff00ff },
    { x: 45, z: 40, color: 0x00ff88 },
    { x: -50, z: -45, color: 0xffaa00 },
  ]

  rampPositions.forEach(p => {
    const ramp = new NeonRamp(p.x, p.z, p.color)
    scene.add(ramp.group)
    ramps.push(ramp)
  })

  // Floating rings scattered across the map
  const ringPositions = [
    { x: 20, y: 8, z: -20, color: 0x00ffff },
    { x: -25, y: 10, z: -35, color: 0xff00ff },
    { x: 35, y: 12, z: 15, color: 0xffaa00 },
    { x: -40, y: 9, z: 30, color: 0x00ff88 },
    { x: 0, y: 15, z: -50, color: 0xff00aa },
    { x: -60, y: 11, z: -10, color: 0xaa00ff },
    { x: 55, y: 8, z: -55, color: 0x00aaff },
    { x: 10, y: 14, z: 50, color: 0xff5500 },
  ]

  ringPositions.forEach(p => {
    const ring = new NeonRing(p.x, p.y, p.z, p.color)
    scene.add(ring.group)
    rings.push(ring)
  })

  return { ramps, rings }
}
