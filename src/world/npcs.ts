import * as THREE from 'three'
import { Testimonial } from './environment.js'

export class NPC {
  public group: THREE.Group
  public position: THREE.Vector3
  public testimonial: Testimonial
  public visible: boolean = false

  private bobTime: number = 0
  private speechBubble?: THREE.Group
  private idleTime: number = 0
  private walkDirection: number = 0
  private walkSpeed: number = 0
  private waveTimer: number = 0
  private isWaving: boolean = false

  constructor(x: number, z: number, testimonial: Testimonial) {
    this.position = new THREE.Vector3(x, 0, z)
    this.testimonial = testimonial
    this.group = new THREE.Group()
    this.group.position.copy(this.position)

    this.walkDirection = Math.random() * Math.PI * 2
    this.walkSpeed = 0.4 + Math.random() * 0.5
    this.idleTime = Math.random() * 10

    this.buildModel()
  }

  private buildModel() {
    // ─── Skin Tone ──────────────────────────────────────────────
    const skinColor = new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 0.6, 0.65)

    // ─── Body/Torso ─────────────────────────────────────────────
    const torsoGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8)
    const torsoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.45),
      emissive: new THREE.Color().setHSL(Math.random(), 0.9, 0.25),
      emissiveIntensity: 0.4,
      roughness: 0.5
    })
    const torso = new THREE.Mesh(torsoGeo, torsoMat)
    torso.position.y = 1.1
    torso.castShadow = true
    this.group.add(torso)

    // ─── Head ───────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16)
    const headMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.6
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.85
    head.castShadow = true
    this.group.add(head)

    // ─── Hair ───────────────────────────────────────────────────
    const hairGeo = new THREE.SphereGeometry(0.34, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 0.7, 0.15),
      roughness: 0.8
    })
    const hair = new THREE.Mesh(hairGeo, hairMat)
    hair.position.y = 1.88
    this.group.add(hair)

    // ─── Eyes ───────────────────────────────────────────────────
    const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e })
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
    eyeL.position.set(-0.11, 1.9, 0.26)
    this.group.add(eyeL)
    const eyeR = eyeL.clone()
    eyeR.position.set(0.11, 1.9, 0.26)
    this.group.add(eyeR)

    // Eye whites
    const whiteGeo = new THREE.SphereGeometry(0.07, 12, 12)
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const whiteL = new THREE.Mesh(whiteGeo, whiteMat)
    whiteL.position.set(-0.11, 1.9, 0.25)
    this.group.add(whiteL)
    const whiteR = whiteL.clone()
    whiteR.position.set(0.11, 1.9, 0.25)
    this.group.add(whiteR)

    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.02, 6, 6)
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const shineL = new THREE.Mesh(shineGeo, shineMat)
    shineL.position.set(-0.09, 1.93, 0.29)
    this.group.add(shineL)
    const shineR = shineL.clone()
    shineR.position.set(0.13, 1.93, 0.29)
    this.group.add(shineR)

    // ─── Smile ──────────────────────────────────────────────────
    const smileGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 12, Math.PI)
    const smileMat = new THREE.MeshStandardMaterial({ color: 0xcc4444 })
    const smile = new THREE.Mesh(smileGeo, smileMat)
    smile.position.set(0, 1.75, 0.28)
    smile.rotation.x = Math.PI
    this.group.add(smile)

    // ─── Arms ───────────────────────────────────────────────────
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.7, 8)
    const armMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.4),
      emissive: new THREE.Color().setHSL(Math.random(), 0.8, 0.2),
      emissiveIntensity: 0.3
    })

    const armL = new THREE.Mesh(armGeo, armMat)
    armL.position.set(-0.42, 1.15, 0)
    armL.rotation.z = 0.15
    this.group.add(armL)
    this.armL = armL

    const armR = new THREE.Mesh(armGeo, armMat.clone())
    armR.position.set(0.42, 1.15, 0)
    armR.rotation.z = -0.15
    this.group.add(armR)
    this.armR = armR

    // Hands
    const handGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const handL = new THREE.Mesh(handGeo, new THREE.MeshStandardMaterial({ color: skinColor }))
    handL.position.set(-0.45, 0.75, 0)
    this.group.add(handL)
    this.handL = handL

    const handR = new THREE.Mesh(handGeo, new THREE.MeshStandardMaterial({ color: skinColor }))
    handR.position.set(0.45, 0.75, 0)
    this.group.add(handR)
    this.handR = handR

    // ─── Legs ───────────────────────────────────────────────────
    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.7, 8)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a3e })

    const legL = new THREE.Mesh(legGeo, legMat)
    legL.position.set(-0.15, 0.35, 0)
    this.group.add(legL)
    this.legL = legL

    const legR = new THREE.Mesh(legGeo, legMat)
    legR.position.set(0.15, 0.35, 0)
    this.group.add(legR)
    this.legR = legR

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.15, 0.08, 0.25)
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5
    })
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat)
    shoeL.position.set(-0.15, 0.04, 0.05)
    this.group.add(shoeL)

    const shoeR = new THREE.Mesh(shoeGeo, shoeMat.clone())
    shoeR.position.set(0.15, 0.04, 0.05)
    this.group.add(shoeR)

    // ─── Glow Ring ──────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(0.45, 0.05, 8, 16)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.05
    this.group.add(ring)
    this.ring = ring

    // ─── Point Light ────────────────────────────────────────────
    const light = new THREE.PointLight(0x00ffff, 0, 8)
    light.position.y = 2
    this.group.add(light)
    this.light = light
  }

  private armL!: THREE.Mesh
  private armR!: THREE.Mesh
  private handL!: THREE.Mesh
  private handR!: THREE.Mesh
  private legL!: THREE.Mesh
  private legR!: THREE.Mesh
  private ring!: THREE.Mesh
  private light!: THREE.PointLight

  public activate() {
    if (this.visible) return
    this.visible = true
    this.speechBubble = this.createSpeechBubble()
    this.group.add(this.speechBubble)
    this.light.intensity = 2
  }

  public deactivate() {
    if (!this.visible) return
    this.visible = false
    if (this.speechBubble) {
      this.group.remove(this.speechBubble)
      this.speechBubble = undefined
    }
    this.light.intensity = 0
  }

  private createSpeechBubble(): THREE.Group {
    const group = new THREE.Group()

    // Bubble background (rounded)
    const bubbleGeo = new THREE.BoxGeometry(5, 2.8, 0.2, 4, 4, 1)
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x0a0014,
      emissive: 0x2d1b69,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    })
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)
    bubble.position.y = 4
    group.add(bubble)

    // Neon border
    const edgeGeo = new THREE.EdgesGeometry(bubbleGeo)
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2
    })
    const edge = new THREE.LineSegments(edgeGeo, edgeMat)
    edge.position.y = 4
    group.add(edge)

    // Stars
    const stars = this.testimonial.rating || 5
    const starCanvas = this.createStarCanvas(stars)
    const starTex = new THREE.CanvasTexture(starCanvas)
    const starGeo = new THREE.PlaneGeometry(3.5, 0.6)
    const starMat = new THREE.MeshBasicMaterial({ map: starTex, transparent: true })
    const starMesh = new THREE.Mesh(starGeo, starMat)
    starMesh.position.set(0, 4.9, 0.11)
    group.add(starMesh)

    // Name
    const nameCanvas = this.createTextCanvas(this.testimonial.name, 512, 64, '#00ffff', 32)
    const nameTex = new THREE.CanvasTexture(nameCanvas)
    const nameGeo = new THREE.PlaneGeometry(3, 0.6)
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
    const nameMesh = new THREE.Mesh(nameGeo, nameMat)
    nameMesh.position.set(0, 4.4, 0.11)
    group.add(nameMesh)

    // Role
    const roleCanvas = this.createTextCanvas(this.testimonial.role, 512, 48, '#ff00ff', 24)
    const roleTex = new THREE.CanvasTexture(roleCanvas)
    const roleGeo = new THREE.PlaneGeometry(4, 0.5)
    const roleMat = new THREE.MeshBasicMaterial({ map: roleTex, transparent: true })
    const roleMesh = new THREE.Mesh(roleGeo, roleMat)
    roleMesh.position.set(0, 4.0, 0.11)
    group.add(roleMesh)

    // Text
    const textCanvas = this.createTextCanvas(this.testimonial.text, 1024, 256, '#ffffff', 28)
    const textTex = new THREE.CanvasTexture(textCanvas)
    const textGeo = new THREE.PlaneGeometry(4.5, 1.2)
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true })
    const textMesh = new THREE.Mesh(textGeo, textMat)
    textMesh.position.set(0, 3.3, 0.11)
    group.add(textMesh)

    // Waving hand indicator
    const waveGeo = new THREE.SphereGeometry(0.2, 8, 8)
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0xffddaa,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    })
    const wave = new THREE.Mesh(waveGeo, waveMat)
    wave.position.set(2.6, 3.5, 0)
    wave.visible = false
    group.add(wave)
    this.waveIndicator = wave

    return group
  }

  private waveIndicator!: THREE.Mesh

  private createStarCanvas(count: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 48px Segoe UI'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const stars = '★'.repeat(count) + '☆'.repeat(5 - count)
    ctx.fillText(stars, 256, 32)
    return canvas
  }

  private createTextCanvas(text: string, width: number, height: number, color: string, fontSize: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // RTL support for Arabic
    ctx.direction = 'rtl'
    ctx.fillStyle = color
    ctx.font = `bold ${fontSize}px Segoe UI, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
    return canvas
  }

  public update(delta: number, carPos: THREE.Vector3) {
    this.bobTime += delta * 3
    this.group.position.y = Math.sin(this.bobTime) * 0.08

    // Walking logic
    this.idleTime += delta
    if (this.idleTime > 3 + Math.random() * 3) {
      this.walkDirection = Math.random() * Math.PI * 2
      this.idleTime = 0
    }

    // Move NPC
    const moveX = Math.sin(this.walkDirection) * this.walkSpeed * delta
    const moveZ = Math.cos(this.walkDirection) * this.walkSpeed * delta
    this.group.position.x += moveX
    this.group.position.z += moveZ

    // Keep within bounds
    this.group.position.x = Math.max(-100, Math.min(100, this.group.position.x))
    this.group.position.z = Math.max(-100, Math.min(100, this.group.position.z))

    // Face walking direction
    this.group.rotation.y = this.walkDirection

    // Animate limbs
    const walkCycle = Math.sin(this.bobTime * 2)
    if (this.armL && this.armR) {
      this.armL.rotation.x = walkCycle * 0.6
      this.armR.rotation.x = -walkCycle * 0.6
    }
    if (this.legL && this.legR) {
      this.legL.rotation.x = -walkCycle * 0.5
      this.legR.rotation.x = walkCycle * 0.5
    }

    // Wave when activated
    if (this.visible && this.waveIndicator) {
      this.waveTimer += delta
      this.waveIndicator.position.y = 3.5 + Math.sin(this.waveTimer * 4) * 0.3
      this.waveIndicator.visible = true
    }

    // Pulse ring
    if (this.ring) {
      (this.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5 + Math.sin(this.bobTime * 2) * 0.5
    }
  }

  public getDistanceTo(point: THREE.Vector3): number {
    return this.group.position.distanceTo(point)
  }
}

// Predefined testimonials
export const testimonials: Testimonial[] = [
  {
    name: 'أحمد',
    role: 'عميل — القاهرة',
    text: 'محمد محترف جدااً! الشغل كان خرافي',
    rating: 5
  },
  {
    name: 'Sarah',
    role: 'Project Manager',
    text: 'Amazing work! Saved us hours!',
    rating: 5
  },
  {
    name: 'يوسف',
    role: 'مطور — الإسكندرية',
    text: 'تعلمت منهم الكتير في البايثون',
    rating: 4
  },
  {
    name: 'Lisa',
    role: 'Creative Director',
    text: 'Top-notch video editing!',
    rating: 5
  },
  {
    name: 'عمر',
    role: 'مؤسس شركة — دبي',
    text: 'Professional, fast, and creative!',
    rating: 5
  },
  {
    name: 'نور',
    role: 'مصممة — بيروت',
    text: 'إبداع وتصميم سابق لعصره!',
    rating: 5
  },
  {
    name: 'Alex',
    role: 'Developer — London',
    text: 'Super creative and futuristic!',
    rating: 5
  }
]

export function createNPCZones(scene: THREE.Scene): NPC[] {
  const npcs: NPC[] = []

  // Random positions within world bounds
  const positions = testimonials.map((_, i) => {
    const angle = (i / testimonials.length) * Math.PI * 2 + Math.random() * 0.8
    const dist = 15 + Math.random() * 60
    return {
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist
    }
  })

  testimonials.forEach((t, i) => {
    const pos = positions[i]
    const npc = new NPC(pos.x, pos.z, t)
    scene.add(npc.group)
    npcs.push(npc)
  })

  return npcs
}
