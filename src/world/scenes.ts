import * as THREE from 'three'

export class SynthwaveScene {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock

  // Scene objects
  private starField!: THREE.Points
  private particles!: THREE.Points
  private gridMesh!: THREE.Mesh
  private gridLines!: THREE.LineSegments
  private groundPlane!: THREE.Mesh
  private thrusterLight!: THREE.PointLight

  // Lights
  private ambientLight!: THREE.AmbientLight
  private rimLight1!: THREE.DirectionalLight
  private rimLight2!: THREE.DirectionalLight
  private sunLight!: THREE.DirectionalLight

  // Post-processing placeholders
  private bloomUniforms: any = null

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.clock = new THREE.Clock()
  }

  public init() {
    this.setupBackground()
    this.setupLighting()
    this.createStarfield()
    this.createGround()
    this.createGrid()
    this.createNebula()
    this.createParticles()
    this.createMountains()
    this.createHorizonGlow()

    return this
  }

  private setupBackground() {
    // Deep cosmic purple-black
    this.scene.background = new THREE.Color(0x09071b)
    this.scene.fog = new THREE.FogExp2(0x09071b, 0.008)
  }

  private setupLighting() {
    // Ambient - deep purple
    this.ambientLight = new THREE.AmbientLight(0x1a0b2e, 0.8)
    this.scene.add(this.ambientLight)

    // Hemisphere for sky/ground gradient
    const hemi = new THREE.HemisphereLight(0x4a0080, 0x0a0014, 0.4)
    this.scene.add(hemi)

    // Rim light from behind (cyan)
    this.rimLight1 = new THREE.DirectionalLight(0x00ffff, 1.2)
    this.rimLight1.position.set(-50, 30, -50)
    this.scene.add(this.rimLight1)

    // Rim light from front (magenta)
    this.rimLight2 = new THREE.DirectionalLight(0xff00ff, 1.0)
    this.rimLight2.position.set(50, 30, 50)
    this.scene.add(this.rimLight2)

    // Sun light (warm orange)
    this.sunLight = new THREE.DirectionalLight(0xff6600, 1.5)
    this.sunLight.position.set(100, 80, -100)
    this.scene.add(this.sunLight)
  }

  private createStarfield() {
    const count = 3000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Random position on sphere
      const radius = 300 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Star colors (white, blue, pink)
      const colorChoice = Math.random()
      if (colorChoice < 0.5) {
        colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1
      } else if (colorChoice < 0.75) {
        colors[i3] = 0.6; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1
      } else {
        colors[i3] = 1; colors[i3 + 1] = 0.6; colors[i3 + 2] = 0.8
      }

      sizes[i] = 0.5 + Math.random() * 1.5
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })

    this.starField = new THREE.Points(geometry, material)
    this.scene.add(this.starField)
  }

  private createGround() {
    // Reflective dark metallic floor
    const geometry = new THREE.PlaneGeometry(600, 600)
    const material = new THREE.MeshStandardMaterial({
      color: 0x0a0014,
      roughness: 0.15,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9
    })

    this.groundPlane = new THREE.Mesh(geometry, material)
    this.groundPlane.rotation.x = -Math.PI / 2
    this.groundPlane.position.y = -0.1
    this.groundPlane.receiveShadow = true
    this.scene.add(this.groundPlane)
  }

  private createGrid() {
    // Main neon grid
    const gridSize = 600
    const divisions = 120
    const cellSize = gridSize / divisions

    // Create grid lines manually for better control
    const linePositions: number[] = []
    const lineColors: number[] = []

    // Cyan lines (primary grid)
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const x = i * cellSize
      const z = -gridSize / 2
      // Horizontal lines
      linePositions.push(x, 0, z, x, 0, z + cellSize)
      lineColors.push(0, 1, 1, 0, 1, 1)
      // Vertical lines
      linePositions.push(x, 0, z, x + cellSize, 0, z)
      lineColors.push(0, 1, 1, 0, 1, 1)
    }

    // Magenta lines (accent grid - every 5th line)
    for (let i = -divisions / 2; i <= divisions / 2; i += 5) {
      const x = i * cellSize
      const z = -gridSize / 2
      linePositions.push(x, 0.02, z, x, 0.02, z + gridSize)
      lineColors.push(1, 0, 1, 1, 0, 1)
      linePositions.push(x, 0.02, z, x + cellSize * 5, 0.02, z)
      lineColors.push(1, 0, 1, 1, 0, 1)
    }

    const gridGeo = new THREE.BufferGeometry()
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    gridGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))

    const gridMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    this.gridLines = new THREE.LineSegments(gridGeo, gridMat)
    this.scene.add(this.gridLines)

    // Secondary grid layer (deeper)
    const grid2Geo = new THREE.BufferGeometry()
    const grid2Positions: number[] = []
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const x = i * cellSize
      grid2Positions.push(x, -0.1, -gridSize / 2, x, -0.1, gridSize / 2)
      grid2Positions.push(-gridSize / 2, -0.1, x, gridSize / 2, -0.1, x)
    }
    grid2Geo.setAttribute('position', new THREE.Float32BufferAttribute(grid2Positions, 3))
    const grid2Mat = new THREE.LineBasicMaterial({
      color: 0x4a0080,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    })
    const grid2 = new THREE.LineSegments(grid2Geo, grid2Mat)
    this.scene.add(grid2)
  }

  private createNebula() {
    // Glowing nebula clouds
    for (let i = 0; i < 12; i++) {
      const geo = new THREE.SphereGeometry(40 + Math.random() * 60, 16, 16)
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.75 + Math.random() * 0.2, 0.9, 0.3),
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const cloud = new THREE.Mesh(geo, mat)
      cloud.position.set(
        (Math.random() - 0.5) * 400,
        60 + Math.random() * 120,
        (Math.random() - 0.5) * 400
      )
      cloud.scale.set(1, 0.4, 1)
      this.scene.add(cloud)
    }
  }

  private createParticles() {
    const count = 500
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400
      positions[i * 3 + 1] = Math.random() * 50 + 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400

      // Neon colors
      const hue = Math.random()
      if (hue < 0.33) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1
      } else if (hue < 0.66) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1
      } else {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.5
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    this.particles = new THREE.Points(geo, mat)
    this.scene.add(this.particles)
  }

  private createMountains() {
    // Retro wireframe mountains
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const dist = 180 + Math.random() * 60
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist
      const height = 50 + Math.random() * 40

      // Mountain mesh
      const geo = new THREE.ConeGeometry(30 + Math.random() * 15, height, 4)
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1a0a3e,
        emissive: 0x4a0080,
        emissiveIntensity: 0.3,
        flatShading: true,
        transparent: true,
        opacity: 0.7
      })
      const mountain = new THREE.Mesh(geo, mat)
      mountain.position.set(x, height / 2 - 10, z)
      this.scene.add(mountain)

      // Wireframe edges
      const edges = new THREE.EdgesGeometry(geo)
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
      const wireframe = new THREE.LineSegments(edges, lineMat)
      wireframe.position.copy(mountain.position)
      this.scene.add(wireframe)
    }
  }

  private createHorizonGlow() {
    // Horizontal glow line at horizon
    const glowGeo = new THREE.PlaneGeometry(600, 20)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.set(0, 15, -200)
    this.scene.add(glow)

    // Second glow layer
    const glow2 = glow.clone()
    glow2.material = glowMat.clone()
    glow2.material.color = new THREE.Color(0x00ffff)
    glow2.material.opacity = 0.15
    glow2.position.z = -180
    glow2.scale.set(1.2, 0.5, 1)
    this.scene.add(glow2)
  }

  public update(time: number) {
    // Rotate starfield slowly
    if (this.starField) {
      this.starField.rotation.y = time * 0.01
    }

    // Animate particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i)
        y += 0.05
        if (y > 52) y = 2
        positions.setY(i, y)
      }
      positions.needsUpdate = true
    }
  }

  public getScene(): THREE.Scene {
    return this.scene
  }
}
