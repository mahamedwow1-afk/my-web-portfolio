import * as THREE from 'three'
import { setLocale, initI18n, t } from './i18n/index.js'
import { profile } from './data/profile.js'
import { HoverCar, HoverCarControls } from './vehicle/car.js'

// ─── Scene setup ────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 15, -25)

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
document.body.appendChild(renderer.domElement)

// ─── Lighting (golden hour sunset) ──────────────────────────
const ambientLight = new THREE.AmbientLight(0xffeedd, 0.5)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xffaa55, 1.8)
sunLight.position.set(50, 40, -30)
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

const fillLight = new THREE.DirectionalLight(0x00f3ff, 0.4)
fillLight.position.set(-30, 20, 30)
scene.add(fillLight)

// ─── Ground ─────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(200, 200)
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.85,
  metalness: 0.1
})
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// Cyber grid helper
const grid = new THREE.GridHelper(200, 40, 0x00f3ff, 0x334155)
grid.position.y = 0.02
scene.add(grid)

// ─── Hover Car Setup ─────────────────────────────────────────
const car = new HoverCar()
scene.add(car.group)

// ─── Zone markers (3D pedestals) ─────────────────────────────
const zones: { pos: THREE.Vector3; name: string; group: THREE.Group }[] = []

function createZoneMarker(x: number, z: number, color: number, name: string): THREE.Group {
  const group = new THREE.Group()

  // Base Pedestal
  const pedGeo = new THREE.CylinderGeometry(1.8, 2.3, 0.5, 12)
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 })
  const ped = new THREE.Mesh(pedGeo, pedMat)
  ped.position.y = 0.25
  ped.castShadow = true
  ped.receiveShadow = true
  group.add(ped)

  // Glowing Base Ring
  const ringGeo = new THREE.TorusGeometry(2.0, 0.08, 12, 32)
  const ringMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 2.5 })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.05
  group.add(ring)

  // Pillar
  const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.5, 8)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 })
  const pillar = new THREE.Mesh(pillarGeo, pillarMat)
  pillar.position.y = 2.0
  pillar.castShadow = true
  group.add(pillar)

  // Floating Signboard
  const signGeo = new THREE.BoxGeometry(3.2, 1.6, 0.2)
  const signMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.8, roughness: 0.2 })
  const sign = new THREE.Mesh(signGeo, signMat)
  sign.position.y = 4.5
  sign.castShadow = true
  group.add(sign)

  group.position.set(x, 0, z)
  scene.add(group)
  zones.push({ pos: new THREE.Vector3(x, 0, z), name, group })
  return group
}

// Create Zones
createZoneMarker(-18, -12, 0xf0a50b, 'about')     // About (Golden Orange)
createZoneMarker(18, -12, 0xe94560, 'projects')   // Projects (Pink/Crimson Studio)

// ─── Trees & World Props ─────────────────────────────────────
function createStylizedTree(x: number, z: number) {
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 2.2, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 })
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.set(x, 1.1, z)
  trunk.castShadow = true
  scene.add(trunk)

  const topGeo = new THREE.ConeGeometry(1.6, 3.2, 5)
  const topMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.7, flatShading: true })
  const top = new THREE.Mesh(topGeo, topMat)
  top.position.set(x, 3.2, z)
  top.castShadow = true
  scene.add(top)
}

for (let i = 0; i < 35; i++) {
  const x = (Math.random() - 0.5) * 160
  const z = (Math.random() - 0.5) * 160
  if (Math.hypot(x, z) > 12) createStylizedTree(x, z)
}

// ─── Controls Input ──────────────────────────────────────────
const keys: Record<string, boolean> = {}
window.addEventListener('keydown', e => { keys[e.code] = true })
window.addEventListener('keyup', e => { keys[e.code] = false })

function getControls(): HoverCarControls {
  return {
    forward: keys['KeyW'] || keys['ArrowUp'],
    backward: keys['KeyS'] || keys['ArrowDown'],
    left: keys['KeyA'] || keys['ArrowLeft'],
    right: keys['KeyD'] || keys['ArrowRight'],
    brake: keys['Space'],
    boost: keys['ShiftLeft'] || keys['ShiftRight'],
    reset: keys['KeyR']
  }
}

// ─── Camera Chase Follow ─────────────────────────────────────
const camTarget = new THREE.Vector3()
const camPos = new THREE.Vector3()

function updateCamera() {
  const carPos = car.group.position
  const angle = car.getAngle()

  // Camera stays behind car (Front is +Z, so behind is -Z in local frame rotated by angle)
  const distance = 16
  const height = 9

  const idealX = carPos.x - Math.sin(angle) * distance
  const idealZ = carPos.z - Math.cos(angle) * distance
  const idealY = carPos.y + height

  camPos.set(idealX, idealY, idealZ)
  camera.position.lerp(camPos, 0.08)

  camTarget.copy(carPos).add(new THREE.Vector3(0, 1.5, 0))
  camera.lookAt(camTarget)
}

