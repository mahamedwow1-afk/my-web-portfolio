import * as THREE from 'three'
import { setLocale, initI18n } from './i18n/index.js'
import { profile } from './data/profile.js'
import { HoverCar, HoverCarControls } from './vehicle/car.js'
import { createEnvironment } from './world/environment.js'
import { createNPZones } from './world/npcs.js'

// ─── Scene setup ────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 15, -20)

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
document.body.appendChild(renderer.domElement)

// ─── Environment ────────────────────────────────────────────
createEnvironment(scene)

// ─── Hover Car ──────────────────────────────────────────────
const car = new HoverCar()
scene.add(car.group)

// ─── Zone System ────────────────────────────────────────────
const zones: { pos: THREE.Vector3; name: string; group: THREE.Group; color: number }[] = []

function createZoneMarker(x: number, z: number, color: number, name: string): THREE.Group {
  const group = new THREE.Group()

  // Base platform
  const baseGeo = new THREE.CylinderGeometry(2.5, 3, 0.6, 8)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.y = 0.3
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  // Glowing ring
  const ringGeo = new THREE.TorusGeometry(2.8, 0.1, 12, 32)
  const ringMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 3 })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.05
  group.add(ring)

  // Pillar
  const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 4, 8)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 })
  const pillar = new THREE.Mesh(pillarGeo, pillarMat)
  pillar.position.y = 2.5
  pillar.castShadow = true
  group.add(pillar)

  // Sign panel
  const signGeo = new THREE.BoxGeometry(4, 2, 0.3)
  const signMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3 })
  const sign = new THREE.Mesh(signGeo, signMat)
  sign.position.y = 5
  sign.castShadow = true
  group.add(sign)

  // Point light
  const pointLight = new THREE.PointLight(color, 2, 15)
  pointLight.position.y = 5
  group.add(pointLight)

  group.position.set(x, 0, z)
  scene.add(group)
  zones.push({ pos: new THREE.Vector3(x, 0, z), name, group, color })
  return group
}

// Create zones
createZoneMarker(-20, -20, 0xf0a50b, 'about')
createZoneMarker(20, -20, 0xe94560, 'projects')
createZoneMarker(-20, 20, 0x00f3ff, 'skills')
createZoneMarker(20, 20, 0x7c3aed, 'experience')
createZoneMarker(0, -35, 0x10b981, 'contact')

// ─── NPCs ───────────────────────────────────────────────────
const npcs = createNPZones(scene)

// ─── Controls ───────────────────────────────────────────────
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

// ─── Camera Follow ──────────────────────────────────────────
const camOffset = new THREE.Vector3(0, 12, 18)
const camTarget = new THREE.Vector3()

function updateCamera() {
  const carPos = car.position
  const angle = car.angle

  // Camera should follow behind the car
  // Car faces +Z when angle=0, so behind is -Z
  const idealOffset = new THREE.Vector3(
    -Math.sin(angle) * 18,
    12,
    -Math.cos(angle) * 18
  )

  const idealPos = carPos.clone().add(idealOffset)
  camera.position.lerp(idealPos, 0.05)

  camTarget.copy(carPos).add(new THREE.Vector3(0, 1, 0))
  camera.lookAt(camTarget)
}

// ─── Zone Detection ─────────────────────────────────────────
let activeZone: string | null = null

function checkZones() {
  const carPos = car.position
  for (const zone of zones) {
    const dist = carPos.distanceTo(zone.pos)
    const panel = document.getElementById(`zone-${zone.name}`)
    if (dist < 10 && panel) {
      panel.classList.add('active')
      activeZone = zone.name
    } else if (panel) {
      panel.classList.remove('active')
      if (activeZone === zone.name) activeZone = null
    }
  }
}

// ─── Populate Panels ────────────────────────────────────────
function populateAboutPanel() {
  const container = document.getElementById('about-content')
  if (!container) return

  container.innerHTML = `
    <img class="avatar" src="${profile.avatarUrl}" alt="${profile.name}"
         onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27><rect width=%27100%27 height=%27100%27 fill=%27%23f0a50b%27/><text x=%2750%25%27 y=%2755%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2750%27 fill=%27%231a1a2e%27 font-weight=%27bold%27>MY</text></svg>';">
    <h2>${profile.name}</h2>
    <p class="subtitle">${profile.title}</p>
    <p class="bio">${profile.bio}</p>
    <p class="location">📍 ${profile.location}</p>
    <div class="links">
      <a href="${profile.githubUrl}" target="_blank" rel="noopener">GitHub</a>
      <a href="mailto:${profile.email}">Email</a>
    </div>
  `
}

