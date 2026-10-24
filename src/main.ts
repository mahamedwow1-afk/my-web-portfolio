import * as THREE from 'three'
import { setLocale, initI18n, t } from './i18n/index.js'
import { profile, skills } from './data/profile.js'

// ─── Scene setup ────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 15, 25)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
document.body.appendChild(renderer.domElement)

// ─── Lighting (golden hour) ────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffeedd, 0.4)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xffaa55, 1.5)
sunLight.position.set(50, 30, -20)
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 2048
sunLight.shadow.mapSize.height = 2048
sunLight.shadow.camera.near = 0.5
sunLight.shadow.camera.far = 200
sunLight.shadow.camera.left = -60
sunLight.shadow.camera.right = 60
sunLight.shadow.camera.top = 60
sunLight.shadow.camera.bottom = -60
scene.add(sunLight)

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3)
fillLight.position.set(-30, 20, 30)
scene.add(fillLight)

// ─── Ground ─────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(200, 200)
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x3a5a40,
  roughness: 0.9,
  metalness: 0.0
})
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// ─── Grid helper (subtle) ───────────────────────────────────
const grid = new THREE.GridHelper(200, 40, 0x2a4a30, 0x2a4a30)
grid.position.y = 0.01
scene.add(grid)

// ─── Hover car ─────────────────────────────────────────────
const carGroup = new THREE.Group()

// Body
const bodyGeo = new THREE.BoxGeometry(4, 0.8, 2)
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe94560, roughness: 0.3, metalness: 0.6 })
const body = new THREE.Mesh(bodyGeo, bodyMat)
body.position.y = 0.6
body.castShadow = true
carGroup.add(body)

// Cabin
const cabinGeo = new THREE.BoxGeometry(2, 0.6, 1.6)
const cabinMat = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.1, metalness: 0.8 })
const cabin = new THREE.Mesh(cabinGeo, cabinMat)
cabin.position.set(-0.3, 1.3, 0)
cabin.castShadow = true
carGroup.add(cabin)

// Lights
const headlightGeo = new THREE.SphereGeometry(0.15, 8, 8)
const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffcc, emissiveIntensity: 2 })
const hl1 = new THREE.Mesh(headlightGeo, headlightMat)
hl1.position.set(2, 0.6, 0.6)
carGroup.add(hl1)
const hl2 = hl1.clone()
hl2.position.set(2, 0.6, -0.6)
carGroup.add(hl2)

// Engine glow
const glowGeo = new THREE.BoxGeometry(0.5, 0.2, 1.8)
const glowMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc, emissiveIntensity: 1 })
const glow = new THREE.Mesh(glowGeo, glowMat)
glow.position.set(-2, 0.5, 0)
carGroup.add(glow)

carGroup.position.set(0, 0.5, 0)
scene.add(carGroup)

// ─── Zone markers (3D signs) ────────────────────────────────
const zones: { pos: THREE.Vector3; name: string; group: THREE.Group }[] = []

function createZoneMarker(x: number, z: number, color: number, name: string): THREE.Group {
  const group = new THREE.Group()

  // Pedestal
  const pedGeo = new THREE.CylinderGeometry(1.5, 2, 0.5, 8)
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.5 })
  const ped = new THREE.Mesh(pedGeo, pedMat)
  ped.position.y = 0.25
  ped.castShadow = true
  ped.receiveShadow = true
  group.add(ped)

  // Pillar
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 8)
  const pillarMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.5 })
  const pillar = new THREE.Mesh(pillarGeo, pillarMat)
  pillar.position.y = 2.5
  pillar.castShadow = true
  group.add(pillar)

  // Sign
  const signGeo = new THREE.BoxGeometry(3, 1.5, 0.2)
  const signMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.3 })
  const sign = new THREE.Mesh(signGeo, signMat)
  sign.position.y = 5
  sign.castShadow = true
  group.add(sign)

  group.position.set(x, 0, z)
  scene.add(group)
  zones.push({ pos: new THREE.Vector3(x, 0, z), name, group: group })
  return group
}

// About zone (orange)
const aboutZone = createZoneMarker(-20, -15, 0xf0a50b, 'about')
// Projects zone (pink/red)
const projectsZone = createZoneMarker(20, -15, 0xe94560, 'projects')

// ─── Decorative elements ────────────────────────────────────
// Trees
function createTree(x: number, z: number) {
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.set(x, 1, z)
  trunk.castShadow = true
  scene.add(trunk)

  const leavesGeo = new THREE.SphereGeometry(1.5, 6, 6)
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 })
  const leaves = new THREE.Mesh(leavesGeo, leavesMat)
  leaves.position.set(x, 3, z)
  leaves.castShadow = true
  scene.add(leaves)
}

for (let i = 0; i < 30; i++) {
  const x = (Math.random() - 0.5) * 150
  const z = (Math.random() - 0.5) * 150
  if (Math.abs(x) > 8 || Math.abs(z) > 8) createTree(x, z)
}

// ─── Controls ───────────────────────────────────────────────
const keys: Record<string, boolean> = {}
window.addEventListener('keydown', e => { keys[e.code] = true })
window.addEventListener('keyup', e => { keys[e.code] = false })

let carVel = 0
let carAngle = 0
const MAX_SPEED = 0.8
const ACCEL = 0.02
const BRAKE = 0.04
const FRICTION = 0.98
const TURN_SPEED = 0.03

// ─── Camera follow ──────────────────────────────────────────
const camOffset = new THREE.Vector3(0, 12, 20)
const camTarget = new THREE.Vector3()

// ─── Zone detection ─────────────────────────────────────────
let activeZone: string | null = null

