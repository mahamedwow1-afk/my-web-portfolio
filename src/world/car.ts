import * as THREE from 'three'

export class FuturisticHoverCar {
  public group: THREE.Group
  public position: THREE.Vector3
  public velocity: number = 0
  public angle: number = 0
  private hoverTime: number = 0
  private bodyTilt: number = 0

  // Constants
  private readonly MAX_SPEED = 1.2
  private readonly BOOST_MAX = 2.2
  private readonly ACCELERATION = 0.035
  private readonly BRAKE_FORCE = 0.07
  private readonly FRICTION = 0.94
  private readonly TURN_RATE = 0.048

  // Neon lights
  private frontLight!: THREE.PointLight
  private rearLight!: THREE.PointLight
  private underglowLight!: THREE.PointLight
  private thrusterLights: THREE.PointLight[] = []
  private glowRings: THREE.Mesh[] = []

  constructor() {
    this.group = new THREE.Group()
    this.position = this.group.position
    this.buildFuturisticHoverCar()
  }

  private buildFuturisticHoverCar() {
    // ─── 1. Main Chassis ───────────────────────────────────────
    const chassisGeo = new THREE.BoxGeometry(1.9, 0.4, 3.8)
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x12131a,
      metalness: 0.9,
      roughness: 0.15
    })
    const chassis = new THREE.Mesh(chassisGeo, chassisMat)
    chassis.position.set(0, 0, 0)
    chassis.castShadow = true
    chassis.receiveShadow = true
    this.group.add(chassis)

    // ─── 2. Front Hood ─────────────────────────────────────────
    const hoodGeo = new THREE.BoxGeometry(1.8, 0.25, 1.6)
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c10,
      metalness: 0.95,
      roughness: 0.1
    })
    const hood = new THREE.Mesh(hoodGeo, hoodMat)
    hood.position.set(0, 0.08, 1.1)
    hood.rotation.x = -0.1
    hood.castShadow = true
    this.group.add(hood)

    // ─── 3. Windshield & Cabin ─────────────────────────────────
    const cabinGeo = new THREE.BoxGeometry(1.45, 0.42, 1.8)
    const cabinMat = new THREE.MeshPhysicalMaterial({
      color: 0x050814,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    })
    const cabin = new THREE.Mesh(cabinGeo, cabinMat)
    cabin.position.set(0, 0.38, -0.2)
    cabin.rotation.x = -0.2
    this.group.add(cabin)

    // ─── 4. Cyan Headlight Bar ─────────────────────────────────
    const headlightGeo = new THREE.BoxGeometry(1.6, 0.08, 0.05)
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 6
    })
    const headlight = new THREE.Mesh(headlightGeo, headlightMat)
    headlight.position.set(0, 0.05, 1.91)
    this.group.add(headlight)

    // Front point light
    this.frontLight = new THREE.PointLight(0x00f3ff, 3.5, 6)
    this.frontLight.position.set(0, 0.1, 2.2)
    this.group.add(this.frontLight)

    // ─── 5. Magenta Taillight Bar ──────────────────────────────
    const taillightGeo = new THREE.BoxGeometry(1.7, 0.1, 0.05)
    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 8
    })
    const taillight = new THREE.Mesh(taillightGeo, taillightMat)
    taillight.position.set(0, 0.12, -1.91)
    this.group.add(taillight)

    // Rear point light
    this.rearLight = new THREE.PointLight(0xff0055, 3, 5)
    this.rearLight.position.set(0, 0.1, -2.2)
    this.group.add(this.rearLight)

    // ─── 6. Hover Thrusters ────────────────────────────────────
    const thrusterPositions = [
      [-0.85, -0.2, 1.1],   // front left
      [0.85, -0.2, 1.1],    // front right
      [-0.85, -0.2, -1.1],  // rear left
      [0.85, -0.2, -1.1]    // rear right
    ]

    thrusterPositions.forEach((pos, index) => {
      const thrusterGroup = new THREE.Group()
      thrusterGroup.position.set(pos[0], pos[1], pos[2])

      // Outer ring
      const ringGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.2, 16)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a24,
        metalness: 0.8,
        roughness: 0.3
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      thrusterGroup.add(ring)

      // Inner glow
      const glowGeo = new THREE.CylinderGeometry(0.26, 0.1, 0.12, 16)
      const glowMat = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 10,
        transparent: true,
        opacity: 0.9
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.position.y = -0.08
      thrusterGroup.add(glow)
      this.glowRings.push(glow)

      // Thruster light
      const thrusterLight = new THREE.PointLight(0x00f3ff, 2, 3)
      thrusterLight.position.y = -0.3
      thrusterGroup.add(thrusterLight)
      this.thrusterLights.push(thrusterLight)

      this.group.add(thrusterGroup)
    })

    // ─── 7. Underglow (Purple) ─────────────────────────────────
    this.underglowLight = new THREE.PointLight(0xa200ff, 5, 4)
    this.underglowLight.position.set(0, -0.4, 0)
    this.group.add(this.underglowLight)

    // ─── 8. Side Neon Strips ───────────────────────────────────
    const sideStripGeo = new THREE.BoxGeometry(0.05, 0.05, 3.6)
    const sideStripMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 4
    })
    const sideStripL = new THREE.Mesh(sideStripGeo, sideStripMat)
    sideStripL.position.set(0.98, 0, 0)
    this.group.add(sideStripL)

    const sideStripR = sideStripL.clone()
    sideStripR.position.set(-0.98, 0, 0)
    this.group.add(sideStripR)

    // ─── 9. Ground Shadow ──────────────────────────────────────
    const shadowGeo = new THREE.CircleGeometry(2.2, 32)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5
    })
    const shadow = new THREE.Mesh(shadowGeo, shadowMat)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -0.8
    this.group.add(shadow)

    // Initial position
    this.group.position.set(0, 0.5, 0)
  }

  public update(delta: number, controls: any) {
    this.hoverTime += delta * 4.5

    // Speed calculation
    const maxSpeed = controls.boost ? this.BOOST_MAX : this.MAX_SPEED

    if (controls.forward) {
      this.velocity = Math.min(this.velocity + this.ACCELERATION, maxSpeed)
    } else if (controls.backward) {
      this.velocity = Math.max(this.velocity - this.ACCELERATION, -maxSpeed * 0.4)
    } else {
      this.velocity *= this.FRICTION
    }

    if (controls.brake) {
      this.velocity *= (1 - this.BRAKE_FORCE)
    }

    if (controls.reset) {
      this.position.set(0, 0.5, 0)
      this.velocity = 0
      this.angle = 0
    }

    // Steering
    if (Math.abs(this.velocity) > 0.015) {
      const turnMult = Math.sign(this.velocity)
      if (controls.left) this.angle += this.TURN_RATE * turnMult
      if (controls.right) this.angle -= this.TURN_RATE * turnMult
    }

    // Movement (forward = +Z when angle = 0)
    this.position.x += Math.sin(this.angle) * this.velocity
    this.position.z += Math.cos(this.angle) * this.velocity

    // World bounds
    this.position.x = Math.max(-95, Math.min(95, this.position.x))
    this.position.z = Math.max(-95, Math.min(95, this.position.z))

    // Rotation
    this.group.rotation.y = this.angle

    // Hover animation (vertical bobbing)
    const hoverOffset = Math.sin(this.hoverTime) * 0.12 + 0.4
    this.group.position.y = hoverOffset

    // Slight tilt when moving
    this.bodyTilt = Math.sin(this.hoverTime * 1.5) * 0.02
    this.group.rotation.z = this.bodyTilt

    // Animate neon intensity based on speed
    const speedRatio = Math.abs(this.velocity) / this.MAX_SPEED

    this.glowRings.forEach(ring => {
      (ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 8 + speedRatio * 6
    })

    this.thrusterLights.forEach(light => {
      light.intensity = 2 + speedRatio * 3
    })

    this.frontLight.intensity = 3.5 + speedRatio * 2
    this.rearLight.intensity = 3 + speedRatio * 2
    this.underglowLight.intensity = 5 + speedRatio * 3
  }
}
