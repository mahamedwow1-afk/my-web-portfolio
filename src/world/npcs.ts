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

  constructor(x: number, z: number, testimonial: Testimonial) {
    this.position = new THREE.Vector3(x, 0, z)
    this.testimonial = testimonial
    this.group = new THREE.Group()
    this.group.position.copy(this.position)

    this.walkDirection = Math.random() * Math.PI * 2
    this.walkSpeed = 0.3 + Math.random() * 0.4
    this.idleTime = Math.random() * 10

    this.buildModel()
  }

  private buildModel() {
    // ─── Body ─────────────────────────────────────────────────
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
      emissive: new THREE.Color().setHSL(Math.random(), 0.9, 0.3),
      emissiveIntensity: 0.3,
      roughness: 0.4
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.8
    body.castShadow = true
    this.group.add(body)

    // ─── Head (cartoon style) ─────────────────────────────────
    const headGeo = new THREE.SphereGeometry(0.28, 12, 12)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.6
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.6
    head.castShadow = true
    this.group.add(head)

    // ─── Eyes ───────────────────────────────────────────────────
    const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e })
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
    eyeL.position.set(-0.1, 1.65, 0.22)
    this.group.add(eyeL)
    const eyeR = eyeL.clone()
    eyeR.position.set(0.1, 1.65, 0.22)
    this.group.add(eyeR)

    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.02, 6, 6)
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const shineL = new THREE.Mesh(shineGeo, shineMat)
    shineL.position.set(-0.08, 1.68, 0.26)
    this.group.add(shineL)
    const shineR = shineL.clone()
    shineR.position.set(0.12, 1.68, 0.26)
    this.group.add(shineR)

    // ─── Hair/Helmet ────────────────────────────────────────────
    const hairGeo = new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.2),
      roughness: 0.8
    })
    const hair = new THREE.Mesh(hairGeo, hairMat)
    hair.position.y = 1.7
    this.group.add(hair)

    // ─── Arms ───────────────────────────────────────────────────
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6)
    const armMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
      emissive: new THREE.Color().setHSL(Math.random(), 0.9, 0.2),
      emissiveIntensity: 0.2
    })

    const armL = new THREE.Mesh(armGeo, armMat)
    armL.position.set(-0.35, 0.9, 0)
    armL.rotation.z = 0.2
    this.group.add(armL)
    this.armL = armL

    const armR = new THREE.Mesh(armGeo, armMat.clone())
    armR.position.set(0.35, 0.9, 0)
    armR.rotation.z = -0.2
    this.group.add(armR)
    this.armR = armR

    // ─── Legs ───────────────────────────────────────────────────
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2d1b69 })

    const legL = new THREE.Mesh(legGeo, legMat)
    legL.position.set(-0.12, 0.25, 0)
    this.group.add(legL)
    this.legL = legL

    const legR = new THREE.Mesh(legGeo, legMat)
    legR.position.set(0.12, 0.25, 0)
    this.group.add(legR)
    this.legR = legR

    // ─── Glow Ring ──────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(0.4, 0.04, 8, 16)
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
    const light = new THREE.PointLight(0x00ffff, 0, 6)
    light.position.y = 1.5
    this.group.add(light)
    this.light = light
  }

  private armL!: THREE.Mesh
  private armR!: THREE.Mesh
  private legL!: THREE.Mesh
  private legR!: THREE.Mesh
  private ring!: THREE.Mesh
  private light!: THREE.PointLight

  public activate() {
    if (this.visible) return
    this.visible = true
    this.speechBubble = this.createSpeechBubble()
    this.group.add(this.speechBubble)
    this.light.intensity = 1.5
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

    // Bubble background
    const bubbleGeo = new THREE.BoxGeometry(4, 2, 0.15)
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x0a0014,
      emissive: 0x2d1b69,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    })
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)
    bubble.position.y = 3.5
    group.add(bubble)

    // Neon border
    const edgeGeo = new THREE.EdgesGeometry(bubbleGeo)
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2
    })
    const edge = new THREE.LineSegments(edgeGeo, edgeMat)
    edge.position.y = 3.5
    group.add(edge)

    // Stars
    const stars = this.testimonial.rating || 5
    const starCanvas = this.createStarCanvas(stars)
    const starTex = new THREE.CanvasTexture(starCanvas)
    const starGeo = new THREE.PlaneGeometry(2.5, 0.4)
    const starMat = new THREE.MeshBasicMaterial({ map: starTex, transparent: true })
    const starMesh = new THREE.Mesh(starGeo, starMat)
    starMesh.position.set(0, 4.2, 0.08)
    group.add(starMesh)

    // Name
    const nameCanvas = this.createTextCanvas(this.testimonial.name, 256, 64, '#00ffff', 28)
    const nameTex = new THREE.CanvasTexture(nameCanvas)
    const nameGeo = new THREE.PlaneGeometry(2.2, 0.5)
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
    const nameMesh = new THREE.Mesh(nameGeo, nameMat)
    nameMesh.position.set(0, 3.8, 0.08)
    group.add(nameMesh)

    // Role
    const roleCanvas = this.createTextCanvas(this.testimonial.role, 256, 48, '#ff00ff', 20)
    const roleTex = new THREE.CanvasTexture(roleCanvas)
    const roleGeo = new THREE.PlaneGeometry(2.8, 0.4)
    const roleMat = new THREE.MeshBasicMaterial({ map: roleTex, transparent: true })
    const roleMesh = new THREE.Mesh(roleGeo, roleMat)
    roleMesh.position.set(0, 3.4, 0.08)
    group.add(roleMesh)

    // Text
    const textCanvas = this.createTextCanvas(this.testimonial.text, 512, 128, '#ffffff', 22)
    const textTex = new THREE.CanvasTexture(textCanvas)
    const textGeo = new THREE.PlaneGeometry(3.5, 0.9)
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true })
    const textMesh = new THREE.Mesh(textGeo, textMat)
    textMesh.position.set(0, 2.8, 0.08)
    group.add(textMesh)

    return group
  }

  private createStarCanvas(count: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 40px Segoe UI'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const stars = '★'.repeat(count) + '☆'.repeat(5 - count)
    ctx.fillText(stars, 128, 32)
    return canvas
  }

  private createTextCanvas(text: string, width: number, height: number, color: string, fontSize: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
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

    // Walking animation
    this.idleTime += delta
    if (this.idleTime > 3 + Math.random() * 2) {
      this.walkDirection = Math.random() * Math.PI * 2
      this.idleTime = 0
    }

    // Move NPC
    const moveX = Math.sin(this.walkDirection) * this.walkSpeed * delta
    const moveZ = Math.cos(this.walkDirection) * this.walkSpeed * delta
    this.group.position.x += moveX
    this.group.position.z += moveZ

    // Keep within bounds
    this.group.position.x = Math.max(-80, Math.min(80, this.group.position.x))
    this.group.position.z = Math.max(-80, Math.min(80, this.group.position.z))

    // Face walking direction
    this.group.rotation.y = this.walkDirection

    // Animate limbs
    const walkCycle = Math.sin(this.bobTime * 2)
    if (this.armL && this.armR) {
      this.armL.rotation.x = walkCycle * 0.5
      this.armR.rotation.x = -walkCycle * 0.5
    }
    if (this.legL && this.legR) {
      this.legL.rotation.x = -walkCycle * 0.4
      this.legR.rotation.x = walkCycle * 0.4
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
    text: '"محمد محترف جداً! الشغل كان خرافي"',
    rating: 5
  },
  {
    name: 'Sarah',
    role: 'Project Manager',
    text: '"Amazing work! Saved us hours!"',
    rating: 5
  },
  {
    name: 'يوسف',
    role: 'مطور — الإسكندرية',
    text: '"تعلمت منهم الكتير في البايثون"',
    rating: 4
  },
  {
    name: 'Lisa',
    role: 'Creative Director',
    text: '"Top-notch video editing!"',
    rating: 5
  },
  {
    name: 'عمر',
    role: 'مؤسس شركة — دبي',
    text: '"Professional, fast, and creative!"',
    rating: 5
  },
  {
    name: 'Nour',
    role: 'Designer — Beirut',
    text: '"إبداع وتصميم سابق لعصره!"',
    rating: 5
  },
  {
    name: 'Alex',
    role: 'Developer — London',
    text: '"Super creative and futuristic!"',
    rating: 5
  }
]

export function createNPCZones(scene: THREE.Scene): NPC[] {
  const npcs: NPC[] = []

  // Random positions within world bounds
  const positions = testimonials.map((_, i) => {
    const angle = (i / testimonials.length) * Math.PI * 2 + Math.random() * 0.5
    const dist = 15 + Math.random() * 50
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
