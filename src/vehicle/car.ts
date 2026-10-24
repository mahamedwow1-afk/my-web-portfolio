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
  public bodyGroup: THREE.Group
  public position: THREE.Vector3

  private velocity = 0
  private angle = 0
  private roll = 0
  private pitch = 0
  private hoverTime = 0

  private readonly MAX_SPEED = 0.9
  private readonly BOOST_SPEED = 1.5
  private readonly ACCEL = 0.025
  private readonly BRAKE_FORCE = 0.05
  private readonly FRICTION = 0.97
  private readonly TURN_SPEED = 0.035

  private thrusterGlows: THREE.Mesh[] = []

  constructor() {
    this.group = new THREE.Group()
    this.bodyGroup = new THREE.Group()
    this.group.add(this.bodyGroup)
    this.position = this.group.position

    this.buildCybercabModel()
  }

  private buildCybercabModel() {
    // Futuristic Tesla Cybercab shape: angular, sleek, metallic
    // Front is +Z, Back is -Z

    // 1. Main Wedge Body
    const bodyShape = new THREE.Shape()
    // Side profile (Z is length -2.2 to +2.2, Y is height 0 to 1.1)
    bodyShape.moveTo(-2.2, 0.3) // Rear bottom
    bodyShape.lineTo(2.0, 0.2)  // Front bottom nose
    bodyShape.lineTo(1.8, 0.5)  // Front hood slope
    bodyShape.lineTo(0.2, 1.1)  // Windshield apex
    bodyShape.lineTo(-1.5, 1.0) // Roof to rear slope
    bodyShape.lineTo(-2.2, 0.6) // Rear top
    bodyShape.closePath()

    const extrudeSettings = {
      steps: 1,
      depth: 1.8,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    }

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings)
    bodyGeo.center() // Center geometry at origin

    const cyberMat = new THREE.MeshStandardMaterial({
      color: 0xd0d7de,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.5
    })

    const bodyMesh = new THREE.Mesh(bodyGeo, cyberMat)
    bodyMesh.castShadow = true
    bodyMesh.receiveShadow = true
    // Rotate geometry so length extends along Z (Front = +Z, Back = -Z)
    bodyMesh.rotation.y = Math.PI / 2
    bodyMesh.position.y = 0.6
    this.bodyGroup.add(bodyMesh)

    // 2. Glass Canopy / Windshield (Dark Tinted)
    const glassGeo = new THREE.BoxGeometry(1.6, 0.5, 1.8)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0a1128,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85
    })
    const glass = new THREE.Mesh(glassGeo, glassMat)
    glass.position.set(0, 0.9, 0.1)
    this.bodyGroup.add(glass)

    // 3. Front Light Strip (Cyan Cyber Glow)
    const frontLightGeo = new THREE.BoxGeometry(1.7, 0.08, 0.1)
    const frontLightMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 3.0
    })
    const frontLight = new THREE.Mesh(frontLightGeo, frontLightMat)
    frontLight.position.set(0, 0.55, 2.1)
    this.bodyGroup.add(frontLight)

    // 4. Rear Light Strip (Red Bar)
    const rearLightMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 2.5
    })
    const rearLight = new THREE.Mesh(frontLightGeo, rearLightMat)
    rearLight.position.set(0, 0.65, -2.15)
    this.bodyGroup.add(rearLight)

    // 5. Four Anti-Gravity Hover Pods (No Wheels!)
    const podPositions = [
      { x: -1.0, z: 1.3 },
      { x: 1.0, z: 1.3 },
      { x: -1.0, z: -1.3 },
      { x: 1.0, z: -1.3 }
    ]

    const podGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.25, 16)
    const podMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 })

    const ringGeo = new THREE.TorusGeometry(0.32, 0.06, 12, 24)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 2.0
    })

    podPositions.forEach(p => {
      const pod = new THREE.Mesh(podGeo, podMat)
      pod.position.set(p.x, 0.2, p.z)
      this.bodyGroup.add(pod)

      const glowRing = new THREE.Mesh(ringGeo, ringMat)
      glowRing.rotation.x = Math.PI / 2
      glowRing.position.set(p.x, 0.08, p.z)
      this.bodyGroup.add(glowRing)
      this.thrusterGlows.push(glowRing)

      // Downward energy light
      const beamGeo = new THREE.ConeGeometry(0.3, 0.5, 12)
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.4
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set(p.x, -0.2, p.z)
      beam.rotation.x = Math.PI
      this.bodyGroup.add(beam)
    })

    // Ground shadow disk beneath hover car
    const shadowGeo = new THREE.CircleGeometry(2.2, 32)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    })
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.y = -0.45
    this.group.add(shadowMesh)
  }

  public update(delta: number, ctrl: HoverCarControls) {
    this.hoverTime += delta * 3.5

    // Speed calculation
    const topSpeed = ctrl.boost ? this.BOOST_SPEED : this.MAX_SPEED

    if (ctrl.forward) {
      this.velocity = Math.min(this.velocity + this.ACCEL, topSpeed)
    } else if (ctrl.backward) {
      this.velocity = Math.max(this.velocity - this.ACCEL, -topSpeed * 0.5)
    } else {
      this.velocity *= this.FRICTION
    }

    if (ctrl.brake) {
      this.velocity *= (1 - this.BRAKE_FORCE)
    }

    // Steering
    if (Math.abs(this.velocity) > 0.005) {
      const turnMult = Math.sign(this.velocity)
      if (ctrl.left) this.angle += this.TURN_SPEED * turnMult
      if (ctrl.right) this.angle -= this.TURN_SPEED * turnMult
    }

    // Reset position
    if (ctrl.reset) {
      this.group.position.set(0, 0.8, 0)
      this.velocity = 0
      this.angle = 0
      this.roll = 0
      this.pitch = 0
    }

    // Movement: Front is +Z, so heading vector is (sin(angle), 0, cos(angle))
    this.group.position.x += Math.sin(this.angle) * this.velocity
    this.group.position.z += Math.cos(this.angle) * this.velocity
    this.group.rotation.y = this.angle

    // World boundary clamp
    this.group.position.x = Math.max(-90, Math.min(90, this.group.position.x))
    this.group.position.z = Math.max(-90, Math.min(90, this.group.position.z))

    // Hover floating height animation (smooth sine wave)
    const hoverHeight = 0.8 + Math.sin(this.hoverTime) * 0.12
    this.group.position.y = hoverHeight

    // Lean / Bank dynamics
    const targetRoll = ctrl.left ? 0.15 : (ctrl.right ? -0.15 : 0)
    const targetPitch = ctrl.forward ? -0.08 : (ctrl.backward ? 0.08 : 0)

    this.roll += (targetRoll - this.roll) * 0.1
    this.pitch += (targetPitch - this.pitch) * 0.1

    this.bodyGroup.rotation.z = this.roll
    this.bodyGroup.rotation.x = this.pitch

    // Thruster glow intensity animation
    const intensity = 1.5 + Math.abs(this.velocity) * 2.5 + Math.sin(this.hoverTime * 2) * 0.5
    this.thrusterGlows.forEach(g => {
      (g.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity
    })
  }

  public getVelocity(): number {
    return this.velocity
  }

  public getAngle(): number {
    return this.angle
  }
}