// ─── Zone Proximity Detection ────────────────────────────────
let activeZone: string | null = null

function checkZones() {
  const carPos = car.group.position
  for (const zone of zones) {
    const dist = carPos.distanceTo(zone.pos)
    const panel = document.getElementById(`zone-${zone.name}`)
    if (dist < 8.5 && panel) {
      panel.classList.add('active')
      activeZone = zone.name
    } else if (panel) {
      panel.classList.remove('active')
      if (activeZone === zone.name) activeZone = null
    }
  }
}

// ─── Populate Projects Section ───────────────────────────────
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
        <p style="font-size:0.85rem;color:#cbd5e1;margin:4px 0;line-height:1.4">${repo.description}</p>
        <div class="meta">
          <span class="tag">${repo.language ?? 'Mix'}</span>
          <span class="tag">⭐ ${repo.stars}</span>
        </div>
        <a href="${repo.htmlUrl}" target="_blank" rel="noopener" style="display:block;margin-top:8px;color:#38bdf8">→ ${repo.htmlUrl}</a>
      `
      div.appendChild(card)
    }
    return div
  }

  container.innerHTML = ''
  container.appendChild(makeSection('Featured', featured))
  if (experiments.length) container.appendChild(makeSection('Experiments', experiments))
}
populateProjects()

// ─── Minimap ─────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
if (mmCanvas) {
  mmCanvas.width = 160
  mmCanvas.height = 160
}
const mmCtx = mmCanvas?.getContext('2d')

function drawMinimap() {
  if (!mmCtx) return
  mmCtx.clearRect(0, 0, 160, 160)
  mmCtx.fillStyle = 'rgba(15, 23, 42, 0.9)'
  mmCtx.fillRect(0, 0, 160, 160)

  const scale = 0.75
  const cx = 80, cy = 80

  // Draw zones
  for (const zone of zones) {
    const dx = (zone.pos.x - car.group.position.x) * scale + cx
    const dz = (zone.pos.z - car.group.position.z) * scale + cy
    mmCtx.fillStyle = zone.name === 'about' ? '#f0a50b' : '#e94560'
    mmCtx.beginPath()
    mmCtx.arc(dx, dz, 5, 0, Math.PI * 2)
    mmCtx.fill()
  }

  // Draw Cybercab Hover Car
  mmCtx.save()
  mmCtx.translate(cx, cy)
  mmCtx.rotate(-car.getAngle())
  mmCtx.fillStyle = '#00f3ff'
  mmCtx.beginPath()
  mmCtx.moveTo(0, -6)
  mmCtx.lineTo(4, 5)
  mmCtx.lineTo(-4, 5)
  mmCtx.closePath()
  mmCtx.fill()
  mmCtx.restore()
}

// ─── Main Animation Loop ─────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  const ctrl = getControls()
  car.update(delta, ctrl)

  updateCamera()
  checkZones()
  drawMinimap()

  // Animate zone signs floating slightly
  const time = clock.getElapsedTime()
  zones.forEach(z => {
    z.group.position.y = Math.sin(time * 2 + z.pos.x) * 0.15
  })

  renderer.render(scene, camera)
}
animate()

// ─── Window Resize Handler ───────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ─── Loading Screen Dismiss ──────────────────────────────────
setTimeout(() => {
  document.getElementById('loading')?.classList.add('hidden')
}, 800)

// ─── Language Handlers ───────────────────────────────────────
document.getElementById('lang-btn-en')?.addEventListener('click', () => setLocale('en'))
document.getElementById('lang-btn-ar')?.addEventListener('click', () => setLocale('ar'))

// ─── Classic View Handlers ───────────────────────────────────
document.querySelectorAll('#skip-btn, .skip-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('classic-view')?.classList.add('active')
    const hud = document.getElementById('hud')
    if (hud) hud.style.display = 'none'
  })
})

declare global {
  interface Window {
    show3D(): void
    closeZone(): void
  }
}

window.show3D = () => {
  document.getElementById('classic-view')?.classList.remove('active')
  const hud = document.getElementById('hud')
  if (hud) hud.style.display = ''
}

window.closeZone = () => {
  document.querySelectorAll('.zone-panel').forEach(p => p.classList.remove('active'))
  activeZone = null
}

// ─── Initialize i18n ─────────────────────────────────────────
initI18n()

console.log('Portfolio Cybercab Hover Car ready. WASD to drive!')
