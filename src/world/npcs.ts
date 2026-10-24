import * as THREE from 'three'
import { Testimonial } from './environment.js'

export class NPC {
  public group: THREE.Group
  public position: THREE.Vector3
  public testimonial: Testimonial
  public visible: boolean = false

  private bobTime: number = 0
  private speechBubble?: THREE.Group
  private light!: THREE.PointLight

  constructor(x: number, z: number, testimonial: Testimonial) {
    this.position = new THREE.Vector3(x, 0, z)
    this.testimonial = testimonial
    this.group = new THREE.Group()
    this.group.position.copy(this.position)

    this.buildModel()
  }

  private buildModel() {
    // Body (simple stylized human)
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.getRandomColor(),
      roughness: 0.6,
      metalness: 0.1
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.9
    body.castShadow = true
    this.group.add(body)

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0a9,
      roughness: 0.7
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.75
    head.castShadow = true
    this.group.add(head)

    // Eyes (simple dots)
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b })
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
    eyeL.position.set(-0.08, 1.8, 0.2)
    this.group.add(eyeL)
    const eyeR = eyeL.clone()
    eyeR.position.set(0.08, 1.8, 0.2)
    this.group.add(eyeR)

    // Name tag (floating above head)
    const tagGeo = new THREE.BoxGeometry(1.2, 0.4, 0.05)
    const tagMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0xf0a50b,
      emissiveIntensity: 0.3
    })
    const tag = new THREE.Mesh(tagGeo, tagMat)
    tag.position.y = 2.3
    this.group.add(tag)

    // Glow ring under feet
    const ringGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 16)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf0a50b,
      emissive: 0xf0a50b,
      emissiveIntensity: 1.5
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.05
    this.group.add(ring)

    // Point light when active
    const light = new THREE.PointLight(0xf0a50b, 0, 8)
    light.position.y = 2
    this.group.add(light)
    this.light = light
  }

  private getRandomColor(): number {
    const colors = [0xe94560, 0x00f3ff, 0x7c3aed, 0x10b981, 0xf0a50b, 0x3b82f6]
    return colors[Math.floor(Math.random() * colors.length)]
  }

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
    const bubbleGeo = new THREE.BoxGeometry(3.5, 1.5, 0.1)
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.5
    })
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)
    bubble.position.y = 3.2
    group.add(bubble)

    // Border glow
    const edgeGeo = new THREE.EdgesGeometry(bubbleGeo)
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xf0a50b, linewidth: 2 })
    const edge = new THREE.LineSegments(edgeGeo, edgeMat)
    edge.position.y = 3.2
    group.add(edge)

    // Name
    const nameCanvas = this.createTextCanvas(this.testimonial.name, 256, 64, '#f0a50b', 28)
    const nameTex = new THREE.CanvasTexture(nameCanvas)
    const nameGeo = new THREE.PlaneGeometry(2, 0.5)
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
    const nameMesh = new THREE.Mesh(nameGeo, nameMat)
    nameMesh.position.set(0, 3.6, 0.06)
    group.add(nameMesh)

    // Role
    const roleCanvas = this.createTextCanvas(this.testimonial.role, 256, 48, '#94a3b8', 20)
    const roleTex = new THREE.CanvasTexture(roleCanvas)
    const roleGeo = new THREE.PlaneGeometry(2.5, 0.4)
    const roleMat = new THREE.MeshBasicMaterial({ map: roleTex, transparent: true })
    const roleMesh = new THREE.Mesh(roleGeo, roleMat)
    roleMesh.position.set(0, 3.1, 0.06)
    group.add(roleMesh)

    // Text
    const textCanvas = this.createTextCanvas(this.testimonial.text, 512, 128, '#e2e8f0', 22)
    const textTex = new THREE.CanvasTexture(textCanvas)
    const textGeo = new THREE.PlaneGeometry(3.2, 0.8)
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true })
    const textMesh = new THREE.Mesh(textGeo, textMat)
    textMesh.position.set(0, 2.5, 0.06)
    group.add(textMesh)

    return group
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

  public update(delta: number) {
    this.bobTime += delta * 2
    this.group.position.y = Math.sin(this.bobTime) * 0.1
  }

  public getDistanceTo(point: THREE.Vector3): number {
    return this.position.distanceTo(point)
  }
}

// Predefined testimonials
export const testimonials: Testimonial[] = [
  {
    name: 'Ahmed Hassan',
    role: 'Client — Cairo, Egypt',
    text: '"محمد ده محترف فعلااً! الشغل كان فوق المتوقع."',
    avatar: ''
  },
  {
    name: 'Sarah Mitchell',
    role: 'Project Manager — London',
    text: '"Amazing work! The automation tool saved us hours."',
    avatar: ''
  },
  {
    name: 'Youssef Ali',
    role: 'Developer — Alexandria',
    text: '"تعلمت منهم كتير في البايثون والاوتوميشن."',
    avatar: ''
  },
  {
    name: 'Lisa Chen',
    role: 'Creative Director — NYC',
    text: '"The video editing skills are top-notch!"',
    avatar: ''
  },
  {
    name: 'Omar Farouk',
    role: 'Startup Founder — Dubai',
    text: '"Professional, fast, and creative. Highly recommend!"',
    avatar: ''
  }
]

export function createNPZones(scene: THREE.Scene): NPC[] {
  const npcs: NPC[] = []
  const npcPositions = [
    { x: -10, z: -5 },
    { x: 10, z: -5 },
    { x: -10, z: 10 },
    { x: 15, z: 10 },
    { x: 0, z: 15 }
  ]

  testimonials.forEach((t, i) => {
    const pos = npcPositions[i % npcPositions.length]
    const npc = new NPC(pos.x, pos.z, t)
    scene.add(npc.group)
    npcs.push(npc)
  })

  return npcs
}
