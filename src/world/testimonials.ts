import * as THREE from 'three'

export interface TestimonialData {
  id: number
  name: string
  role: string
  review: string
  fullReview: string
  rating: number
  avatarUrl: string
  location: string
  pos: [number, number, number]
  color: string
}

export const CHARACTERS_DATA: TestimonialData[] = [
  {
    id: 1, name: 'سارة أحمد', role: 'UI/UX Designer',
    review: 'إبداع وتصميم سابق لعصره! 🔥',
    fullReview: 'محمد محترف جداً في التصميم. قدم لي مشروع بتصميم يتجاوز التوقعات مع اهتمامه بأدق التفاصيل. أنصح به بشدة لكل من يبحث عن جودة استثنائية.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=11', location: 'القاهرة، مصر',
    pos: [-75, 0, -60], color: '#ff007f'
  },
  {
    id: 2, name: 'أحمد محمود', role: 'Full-Stack Developer',
    review: 'موقع رهيب وتجربة تفاعلية ممتعة! 🚀',
    fullReview: 'شغل احترافي على أعلى مستوى. الموقع سريع، متجاوب، والتجربة التفاعلية كانت مذهلة. كل شيء سلس ومُحسن بشكل ممتاز.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=12', location: 'دبي، الإمارات',
    pos: [80, 0, -45], color: '#00f3ff'
  },
  {
    id: 3, name: 'فريق عمل TechFlow', role: 'Tech Lead',
    review: 'تجربة مستخدم أسطورية! ✨',
    fullReview: 'تعاملنا مع محمد في عدة مشاريع وكانت النتائج دائماً تفوق التوقعات. فهم عميق لاحتياجات المستخدم وتنفيذ دقيق في الوقت المحدد.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=13', location: 'الرياض، السعودية',
    pos: [-55, 0, 70], color: '#ffd700'
  },
  {
    id: 4, name: 'م. محمود علي', role: 'Product Manager',
    review: 'سرعة وسلاسة ممتازة في الأداء. 👏',
    fullReview: 'من أفضل المطورين الذين تعاملت معهم. السرعة في الإنجاز مع الحفاظ على أعلى جودة. المشروع تم تسليمه قبل الموعد المحدد وبشكل مثالي.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=14', location: 'الكويت',
    pos: [65, 0, 55], color: '#a200ff'
  },
  {
    id: 5, name: 'Karen Smith', role: 'Frontend Developer',
    review: 'Amazing interactive 3D portfolio! 🎨',
    fullReview: 'Absolutely blown away by the quality of work. The 3D interactions are smooth, the design is modern, and the attention to detail is remarkable. Highly recommended for any creative project.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=15', location: 'London, UK',
    pos: [-80, 0, 10], color: '#00ff66'
  },
  {
    id: 6, name: 'عمر حسن', role: 'Game Developer',
    review: 'الفيزيكا والتحكم في العربية ممتاز! 🏎️',
    fullReview: 'كلاعب ومتصفح، الانطباع الأول كان رائعاً. حركة السيارة سلسة والفيزيكا واقعية. التحكم بالأسهم работал بدون أي تقطيع. شغل هندسي ممتاز.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=16', location: 'بيروت، لبنان',
    pos: [40, 0, -75], color: '#ff5500'
  },
  {
    id: 7, name: 'ليلى خالد', role: 'Art Director',
    review: 'الألوان والمود الفضائي يجنن! 🌌',
    fullReview: 'من الناحية الفنية، هذا العمل يستحق الإعجاب. توزيع الألوان النيوني متناسق، والإضاءة تعطي عمق رائع للمشهد. الإحساس البصري فريد ومميز.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=17', location: 'عمان، الأردن',
    pos: [-35, 0, 80], color: '#ff00bb'
  },
  {
    id: 8, name: 'م. يوسف إبراهيم', role: 'CTO',
    review: 'شغل احترافي على أعلى مستوى! 💎',
    fullReview: 'كقائد تقني، أقدّر الدقة والاحترافية. الكود نظيف، الأداء ممتاز، والتفاصيل الصغيرة تصنع فرقاً كبيراً. تجربة تعامل ممتازة من البداية للنهاية.',
    rating: 5, avatarUrl: 'https://i.pravatar.cc/150?img=18', location: 'الدوحة، قطر',
    pos: [70, 0, -20], color: '#00aaff'
  }
]

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

export class TestimonialCharacter {
  public group: THREE.Group
  public position: THREE.Vector3
  public data: TestimonialData
  public visible: boolean = false
  private bobTime: number = 0
  private speechBubble?: THREE.Group
  private ringMesh!: THREE.Mesh
  private light!: THREE.PointLight
  public headMesh!: THREE.Mesh
  public clickableObjects: THREE.Object3D[] = []

  constructor(data: TestimonialData) {
    this.data = data
    this.group = new THREE.Group()
    this.position = this.group.position
    this.bobTime = data.id * 1.5
    this.buildCharacter()
  }

