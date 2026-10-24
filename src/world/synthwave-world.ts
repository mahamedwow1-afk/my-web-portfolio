import * as THREE from 'three'

export interface Testimonial {
  name: string
  role: string
  text: string
  rating?: number
}

export class SynthwaveWorld {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock

  // Scene elements
  private starField!: THREE.Points
  private nebulaClouds: THREE.Mesh[] = []
  private gridLines!: THREE.LineSegments
  private groundMesh!: THREE.Mesh
  private mountains: THREE.Mesh[] = []
  private particles!: THREE.Points
  private horizonGlow!: THREE.Mesh

  // Lights
  private ambientLight!: THREE.AmbientLight
  private sunLight!: THREE.DirectionalLight
  private rimLight1!: THREE.DirectionalLight
  private rimLight2!: THREE.DirectionalLight

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.clock = new THREE.Clock()
  }

  public init() {
    // Set background and fog
    this.scene.background = new THREE.Color(0x09071b)
    this.scene.fog = new THREE.FogExp2(0x09071b, 0.006)

    // Setup lighting
    this.setupLighting()

    // Create world elements
    this.createStarfield()
    this.createNebulaClouds()
    this.createGround()
    this.createNeonGrid()
    this.createMountains()
    this.createParticles()
    this.createHorizonGlow()
    this.createSun()

    return this
  }

  private setupLighting() {
    // Deep purple ambient
    this.ambientLight = new THREE.AmbientLight(0x1a0b2e, 1.0)
    this.scene.add(this.ambientLight)

    // Hemisphere for sky/ground gradient
    const hemi = new THREE.HemisphereLight(0x4a0080, 0x050510, 0.5)
    this.scene.add(hemi)

    // Cyan rim light from behind
    this.rimLight1 = new THREE.DirectionalLight(0x00ffff, 1.5)
    this.rimLight1.position.set(-60, 40, -60)
    this.scene.add(this.rimLight1)

    // Magenta rim light from front
    this.rimLight2 = new THREE.DirectionalLight(0xff00ff, 1.2)
    this.rimLight2.position.set(60, 40, 60)
    this.scene.add(this.rimLight2)

    // Warm sun light
    this.sunLight = new THREE.DirectionalLight(0xff8800, 1.8)
    this.sunLight.position.set(100, 60, -100)
    this.sunLight.castShadow = true
    this.sunLight.shadow.mapSize.width = 2048
    this.sunLight.shadow.mapSize.height = 2048
    this.sunLight.shadow.camera.near = 0.5
    this.sunLight.shadow.camera.far = 300
    this.sunLight.shadow.camera.left = -100
    this.sunLight.shadow.camera.right = 100
    this.sunLight.shadow.camera.top = 100
    this.sunLight.shadow.camera.bottom = -100
    this.scene.add(this.sunLight)
  }

  private createStarfield() {
    const count = 3500
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Spherical distribution
      const radius = 350 + Math.random() * 500
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Star colors: white, blue, pink
      const type = Math.random()
      if (type < 0.6) {
        colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1
      } else if (type < 0.8) {
        colors[i3] = 0.7; colors[i3 + 1] = 0.85; colors[i3 + 2] = 1
      } else {
        colors[i3] = 1; colors[i3 + 1] = 0.7; colors[i3 + 2] = 0.85
      }

      sizes[i] = 0.8 + Math.random() * 2
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })

    this.starField = new THREE.Points(geometry, material)
    this.scene.add(this.starField)
  }

  private createNebulaClouds() {
    for (let i = 0; i < 15; i++) {
      const geo = new THREE.SphereGeometry(50 + Math.random() * 80, 16, 16)
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.75 + Math.random() * 0.25, 0.9, 0.35),
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const cloud = new THREE.Mesh(geo, mat)
      cloud.position.set(
        (Math.random() - 0.5) * 500,
        80 + Math.random() * 150,
        (Math.random() - 0.5) * 500
      )
      cloud.scale.set(1, 0.35, 1)
      this.scene.add(cloud)
      this.nebulaClouds.push(cloud)
    }
  }

  private createGround() {
    // Reflective dark metallic floor
    const geometry = new THREE.PlaneGeometry(800, 800)
    const material = new THREE.MeshStandardMaterial({
      color: 0x050510,
      roughness: 0.08,
      metalness: 0.95,
      transparent: true,
      opacity: 0.92
    })

    this.groundMesh = new THREE.Mesh(geometry, material)
    this.groundMesh.rotation.x = -Math.PI / 2
    this.groundMesh.position.y = -0.1
    this.groundMesh.receiveShadow = true
    this.scene.add(this.groundMesh)
  }

  private createNeonGrid() {
    const gridSize = 800
    const divisions = 160
    const cellSize = gridSize / divisions

    // Main grid lines (cyan)
    const linePositions: number[] = []
    const lineColors: number[] = []

    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const x = i * cellSize
      // Vertical lines
      linePositions.push(x, 0, -gridSize / 2, x, 0, gridSize / 2)
      lineColors.push(0, 1, 1, 0, 1, 1)
      // Horizontal lines
      linePositions.push(-gridSize / 2, 0, x, gridSize / 2, 0, x)
      lineColors.push(0, 1, 1, 0, 1, 1)
    }

    // Accent grid (magenta - every 8th line)
    for (let i = -divisions / 2; i <= divisions / 2; i += 8) {
      const x = i * cellSize
      linePositions.push(x, 0.03, -gridSize / 2, x, 0.03, gridSize / 2)
      lineColors.push(1, 0, 1, 1, 0, 1)
      linePositions.push(-gridSize / 2, 0.03, x, gridSize / 2, 0.03, x)
      lineColors.push(1, 0, 1, 1, 0, 1)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    })

    this.gridLines = new THREE.LineSegments(geometry, material)
    this.scene.add(this.gridLines)

    // Second layer (deeper, dimmer)
    const geo2 = new THREE.BufferGeometry()
    const pos2: number[] = []
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const x = i * cellSize
      pos2.push(x, -0.15, -gridSize / 2, x, -0.15, gridSize / 2)
      pos2.push(-gridSize / 2, -0.15, x, gridSize / 2, -0.15, x)
    }
    geo2.setAttribute('position', new THREE.Float32BufferAttribute(pos2, 3))
    const mat2 = new THREE.LineBasicMaterial({
      color: 0x4a0080,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    })
    const grid2 = new THREE.LineSegments(geo2, mat2)
    this.scene.add(grid2)
  }

  private createMountains() {
    // Retro wireframe mountains in background
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      const dist = 220 + Math.random() * 80
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist
      const height = 60 + Math.random() * 50

      const geometry = new THREE.ConeGeometry(35 + Math.random() * 20, height, 4)
      const material = new THREE.MeshStandardMaterial({
        color: 0x1a0a3e,
        emissive: 0x4a0080,
        emissiveIntensity: 0.4,
        flatShading: true,
        transparent: true,
        opacity: 0.75
      })

      const mountain = new THREE.Mesh(geometry, material)
      mountain.position.set(x, height / 2 - 15, z)
      mountain.castShadow = true
      this.scene.add(mountain)
      this.mountains.push(mountain)

      // Neon wireframe
      const edges = new THREE.EdgesGeometry(geometry)
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      })
      const wireframe = new THREE.LineSegments(edges, lineMat)
      wireframe.position.copy(mountain.position)
      this.scene.add(wireframe)
    }
  }

  private createParticles() {
    const count = 600
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 500
      positions[i * 3 + 1] = Math.random() * 60 + 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 500

      // Neon colors
      const hue = Math.random()
      if (hue < 0.33) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1
      } else if (hue < 0.66) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1
      } else {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.6
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  private createHorizonGlow() {
    // Horizontal neon glow line
    const glowGeo = new THREE.PlaneGeometry(800, 25)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    this.horizonGlow = new THREE.Mesh(glowGeo, glowMat)
    this.horizonGlow.position.set(0, 18, -250)
    this.scene.add(this.horizonGlow)

    // Secondary glow
    const glow2Geo = new THREE.PlaneGeometry(800, 25)
    const glow2Mat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const glow2 = new THREE.Mesh(glow2Geo, glow2Mat)
    glow2.position.set(0, 18, -230)
    glow2.scale.set(1.3, 0.6, 1)
    this.scene.add(glow2)
  }

  private createSun() {
    // Glowing sun
    const sunGeo = new THREE.SphereGeometry(25, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.85
    })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    sun.position.set(80, 45, -180)
    this.scene.add(sun)

    // Sun glow
    const glowGeo = new THREE.SphereGeometry(45, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.copy(sun.position)
    this.scene.add(glow)
  }

  public update(time: number) {
    // Rotate starfield slowly
    if (this.starField) {
      this.starField.rotation.y = time * 0.008
    }

    // Animate particles floating up
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i)
        y += 0.08
        if (y > 65) y = 3
        positions.setY(i, y)
      }
      positions.needsUpdate = true
    }

    // Pulse horizon glow
    if (this.horizonGlow) {
      (this.horizonGlow.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 2) * 0.1
    }
  }

  public getScene(): THREE.Scene {
    return this.scene
  }
}