function populateProjectsPanel() {
  const container = document.getElementById('projects-content')
  if (!container) return

  const featured = profile.projects.filter(p => p.featured)
  const others = profile.projects.filter(p => !p.featured)

  const createCard = (project: typeof profile.projects[0]) => `
    <div class="project-card">
      <div class="project-header">
        <span class="project-category">${project.category}</span>
        <span class="project-title">${project.title}</span>
      </div>
      <p class="project-desc">${project.longDescription || project.description}</p>
      <div class="tech-stack">
        ${project.techStack.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <a href="${project.githubUrl}" target="_blank" rel="noopener" class="project-link">View on GitHub →</a>
    </div>
  `

  let html = '<h3>Featured Projects</h3>'
  featured.forEach(p => html += createCard(p))

  if (others.length > 0) {
    html += '<h3>More Projects</h3>'
    others.forEach(p => html += createCard(p))
  }

  container.innerHTML = html
}

function populateSkillsPanel() {
  const container = document.getElementById('skills-content')
  if (!container) return

  const createSkillGroup = (title: string, items: string[]) => `
    <div class="skill-group">
      <h4>${title}</h4>
      <div class="skill-tags">
        ${items.map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>
  `

  container.innerHTML = `
    ${createSkillGroup('Languages', profile.skills.languages)}
    ${createSkillGroup('Frameworks', profile.skills.frameworks)}
    ${createSkillGroup('Tools', profile.skills.tools)}
    ${createSkillGroup('Soft Skills', profile.skills.softSkills)}
  `
}

function populateExperiencePanel() {
  const container = document.getElementById('experience-content')
  if (!container) return

  let html = '<div class="timeline">'
  profile.experience.forEach(exp => {
    html += `
      <div class="timeline-item">
        <div class="timeline-header">
          <span class="role">${exp.role}</span>
          <span class="period">${exp.period}</span>
        </div>
        <div class="org">${exp.organization}</div>
        <p class="desc">${exp.description}</p>
        <div class="technologies">
          ${exp.technologies.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
    `
  })
  html += '</div>'
  container.innerHTML = html
}

function populateEducationPanel() {
  const container = document.getElementById('education-content')
  if (!container) return

  let html = ''
  profile.education.forEach(edu => {
    html += `
      <div class="edu-card">
        <h3>${edu.degree}</h3>
        <div class="institution">${edu.institution}</div>
        <div class="period">${edu.period}</div>
        <p class="desc">${edu.description}</p>
      </div>
    `
  })
  container.innerHTML = html
}

function populateContactPanel() {
  const container = document.getElementById('contact-content')
  if (!container) return

  container.innerHTML = `
    <div class="contact-item">
      <span class="icon">📧</span>
      <div>
        <strong>Email</strong>
        <a href="mailto:${profile.email}">${profile.email}</a>
      </div>
    </div>
    <div class="contact-item">
      <span class="icon">💻</span>
      <div>
        <strong>GitHub</strong>
        <a href="${profile.githubUrl}" target="_blank" rel="noopener">${profile.githubUrl}</a>
      </div>
    </div>
    <div class="contact-form">
      <h3>Send a Message</h3>
      <form id="contact-form">
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Your Email" required>
        <textarea placeholder="Your Message" rows="4" required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  `
}

