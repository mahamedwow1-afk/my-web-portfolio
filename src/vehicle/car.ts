import * as THREE from 'three'

export interface HoverCarControls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  brake: boolean
  boost: boolean
  reset: boolean
}

export class HoverCar {
  public group: THREE.Group
  public position: THREE.Vector3
  public velocity: number = 0
  public angle: number = 0

  private hoverOffset: number = 0
  private bodyTilt: number = 0
  private hoverTime: number = 0

  // Constants
  private readonly MAX_SPEED = 0.9
  private readonly BOOST_MAX = 1.6
  private readonly ACCELERATION = 0.025
  private readonly BRAKE_FORCE = 0.05
  private readonly FRICTION = 0.96
  private readonly TURN_RATE = 0.035

  // Glow elements
  private glowRings: THREE.Mesh[] = []
  private thrusterLights: THREE.PointLight[] = []

  constructor() {
    this.group = new THREE.Group()
    this.position = this.group.position

    this.buildCybercab()
  }

  private buildCybercab() {
    // Main body - sleek teardrop shape
    const bodyGeo = new THREE.SphereGeometry(1, 32, 24)
    bodyGeo.scale(2.5, 0.7, 1.3)

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd0d7de,
      metalness: 0.95,
      roughness: 0.15
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    this.group.add(body)

    // Glass canopy (windshield)
    const canopyGeo = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    canopyGeo.scale(1.4, 0.6, 1)
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.8
    })
    const canopy = new THREE.Mesh(canopyGeo, canopyMat)
    canopy.position.y = 0.45
    this.group.add(canopy)

    // Front LED light bar (cyan)
    const frontBarGeo = new THREE.BoxGeometry(2.2, 0.06, 0.04)
    const frontBarMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 4
    })
    const frontBar = new THREE.Mesh(frontBarGeo, frontBarMat)
    frontBar.position.set(1.3, 0.15, 0)
    this.group.add(frontBar)

    // Rear LED light bar (red)
    const rearBar = new THREE.Mesh(frontBarGeo, frontBarMat.clone())
    rearBar.material.color.set(0xff0055)
    rearBar.material.emissive.set(0xff0055)
    rearBar.position.set(-1.3, 0.15, 0)
    this.group.add(rearBar)

    // Side LED strips
    const sideBarGeo = new THREE.BoxGeometry(0.04, 0.04, 2.4)
    const sideBarMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 2
    })
    const sideBarL = new THREE.Mesh(sideBarGeo, sideBarMat)
    sideBarL.position.set(0, 0.1, 0.65)
    this.group.add(sideBarL)
    const sideBarR = sideBarL.clone()
    sideBarR.position.set(0, 0.1, -0.65)
    this.group.add(sideBarR)

    // Four anti-gravity pods (hover engines)
    const podPositions = [
      { x: 0.9, z: 0.7 },
      { x: 0.9, z: -0.7 },
      { x: -0.9, z: 0.7 },
      { x: -0.9, z: -0.7 }
    ]

    podPositions.forEach(pos => {
      // Pod housing
      const podGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.15, 16)
      const podMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.9,
        roughness: 0.2
      })
      const pod = new THREE.Mesh(podGeo, podMat)
      pod.position.set(pos.x, -0.4, pos.z)
      this.group.add(pod)

      // Glowing ring
      const ringGeo = new THREE.TorusGeometry(0.22, 0.05, 12, 24)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        emissive: 0x00d4ff,
        emissiveIntensity: 3
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.set(pos.x, -0.5, pos.z)
      this.group.add(ring)
      this.glowRings.push(ring)

      // Energy beam (downward cone)
      const beamGeo = new THREE.ConeGeometry(0.15, 0.8, 12)
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.25
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set(pos.x, -0.9, pos.z)
      beam.rotation.x = Math.PI // Point down
      this.group.add(beam)
    })

    // Underglow light
    const underglow = new THREE.PointLight(0x00d4ff, 1.5, 8)
    underglow.position.set(0, -0.6, 0)
    this.group.add(underglow)
    this.thrusterLights.push(underglow)

    // Ground shadow
    const shadowGeo = new THREE.CircleGeometry(2.5, 32)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    })
    const shadow = new THREE.Mesh(shadowGeo, shadowMat)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -1.2
    this.group.add(shadow)
  }

  public update(delta: number, controls: HoverCarControls) {
    this.hoverTime += delta * 4

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

    // Reset
    if (controls.reset) {
      this.position.set(0, 0, 0)
      this.velocity = 0
      this.angle = 0
    }

    // Steering
    if (Math.abs(this.velocity) > 0.01) {
      const turnMult = Math.sign(this.velocity)
      if (controls.left) this.angle += this.TURN_RATE * turnMult
      if (controls.right) this.angle -= this.TURN_RATE * turnMult
    }

    // Movement: Forward = +Z direction when angle = 0
    this.position.x += Math.sin(this.angle) * this.velocity
    this.position.z += Math.cos(this.angle) * this.velocity

    // World bounds
    this.position.x = Math.max(-90, Math.min(90, this.position.x))
    this.position.z = Math.max(-90, Math.min(90, this.position.z))

    // Rotate car to face direction of movement
    this.group.rotation.y = this.angle

    // Hover animation
    this.hoverOffset = Math.sin(this.hoverTime) * 0.12
    this.group.position.y = 0.8 + this.hoverOffset

    // Body tilt when turning
    const targetTilt = controls.left ? 0.12 : (controls.right ? -0.12 : 0)
    this.bodyTilt += (targetTilt - this.bodyTilt) * 0.15
    this.group.rotation.z = this.bodyTilt

    // Animate glow intensity based on speed
    const glowIntensity = 2 + Math.abs(this.velocity) * 2.5
    this.glowRings.forEach(ring => {
      (ring.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity
    })

    // Pulse thruster lights
    this.thrusterLights.forEach(light => {
      light.intensity = 1 + Math.sin(this.hoverTime * 3) * 0.5 + Math.abs(this.velocity)
    })
  }
}
