import * as THREE from 'three'

export class Cybercar {
  public group: THREE.Group
  public position: THREE.Vector3
  public velocity: number = 0
  public angle: number = 0

  private hoverTime: number = 0
  private bodyTilt: number = 0

  // Constants
  private readonly MAX_SPEED = 1.1
  private readonly BOOST_MAX = 2.0
  private readonly ACCELERATION = 0.035
  private readonly BRAKE_FORCE = 0.07
  private readonly FRICTION = 0.94
  private readonly TURN_RATE = 0.045

  private glowRings: THREE.Mesh[] = []
  private thrusterLight!: THREE.PointLight
  private headlightL!: THREE.SpotLight
  private headlightR!: THREE.SpotLight

  constructor() {
    this.group = new THREE.Group()
    this.position = this.group.position

    this.buildCar()
  }

  private buildCar() {
    // ─── Main Body (sleek metallic) ──────────────────────────
    const bodyGeo = new THREE.SphereGeometry(1, 32, 24)
    bodyGeo.scale(3.0, 0.7, 1.5)

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd0d7de,
      metalness: 0.96,
      roughness: 0.1,
      envMapIntensity: 2.0
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    this.group.add(body)

    // ─── Glass Canopy ──────────────────────────────────────────
    const canopyGeo = new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    canopyGeo.scale(1.6, 0.6, 1.1)
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      metalness: 0.95,
      roughness: 0.02,
      transparent: true,
      opacity: 0.7,
      envMapIntensity: 3.0
    })
    const canopy = new THREE.Mesh(canopyGeo, canopyMat)
    canopy.position.y = 0.55
    this.group.add(canopy)

    // ─── Front LED Bar (cyan) ─────────────────────────────────
    const frontBarGeo = new THREE.BoxGeometry(2.8, 0.1, 0.06)
    const frontBarMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 6
    })
    const frontBar = new THREE.Mesh(frontBarGeo, frontBarMat)
    frontBar.position.set(1.6, 0.18, 0)
    this.group.add(frontBar)

    // ─── Rear LED Bar (magenta) ───────────────────────────────
    const rearBar = new THREE.Mesh(frontBarGeo, frontBarMat.clone())
    rearBar.material.emissive = new THREE.Color(0xff0066)
    rearBar.material.color = new THREE.Color(0xff0066)
    rearBar.position.set(-1.6, 0.18, 0)
    this.group.add(rearBar)

    // ─── Side LED Strips ───────────────────────────────────────
    const sideBarGeo = new THREE.BoxGeometry(0.06, 0.06, 3.2)
    const sideBarMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 4
    })
    const sideBarL = new THREE.Mesh(sideBarGeo, sideBarMat)
    sideBarL.position.set(0, 0.12, 0.75)
    this.group.add(sideBarL)

    const sideBarR = sideBarL.clone()
    sideBarR.position.set(0, 0.12, -0.75)
    this.group.add(sideBarR)

    // ─── Bottom Underglow ──────────────────────────────────────
    const underglowGeo = new THREE.BoxGeometry(2.8, 0.04, 1.4)
    const underglowMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 5
    })
    const underglow = new THREE.Mesh(underglowGeo, underglowMat)
    underglow.position.y = -0.42
    this.group.add(underglow)

    // ─── Anti-Gravity Pods ─────────────────────────────────────
    const podPositions = [
      { x: 1.1, z: 0.85 },
      { x: 1.1, z: -0.85 },
      { x: -1.1, z: 0.85 },
      { x: -1.1, z: -0.85 }
    ]

    podPositions.forEach(pos => {
      // Pod housing
      const podGeo = new THREE.CylinderGeometry(0.25, 0.32, 0.2, 16)
      const podMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.92,
        roughness: 0.12
      })
      const pod = new THREE.Mesh(podGeo, podMat)
      pod.position.set(pos.x, -0.52, pos.z)
      this.group.add(pod)

      // Glowing ring
      const ringGeo = new THREE.TorusGeometry(0.28, 0.07, 12, 24)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        emissive: 0x00d4ff,
        emissiveIntensity: 5
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.set(pos.x, -0.63, pos.z)
      this.group.add(ring)
      this.glowRings.push(ring)

      // Energy beam
      const beamGeo = new THREE.ConeGeometry(0.2, 1.2, 12)
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.35
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set(pos.x, -1.23, pos.z)
      beam.rotation.x = Math.PI
      this.group.add(beam)
    })

    // ─── Thruster Light ────────────────────────────────────────
    this.thrusterLight = new THREE.PointLight(0x00d4ff, 4, 18)
    this.thrusterLight.position.set(0, -0.9, 0)
    this.group.add(this.thrusterLight)

    // ─── Headlights ────────────────────────────────────────────
    this.headlightL = new THREE.SpotLight(0x00ffff, 8, 50, Math.PI / 5, 0.6, 1)
    this.headlightL.position.set(1.5, 0.15, 0.5)
    this.headlightL.target.position.set(15, 0, 0.5)
    this.group.add(this.headlightL)
    this.group.add(this.headlightL.target)

    this.headlightR = new THREE.SpotLight(0x00ffff, 8, 50, Math.PI / 5, 0.6, 1)
    this.headlightR.position.set(1.5, 0.15, -0.5)
    this.headlightR.target.position.set(15, 0, -0.5)
    this.group.add(this.headlightR)
    this.group.add(this.headlightR.target)

    // ─── Ground Shadow ─────────────────────────────────────────
    const shadowGeo = new THREE.CircleGeometry(3.5, 32)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55
    })
    const shadow = new THREE.Mesh(shadowGeo, shadowMat)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -1.8
    this.group.add(shadow)

    // Initial position
    this.group.position.set(0, 1.2, 0)
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
      this.position.set(0, 1.2, 0)
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

    // Hover animation
    const hoverOffset = Math.sin(this.hoverTime) * 0.18
    this.group.position.y = 1.2 + hoverOffset

    // Body tilt when turning
    const targetTilt = controls.left ? 0.18 : (controls.right ? -0.18 : 0)
    this.bodyTilt += (targetTilt - this.bodyTilt) * 0.14
    this.group.rotation.z = this.bodyTilt

    // Animate glow based on speed
    const speedRatio = Math.abs(this.velocity) / this.MAX_SPEED
    this.glowRings.forEach(ring => {
      (ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 4 + speedRatio * 4
    })

    // Pulse thruster light
    this.thrusterLight.intensity = 3 + Math.sin(this.hoverTime * 3.5) * 1.5 + speedRatio * 3

    // Pulse headlights
    this.headlightL.intensity = 6 + speedRatio * 4
    this.headlightR.intensity = 6 + speedRatio * 4
  }
}