function populateClassicView() {
  const projectsContainer = document.getElementById('classic-projects')
  if (projectsContainer) {
    projectsContainer.innerHTML = profile.projects.map(p => `
      <div class="project-card">
        <div class="project-header">
          <span class="project-category">${p.category}</span>
          <span class="project-title">${p.title}</span>
        </div>
        <p class="project-desc">${p.longDescription || p.description}</p>
        <div class="tech-stack">
          ${p.techStack.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <a href="${p.githubUrl}" target="_blank" rel="noopener" class="project-link">View on GitHub →</a>
      </div>
    `).join('')
  }

  const skillsContainer = document.getElementById('classic-skills')
  if (skillsContainer) {
    skillsContainer.innerHTML = `
      <div class="skill-group">
        <h4>Languages</h4>
        <div class="skill-tags">${profile.skills.languages.map(s => `<span class="tag">${s}</span>`).join('')}</div>
      </div>
      <div class="skill-group">
        <h4>Frameworks</h4>
        <div class="skill-tags">${profile.skills.frameworks.map(s => `<span class="tag">${s}</span>`).join('')}</div>
      </div>
      <div class="skill-group">
        <h4>Tools</h4>
        <div class="skill-tags">${profile.skills.tools.map(s => `<span class="tag">${s}</span>`).join('')}</div>
      </div>
    `
  }

  const experienceContainer = document.getElementById('classic-experience')
  if (experienceContainer) {
    experienceContainer.innerHTML = profile.experience.map(exp => `
      <div class="timeline-item">
        <div class="timeline-header">
          <span class="role">${exp.role}</span>
          <span class="period">${exp.period}</span>
        </div>
        <div class="org">${exp.organization}</div>
        <p class="desc">${exp.description}</p>
      </div>
    `).join('')
  }
}

// Initialize all panels
populateAboutPanel()
populateProjectsPanel()
populateSkillsPanel()
populateExperiencePanel()
populateEducationPanel()
populateContactPanel()
populateClassicView()

// ─── Minimap ────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
if (mmCanvas) {
  mmCanvas.width = 160
  mmCanvas.height = 160
}
const mmCtx = mmCanvas?.getContext('2d')

function drawMinimap() {
  if (!mmCtx) return
  mmCtx.clearRect(0, 0, 160, 160)
  mmCtx.fillStyle = 'rgba(15, 23, 42, 0.95)'
  mmCtx.fillRect(0, 0, 160, 160)

  const scale = 0.6
  const cx = 80, cy = 80

  zones.forEach(zone => {
    const dx = (zone.pos.x - car.position.x) * scale + cx
    const dz = (zone.pos.z - car.position.z) * scale + cy
    mmCtx.fillStyle = '#' + zone.color.toString(16).padStart(6, '0')
    mmCtx.beginPath()
    mmCtx.arc(dx, dz, 6, 0, Math.PI * 2)
    mmCtx.fill()
  })

  // Draw car as triangle
  mmCtx.save()
  mmCtx.translate(cx, cy)
  mmCtx.rotate(-car.angle)
  mmCtx.fillStyle = '#00d4ff'
  mmCtx.beginPath()
  mmCtx.moveTo(0, -7)
  mmCtx.lineTo(5, 5)
  mmCtx.lineTo(-5, 5)
  mmCtx.closePath()
  mmCtx.fill()
  mmCtx.restore()
}

// ─── NPC Proximity Detection ───────────────────────────────
const NPC_NEAR = 8

function updateNPCs() {
  const carPos = car.position
  npcs.forEach(npc => {
    const dist = npc.getDistanceTo(carPos)
    if (dist < NPC_NEAR) {
      npc.activate()
    } else {
      npc.deactivate()
    }
    npc.update(0.016)
  })
}

// ─── Animation Loop ─────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  const ctrl = getControls()
  car.update(delta, ctrl)
  updateCamera()
  checkZones()
  drawMinimap()
  updateNPCs()

  // Animate zones floating
  zones.forEach((z, i) => {
    z.group.position.y = Math.sin(time * 1.5 + i) * 0.2
  })

  // Animate particles
  const positions = (scene.children.find(c => c.type === 'Points') as any)?.geometry?.attributes?.position
  if (positions) {
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i)
      y += delta * 0.3
      if (y > 22) y = 2
      positions.setY(i, y)
    }
    positions.needsUpdate = true
  }

  renderer.render(scene, camera)
}
animate()

// ─── Resize Handler ─────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ─── Loading Screen ─────────────────────────────────────────
setTimeout(() => {
  document.getElementById('loading')?.classList.add('hidden')
}, 1000)

// ─── Language Toggle ────────────────────────────────────────
document.getElementById('lang-btn-en')?.addEventListener('click', () => setLocale('en'))
document.getElementById('lang-btn-ar')?.addEventListener('click', () => setLocale('ar'))

// ─── Classic View ───────────────────────────────────────────
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

// ─── Init ───────────────────────────────────────────────────
initI18n()

console.log('Portfolio ready! Drive with WASD/Arrows')
