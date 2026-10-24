import * as THREE from 'three'

export class Cybercab {
  public group: THREE.Group
  public position: THREE.Vector3
  public velocity: number = 0
  public angle: number = 0

  private hoverTime: number = 0
  private bodyTilt: number = 0

  // Constants
  private readonly MAX_SPEED = 1.0
  private readonly BOOST_MAX = 1.8
  private readonly ACCELERATION = 0.03
  private readonly BRAKE_FORCE = 0.06
  private readonly FRICTION = 0.95
  private readonly TURN_RATE = 0.04

  private glowRings: THREE.Mesh[] = []
  private thrusterLight!: THREE.PointLight
  private headlightL!: THREE.SpotLight
  private headlightR!: THREE.SpotLight

  constructor() {
    this.group = new THREE.Group()
    this.position = this.group.position

    this.buildCybercab()
  }

  private buildCybercab() {
    // Main body - sleek metallic teardrop
    const bodyGeo = new THREE.SphereGeometry(1, 32, 24)
    bodyGeo.scale(2.8, 0.65, 1.4)

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xc0c8d0,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.5
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    this.group.add(body)

    // Glass canopy
    const canopyGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    canopyGeo.scale(1.5, 0.55, 1.05)
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      metalness: 0.95,
      roughness: 0.03,
      transparent: true,
      opacity: 0.75,
      envMapIntensity: 2.0
    })
    const canopy = new THREE.Mesh(canopyGeo, canopyMat)
    canopy.position.y = 0.5
    this.group.add(canopy)

    // Front LED bar (cyan)
    const frontBarGeo = new THREE.BoxGeometry(2.6, 0.08, 0.05)
    const frontBarMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 5
    })
    const frontBar = new THREE.Mesh(frontBarGeo, frontBarMat)
    frontBar.position.set(1.5, 0.12, 0)
    this.group.add(frontBar)

    // Rear LED bar (red/magenta)
    const rearBar = new THREE.Mesh(frontBarGeo, frontBarMat.clone())
    rearBar.material.emissive = new THREE.Color(0xff0066)
    rearBar.material.color = new THREE.Color(0xff0066)
    rearBar.position.set(-1.5, 0.12, 0)
    this.group.add(rearBar)

    // Side LED strips
    const sideBarGeo = new THREE.BoxGeometry(0.05, 0.05, 2.8)
    const sideBarMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 3
    })
    const sideBarL = new THREE.Mesh(sideBarGeo, sideBarMat)
    sideBarL.position.set(0, 0.08, 0.7)
    this.group.add(sideBarL)
    const sideBarR = sideBarL.clone()
    sideBarR.position.set(0, 0.08, -0.7)
    this.group.add(sideBarR)

    // Bottom underglow
    const underglowGeo = new THREE.BoxGeometry(2.5, 0.03, 1.2)
    const underglowMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 4
    })
    const underglow = new THREE.Mesh(underglowGeo, underglowMat)
    underglow.position.y = -0.35
    this.group.add(underglow)

    // Four anti-gravity pods
    const podPositions = [
      { x: 1.0, z: 0.75 },
      { x: 1.0, z: -0.75 },
      { x: -1.0, z: 0.75 },
      { x: -1.0, z: -0.75 }
    ]

    podPositions.forEach(pos => {
      // Pod housing
      const podGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.18, 16)
      const podMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.9,
        roughness: 0.15
      })
      const pod = new THREE.Mesh(podGeo, podMat)
      pod.position.set(pos.x, -0.45, pos.z)
      this.group.add(pod)

      // Glowing ring
      const ringGeo = new THREE.TorusGeometry(0.25, 0.06, 12, 24)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        emissive: 0x00d4ff,
        emissiveIntensity: 4
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.position.set(pos.x, -0.55, pos.z)
      this.group.add(ring)
      this.glowRings.push(ring)

      // Energy beam
      const beamGeo = new THREE.ConeGeometry(0.18, 1.0, 12)
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set(pos.x, -1.05, pos.z)
      beam.rotation.x = Math.PI
      this.group.add(beam)
    })

    // Thruster point light
    this.thrusterLight = new THREE.PointLight(0x00d4ff, 3, 15)
    this.thrusterLight.position.set(0, -0.8, 0)
    this.group.add(this.thrusterLight)

    // Headlights
    this.headlightL = new THREE.SpotLight(0x00ffff, 5, 40, Math.PI / 6, 0.5, 1)
    this.headlightL.position.set(1.3, 0.1, 0.4)
    this.headlightL.target.position.set(10, 0, 0.4)
    this.group.add(this.headlightL)
    this.group.add(this.headlightL.target)

    this.headlightR = new THREE.SpotLight(0x00ffff, 5, 40, Math.PI / 6, 0.5, 1)
    this.headlightR.position.set(1.3, 0.1, -0.4)
    this.headlightR.target.position.set(10, 0, -0.4)
    this.group.add(this.headlightR)
    this.group.add(this.headlightR.target)

    // Ground shadow
    const shadowGeo = new THREE.CircleGeometry(3, 32)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5
    })
    const shadow = new THREE.Mesh(shadowGeo, shadowMat)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -1.5
    this.group.add(shadow)

    // Set initial position
    this.group.position.set(0, 1, 0)
  }

  public update(delta: number, controls: any) {
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

    if (controls.reset) {
      this.position.set(0, 1, 0)
      this.velocity = 0
      this.angle = 0
    }

    // Steering
    if (Math.abs(this.velocity) > 0.01) {
      const turnMult = Math.sign(this.velocity)
      if (controls.left) this.angle += this.TURN_RATE * turnMult
      if (controls.right) this.angle -= this.TURN_RATE * turnMult
    }

    // Movement
    this.position.x += Math.sin(this.angle) * this.velocity
    this.position.z += Math.cos(this.angle) * this.velocity

    // World bounds
    this.position.x = Math.max(-90, Math.min(90, this.position.x))
    this.position.z = Math.max(-90, Math.min(90, this.position.z))

    // Rotation
    this.group.rotation.y = this.angle

    // Hover animation
    const hoverOffset = Math.sin(this.hoverTime) * 0.15
    this.group.position.y = 1.0 + hoverOffset

    // Body tilt when turning
    const targetTilt = controls.left ? 0.15 : (controls.right ? -0.15 : 0)
    this.bodyTilt += (targetTilt - this.bodyTilt) * 0.12
    this.group.rotation.z = this.bodyTilt

    // Animate glow intensity based on speed
    const speedRatio = Math.abs(this.velocity) / this.MAX_SPEED
    this.glowRings.forEach(ring => {
      (ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 3 + speedRatio * 3
    })

    // Pulse thruster light
    this.thrusterLight.intensity = 2 + Math.sin(this.hoverTime * 3) * 1 + speedRatio * 2

    // Pulse headlights
    this.headlightL.intensity = 4 + speedRatio * 3
    this.headlightR.intensity = 4 + speedRatio * 3
  }
}
