import * as THREE from 'three'

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

  // Character types for variety
  private characterType: number = 0

  constructor(x: number, z: number, testimonial: Testimonial, type: number = 0) {
    this.position = new THREE.Vector3(x, 0, z)
    this.testimonial = testimonial
    this.characterType = type
    this.group = new THREE.Group()
    this.group.position.copy(this.position)

    this.walkDirection = Math.random() * Math.PI * 2
    this.walkSpeed = 0.3 + Math.random() * 0.4
    this.idleTime = Math.random() * 10

    this.buildModel()
  }

  private buildModel() {
    // Different skin tones based on character type
    const skinTones = [
      new THREE.Color(0xffdbac), // Light
      new THREE.Color(0xd4a574), // Medium
      new THREE.Color(0x8d5524), // Dark
      new THREE.Color(0xc68642), // Olive
      new THREE.Color(0xf1c27d)  // Wheat
    ]
    const skinColor = skinTones[this.characterType % skinTones.length]

    // Clothing colors (neon cyberpunk style)
    const clothingColors = [
      new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
      new THREE.Color(0x00ffff), // Cyan
      new THREE.Color(0xff00ff), // Magenta
      new THREE.Color(0x00ff88), // Neon green
      new THREE.Color(0xff8800)  // Orange
    ]
    const clothingColor = clothingColors[this.characterType % clothingColors.length]

    // ─── Legs ───────────────────────────────────────────────────
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.65, 8)
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a3e,
      roughness: 0.7
    })
    this.legL = new THREE.Mesh(legGeo, legMat)
    this.legL.position.set(-0.12, 0.33, 0)
    this.group.add(this.legL)

    this.legR = new THREE.Mesh(legGeo.clone(), legMat)
    this.legR.position.set(0.12, 0.33, 0)
    this.group.add(this.legR)

    // Shoes (glowing)
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.22)
    const shoeMat = new THREE.MeshStandardMaterial({
      color: clothingColor,
      emissive: clothingColor,
      emissiveIntensity: 0.4
    })
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat)
    shoeL.position.set(-0.12, 0.04, 0.03)
    this.group.add(shoeL)

    const shoeR = new THREE.Mesh(shoeGeo.clone(), shoeMat.clone())
    shoeR.position.set(0.12, 0.04, 0.03)
    this.group.add(shoeR)

    // ─── Torso ──────────────────────────────────────────────────
    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.85, 8)
    const torsoMat = new THREE.MeshStandardMaterial({
      color: clothingColor,
      emissive: clothingColor,
      emissiveIntensity: 0.25,
      roughness: 0.5,
      metalness: 0.3
    })
    const torso = new THREE.Mesh(torsoGeo, torsoMat)
    torso.position.y = 1.05
    torso.castShadow = true
    this.group.add(torso)

    // Jacket/hoodie details
    const jacketGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.5, 8)
    const jacketMat = new THREE.MeshStandardMaterial({
      color: clothingColor.clone().multiplyScalar(0.7),
      emissive: clothingColor,
      emissiveIntensity: 0.15,
      roughness: 0.6
    })
    const jacket = new THREE.Mesh(jacketGeo, jacketMat)
    jacket.position.y = 1.15
    this.group.add(jacket)

    // ─── Arms ───────────────────────────────────────────────────
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.6, 8)
    const armMat = new THREE.MeshStandardMaterial({
      color: clothingColor,
      emissive: clothingColor,
      emissiveIntensity: 0.2
    })

    this.armL = new THREE.Mesh(armGeo, armMat)
    this.armL.position.set(-0.38, 1.0, 0)
    this.armL.rotation.z = 0.2
    this.group.add(this.armL)

    this.armR = new THREE.Mesh(armGeo.clone(), armMat.clone())
    this.armR.position.set(0.38, 1.0, 0)
    this.armR.rotation.z = -0.2
    this.group.add(this.armR)

    // Hands
    const handGeo = new THREE.SphereGeometry(0.07, 8, 8)
    const handL = new THREE.Mesh(handGeo, new THREE.MeshStandardMaterial({ color: skinColor }))
    handL.position.set(-0.42, 0.65, 0)
    this.group.add(handL)

    const handR = new THREE.Mesh(handGeo.clone(), new THREE.MeshStandardMaterial({ color: skinColor }))
    handR.position.set(0.42, 0.65, 0)
    this.group.add(handR)

    // ─── Head ───────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16)
    const headMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.6
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.72
    head.castShadow = true
    this.group.add(head)

    // ─── Hair ───────────────────────────────────────────────────
    const hairStyles = [
      () => this.createShortHair(skinColor),
      () => this.createLongHair(skinColor),
      () => this.createSpikyHair(skinColor),
      () => this.createBald(skinColor),
      () => this.createCurlyHair(skinColor)
    ]
    const createHair = hairStyles[this.characterType % hairStyles.length]
    createHair()

    // ─── Eyes ───────────────────────────────────────────────────
    const eyeWhiteGeo = new THREE.SphereGeometry(0.065, 12, 12)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const eyeLWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat)
    eyeLWhite.position.set(-0.1, 1.76, 0.23)
    this.group.add(eyeLWhite)

    const eyeRWhite = new THREE.Mesh(eyeWhiteGeo.clone(), eyeWhiteMat)
    eyeRWhite.position.set(0.1, 1.76, 0.23)
    this.group.add(eyeRWhite)

    const irisGeo = new THREE.SphereGeometry(0.04, 10, 10)
    const irisColors = [0x4a3728, 0x1a1a2e, 0x2d5a27, 0x8b4513, 0x000000]
    const irisMat = new THREE.MeshStandardMaterial({ color: irisColors[this.characterType % irisColors.length] })
    const eyeLIris = new THREE.Mesh(irisGeo, irisMat)
    eyeLIris.position.set(-0.1, 1.76, 0.27)
    this.group.add(eyeLIris)

    const eyeRIris = new THREE.Mesh(irisGeo.clone(), irisMat.clone())
    eyeRIris.position.set(0.1, 1.76, 0.27)
    this.group.add(eyeRIris)

    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.015, 6, 6)
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const shineL = new THREE.Mesh(shineGeo, shineMat)
    shineL.position.set(-0.085, 1.78, 0.29)
    this.group.add(shineL)

    const shineR = new THREE.Mesh(shineGeo.clone(), shineMat.clone())
    shineR.position.set(0.115, 1.78, 0.29)
    this.group.add(shineR)

    // ─── Mouth (smile) ──────────────────────────────────────────
    const smileGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 12, Math.PI)
    const smileMat = new THREE.MeshStandardMaterial({ color: 0xcc4444 })
    const smile = new THREE.Mesh(smileGeo, smileMat)
    smile.position.set(0, 1.62, 0.24)
    smile.rotation.x = Math.PI
    this.group.add(smile)

    // ─── Glow Ring ──────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(0.42, 0.04, 8, 16)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2.5
    })
    this.ring = new THREE.Mesh(ringGeo, ringMat)
    this.ring.rotation.x = Math.PI / 2
    this.ring.position.y = 0.05
    this.group.add(this.ring)

    // ─── Point Light ────────────────────────────────────────────
    this.light = new THREE.PointLight(0x00ffff, 0, 8)
    this.light.position.y = 2
    this.group.add(this.light)
  }

  // Hair style creators
  private createShortHair(skinColor: THREE.Color) {
    const hairGeo = new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.15),
      roughness: 0.8
    })
    const hair = new THREE.Mesh(hairGeo, hairMat)
    hair.position.y = 1.75
    this.group.add(hair)
  }

  private createLongHair(skinColor: THREE.Color) {
    const hairGeo = new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.6, 0.12),
      roughness: 0.8
    })
    const hair = new THREE.Mesh(hairGeo, hairMat)
    hair.position.y = 1.76
    this.group.add(hair)

    // Long hair back
    const backGeo = new THREE.CylinderGeometry(0.25, 0.15, 0.8, 8)
    const backHair = new THREE.Mesh(backGeo, hairMat)
    backHair.position.set(0, 1.45, -0.15)
    this.group.add(backHair)
  }

  private createSpikyHair(skinColor: THREE.Color) {
    const baseGeo = new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.25),
      roughness: 0.7
    })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.y = 1.76
    this.group.add(base)

    // Spikes
    for (let i = 0; i < 5; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.06, 0.2, 6)
      const spike = new THREE.Mesh(spikeGeo, baseMat)
      const angle = (i / 5) * Math.PI - Math.PI / 2
      spike.position.set(
        Math.sin(angle) * 0.15,
        1.95,
        Math.cos(angle) * 0.15 - 0.05
      )
      spike.rotation.z = -angle * 0.5
      this.group.add(spike)
    }
  }

  private createBald(skinColor: THREE.Color) {
    // Just the head, maybe some sideburns
    const sideburnGeo = new THREE.BoxGeometry(0.05, 0.12, 0.05)
    const sideburnMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.6, 0.15),
      roughness: 0.8
    })
    const sbL = new THREE.Mesh(sideburnGeo, sideburnMat)
    sbL.position.set(-0.26, 1.78, 0)
    this.group.add(sbL)
    const sbR = sbL.clone()
    sbR.position.set(0.26, 1.78, 0)
    this.group.add(sbR)
  }

  private createCurlyHair(skinColor: THREE.Color) {
    const baseGeo = new THREE.SphereGeometry(0.34, 12, 12)
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.12),
      roughness: 0.9
    })
    const base = new THREE.Mesh(baseGeo, hairMat)
    base.position.y = 1.78
    this.group.add(base)

    // Curly bumps
    for (let i = 0; i < 8; i++) {
      const curlGeo = new THREE.SphereGeometry(0.08, 8, 8)
      const curl = new THREE.Mesh(curlGeo, hairMat)
      const angle = (i / 8) * Math.PI * 2
      curl.position.set(
        Math.cos(angle) * 0.25,
        1.85 + Math.sin(angle * 2) * 0.05,
        Math.sin(angle) * 0.25
      )
      this.group.add(curl)
    }
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

    // Bubble background
    const bubbleGeo = new THREE.BoxGeometry(5.5, 3.2, 0.25, 4, 4, 1)
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x0a0014,
      emissive: 0x2d1b69,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.95
    })
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)
    bubble.position.y = 4.2
    group.add(bubble)

    // Neon border
    const edgeGeo = new THREE.EdgesGeometry(bubbleGeo)
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2
    })
    const edge = new THREE.LineSegments(edgeGeo, edgeMat)
    edge.position.y = 4.2
    group.add(edge)

    // Stars
    const stars = this.testimonial.rating || 5
    const starCanvas = this.createStarCanvas(stars)
    const starTex = new THREE.CanvasTexture(starCanvas)
    const starGeo = new THREE.PlaneGeometry(4, 0.7)
    const starMat = new THREE.MeshBasicMaterial({ map: starTex, transparent: true })
    const starMesh = new THREE.Mesh(starGeo, starMat)
    starMesh.position.set(0, 5.4, 0.13)
    group.add(starMesh)

    // Name
    const nameCanvas = this.createTextCanvas(this.testimonial.name, 512, 64, '#00ffff', 36)
    const nameTex = new THREE.CanvasTexture(nameCanvas)
    const nameGeo = new THREE.PlaneGeometry(3.5, 0.6)
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
    const nameMesh = new THREE.Mesh(nameGeo, nameMat)
    nameMesh.position.set(0, 4.8, 0.13)
    group.add(nameMesh)

    // Role
    const roleCanvas = this.createTextCanvas(this.testimonial.role, 512, 48, '#ff00ff', 26)
    const roleTex = new THREE.CanvasTexture(roleCanvas)
    const roleGeo = new THREE.PlaneGeometry(4.5, 0.5)
    const roleMat = new THREE.MeshBasicMaterial({ map: roleTex, transparent: true })
    const roleMesh = new THREE.Mesh(roleGeo, roleMat)
    roleMesh.position.set(0, 4.3, 0.13)
    group.add(roleMesh)

    // Text
    const textCanvas = this.createTextCanvas(this.testimonial.text, 1024, 256, '#ffffff', 30)
    const textTex = new THREE.CanvasTexture(textCanvas)
    const textGeo = new THREE.PlaneGeometry(5, 1.3)
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true })
    const textMesh = new THREE.Mesh(textGeo, textMat)
    textMesh.position.set(0, 3.5, 0.13)
    group.add(textMesh)

    // Waving indicator
    const waveGeo = new THREE.SphereGeometry(0.25, 8, 8)
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0xffddaa,
      emissive: 0xffaa00,
      emissiveIntensity: 0.4
    })
    const wave = new THREE.Mesh(waveGeo, waveMat)
    wave.position.set(3, 3.8, 0)
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
    ctx.font = 'bold 52px Segoe UI'
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

    // Bounds
    this.group.position.x = Math.max(-90, Math.min(90, this.group.position.x))
    this.group.position.z = Math.max(-90, Math.min(90, this.group.position.z))

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

    // Wave animation
    if (this.visible && this.waveIndicator) {
      this.waveTimer += delta
      this.waveIndicator.position.y = 3.8 + Math.sin(this.waveTimer * 5) * 0.4
      this.waveIndicator.visible = true
    }

    // Pulse ring
    if (this.ring) {
      (this.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(this.bobTime * 2) * 0.8
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
    text: 'محمد محترف جداااً! الشغل كان خرافي',
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

export interface Testimonial {
  name: string
  role: string
  text: string
  rating?: number
}

export function createNPCZones(scene: THREE.Scene): NPC[] {
  const npcs: NPC[] = []

  // Random positions
  const positions = testimonials.map((_, i) => {
    const angle = (i / testimonials.length) * Math.PI * 2 + Math.random() * 0.8
    const dist = 18 + Math.random() * 55
    return {
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist
    }
  })

  testimonials.forEach((t, i) => {
    const pos = positions[i]
    const npc = new NPC(pos.x, pos.z, t, i % 5) // Different character types
    scene.add(npc.group)
    npcs.push(npc)
  })

  return npcs
}