  private buildCharacter() {
    const color = new THREE.Color(this.data.color)

    // ─── Head (colored sphere — clickable) ────────────────────
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16)
    const headMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.5
    })
    this.headMesh = new THREE.Mesh(headGeo, headMat)
    this.headMesh.position.set(0, 1.4, 0)
    this.headMesh.castShadow = true
    this.headMesh.userData.testimonialId = this.data.id
    this.group.add(this.headMesh)
    this.clickableObjects.push(this.headMesh)

    // ─── Body ──────────────────────────────────────────────────
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.35, 1, 16)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.4
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.set(0, 0.7, 0)
    body.castShadow = true
    this.group.add(body)

    // ─── Glowing neon ring under feet ─────────────────────────
    const ringGeo = new THREE.RingGeometry(0.4, 0.55, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    })
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat)
    this.ringMesh.rotation.x = -Math.PI / 2
    this.ringMesh.position.set(0, 0.02, 0)
    this.group.add(this.ringMesh)

    // ─── Point light for glow ─────────────────────────────────
    this.light = new THREE.PointLight(color, 0, 5)
    this.light.position.set(0, 0.5, 0)
    this.group.add(this.light)

    // ─── Speech bubble (canvas texture) ──────────────────────
    this.speechBubble = this.createSpeechBubble()
  }

  private createSpeechBubble(): THREE.Group {
    const group = new THREE.Group()

    // Glassmorphism panel background
    const panelGeo = new THREE.BoxGeometry(5.5, 2.6, 0.2, 2, 2, 1)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a19,
      emissive: new THREE.Color(this.data.color).multiplyScalar(0.15),
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.94
    })
    const panel = new THREE.Mesh(panelGeo, panelMat)
    panel.position.y = 3.2
    group.add(panel)

    // Neon border edges
    const edgesGeo = new THREE.EdgesGeometry(panelGeo)
    const edgesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.data.color),
      linewidth: 2
    })
    const edges = new THREE.LineSegments(edgesGeo, edgesMat)
    edges.position.y = 3.2
    group.add(edges)

    // Name text
    const nameCanvas = this.createTextCanvas(this.data.name, 512, 64, this.data.color, 40)
    const nameTex = new THREE.CanvasTexture(nameCanvas)
    const nameGeo = new THREE.PlaneGeometry(4, 0.6)
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
    const nameMesh = new THREE.Mesh(nameGeo, nameMat)
    nameMesh.position.set(0, 3.95, 0.12)
    group.add(nameMesh)

    // Role text
    const roleCanvas = this.createTextCanvas(this.data.role, 512, 48, '#aaaaaa', 28)
    const roleTex = new THREE.CanvasTexture(roleCanvas)
    const roleGeo = new THREE.PlaneGeometry(4.5, 0.5)
    const roleMat = new THREE.MeshBasicMaterial({ map: roleTex, transparent: true })
    const roleMesh = new THREE.Mesh(roleGeo, roleMat)
    roleMesh.position.set(0, 3.55, 0.12)
    group.add(roleMesh)

    // Review text
    const reviewCanvas = this.createTextCanvas(this.data.review, 1024, 128, '#ffffff', 32)
    const reviewTex = new THREE.CanvasTexture(reviewCanvas)
    const reviewGeo = new THREE.PlaneGeometry(5, 1.2)
    const reviewMat = new THREE.MeshBasicMaterial({ map: reviewTex, transparent: true })
    const reviewMesh = new THREE.Mesh(reviewGeo, reviewMat)
    reviewMesh.position.set(0, 2.85, 0.12)
    group.add(reviewMesh)

    // Stars
    const starsCanvas = this.createStarsCanvas(this.data.rating)
    const starsTex = new THREE.CanvasTexture(starsCanvas)
    const starsGeo = new THREE.PlaneGeometry(3, 0.6)
    const starsMat = new THREE.MeshBasicMaterial({ map: starsTex, transparent: true })
    const starsMesh = new THREE.Mesh(starsGeo, starsMat)
    starsMesh.position.set(0, 2.25, 0.12)
    group.add(starsMesh)

    group.visible = false
    return group
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

  private createStarsCanvas(count: number): HTMLCanvasElement {
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

  public activate() {
    if (this.visible) return
    this.visible = true
    if (this.speechBubble) {
      this.group.add(this.speechBubble)
      this.speechBubble.visible = true
    }
    this.light.intensity = 2
  }

  public deactivate() {
    if (!this.visible) return
    this.visible = false
    if (this.speechBubble) {
      this.group.remove(this.speechBubble)
      this.speechBubble.visible = false
    }
    this.light.intensity = 0
  }

  public update(delta: number, carPos: THREE.Vector3, nearThreshold: number = 10) {
    // Bobbing idle animation
    this.bobTime += delta * 2
    const bob = Math.sin(this.bobTime) * 0.08
    this.group.position.y = this.data.pos[1] + bob

    // Pulse ring
    if (this.ringMesh) {
      const pulse = 0.7 + Math.sin(this.bobTime * 2.5) * 0.3
      ;(this.ringMesh.material as THREE.MeshBasicMaterial).opacity = pulse
      this.ringMesh.scale.setScalar(1 + Math.sin(this.bobTime * 3) * 0.05)
    }

    // Activate/deactivate based on proximity to car
    const dist = this.group.position.distanceTo(carPos)
    if (dist < nearThreshold) {
      this.activate()
    } else {
      this.deactivate()
    }
  }

  public handleClick(event: MouseEvent, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): TestimonialData | null {
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(this.clickableObjects, true)

    if (intersects.length > 0) {
      return this.data
    }
    return null
  }

  public handlePointerOver() {
    if (this.headMesh) {
      ;(this.headMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8
      this.headMesh.scale.setScalar(1.1)
    }
  }

  public handlePointerOut() {
    if (this.headMesh) {
      ;(this.headMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4
      this.headMesh.scale.setScalar(1.0)
    }
  }
}

export function createTestimonialCharacters(scene: THREE.Scene): TestimonialCharacter[] {
  return CHARACTERS_DATA.map(data => {
    const char = new TestimonialCharacter(data)
    char.group.position.set(data.pos[0], data.pos[1], data.pos[2])
    scene.add(char.group)
    return char
  })
}