function checkZones() {
  const carPos = carGroup.position
  for (const zone of zones) {
    const dist = carPos.distanceTo(zone.pos)
    const panel = document.getElementById(`zone-${zone.name}`)
    if (dist < 8 && panel) {
      panel.classList.add('active')
      activeZone = zone.name
    } else if (panel) {
      panel.classList.remove('active')
      if (activeZone === zone.name) activeZone = null
    }
  }
}

// ─── Populate projects zone ─────────────────────────────────
function populateProjects() {
  const container = document.getElementById('projects-content')
  if (!container) return
  const featured = profile.repos.slice(0, 3)
  const experiments = profile.repos.slice(3)

  const makeSection = (title: string, repos: typeof profile.repos) => {
    const div = document.createElement('div')
    const titleEl = document.createElement('div')
    titleEl.className = 'section-title'
    titleEl.textContent = title
    div.appendChild(titleEl)
    for (const repo of repos) {
      const card = document.createElement('div')
      card.className = 'repo-card'
      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p style="font-size:0.85rem;color:#aaa;margin:4px 0">${repo.description}</p>
        <div class="meta">
          <span class="tag">${repo.language ?? 'Mix'}</span>
          <span class="tag">⭐ ${repo.stars}</span>
        </div>
        <a href="${repo.htmlUrl}" target="_blank" rel="noopener" style="display:block;margin-top:8px">→ ${repo.htmlUrl}</a>
      `
      div.appendChild(card)
    }
    return div
  }

  container.appendChild(makeSection('Featured', featured))
  if (experiments.length) container.appendChild(makeSection('Experiments', experiments))
}
populateProjects()

// ─── Minimap ────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
mmCanvas.width = 160
mmCanvas.height = 160
const mmCtx = mmCanvas.getContext('2d')!

function drawMinimap() {
  mmCtx.clearRect(0, 0, 160, 160)
  mmCtx.fillStyle = 'rgba(10,10,30,0.8)'
  mmCtx.fillRect(0, 0, 160, 160)

  const scale = 0.8
  const cx = 80, cy = 80

  // Draw zones
  for (const zone of zones) {
    const dx = (zone.pos.x - carGroup.position.x) * scale + cx
    const dz = (zone.pos.z - carGroup.position.z) * scale + cy
    mmCtx.fillStyle = zone.name === 'about' ? '#f0a50b' : '#e94560'
    mmCtx.beginPath()
    mmCtx.arc(dx, dz, 5, 0, Math.PI * 2)
    mmCtx.fill()
  }

  // Draw car (center)
  mmCtx.fillStyle = '#fff'
  mmCtx.beginPath()
  mmCtx.arc(cx, cy, 3, 0, Math.PI * 2)
  mmCtx.fill()
}

// ─── Animation loop ─────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  // Car physics
  if (keys['KeyW'] || keys['ArrowUp']) carVel = Math.min(carVel + ACCEL, MAX_SPEED)
  if (keys['KeyS'] || keys['ArrowDown']) carVel = Math.max(carVel - ACCEL, -MAX_SPEED * 0.5)
  if (keys['Space']) carVel *= (1 - BRAKE)
  else carVel *= FRICTION

  if (Math.abs(carVel) > 0.01) {
    if (keys['KeyA'] || keys['ArrowLeft']) carAngle += TURN_SPEED * Math.sign(carVel)
    if (keys['KeyD'] || keys['ArrowRight']) carAngle -= TURN_SPEED * Math.sign(carVel)
  }

  if (keys['KeyR']) {
    carGroup.position.set(0, 0.5, 0)
    carAngle = 0
    carVel = 0
  }

  carGroup.position.x += Math.sin(carAngle) * carVel
  carGroup.position.z += Math.cos(carAngle) * carVel
  carGroup.rotation.y = carAngle

  // Clamp to world bounds
  carGroup.position.x = Math.max(-90, Math.min(90, carGroup.position.x))
  carGroup.position.z = Math.max(-90, Math.min(90, carGroup.position.z))

  // Engine glow based on speed
  glow.material.emissiveIntensity = 0.5 + Math.abs(carVel) * 2

  // Chase camera
  const idealOffset = new THREE.Vector3(
    Math.sin(carAngle) * -15,
    12,
    Math.cos(carAngle) * -15
  )
  camTarget.copy(carGroup.position).add(idealOffset)
  camera.position.lerp(camTarget, 0.05)
  camera.lookAt(carGroup.position)

  // Zone detection
  checkZones()

  // Minimap
  drawMinimap()

  renderer.render(scene, camera)
}
animate()

// ─── Resize ─────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ─── Loading complete ───────────────────────────────────────
setTimeout(() => {
  document.getElementById('loading')?.classList.add('hidden')
}, 800)

// ─── Language toggle ────────────────────────────────────────
document.getElementById('lang-btn-en')?.addEventListener('click', () => setLocale('en'))
document.getElementById('lang-btn-ar')?.addEventListener('click', () => setLocale('ar'))

// ─── Skip to classic view ───────────────────────────────────
document.querySelectorAll('#skip-btn, .skip-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('classic-view')?.classList.add('active')
    document.getElementById('hud')!.style.display = 'none'
  })
})

// Declare global functions for inline HTML event handlers
declare global {
  interface Window {
    show3D(): void
    closeZone(): void
  }
}

window.show3D = () => {
  const cv = document.getElementById('classic-view')
  if (cv) cv.classList.remove('active')
  const hud = document.getElementById('hud')
  if (hud) hud.style.display = ''
}

window.closeZone = () => {
  document.querySelectorAll('.zone-panel').forEach(p => p.classList.remove('active'))
  activeZone = null
}

// ─── Init i18n ──────────────────────────────────────────────
initI18n()

console.log('Portfolio 3D loaded. Drive with WASD/Arrows.')
