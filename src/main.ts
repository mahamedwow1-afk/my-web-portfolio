import * as THREE from 'three'
import { setLocale, initI18n } from './i18n/index.js'
import { profile } from './data/profile.js'
import { FuturisticHoverCar } from './world/car.js'
import { createNPCZones } from './world/npcs.js'
import { createTestimonialCharacters, CHARACTERS_DATA } from './world/testimonials.js'
import { SynthwaveWorld } from './world/synthwave-world.js'

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// ─── Scene Setup ──────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x09071b)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 18, -25)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.3
document.body.appendChild(renderer.domElement)

// ─── Initialize Synthwave World ──────────────────────────────
const synthwaveWorld = new SynthwaveWorld(scene, camera, renderer)
synthwaveWorld.init()

// ─── Create Futuristic Hover Car ─────────────────────────────
const car = new FuturisticHoverCar()
scene.add(car.group)

// ─── Zone System ──────────────────────────────────────────────
const zones: { pos: THREE.Vector3; name: string; group: THREE.Group; color: number }[] = []

function createZoneMarker(x: number, z: number, color: number, name: string): THREE.Group {
  const group = new THREE.Group()

  // Base platform
  const baseGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.7, 8)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.85
  })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.y = 0.35
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  // Glowing ring
  const ringGeo = new THREE.TorusGeometry(3.2, 0.12, 12, 32)
  const ringMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 4
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.06
  group.add(ring)

  // Pillar
  const pillarGeo = new THREE.CylinderGeometry(0.28, 0.28, 4.5, 8)
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.15,
    metalness: 0.95
  })
  const pillar = new THREE.Mesh(pillarGeo, pillarMat)
  pillar.position.y = 2.6
  pillar.castShadow = true
  group.add(pillar)

  // Sign panel
  const signGeo = new THREE.BoxGeometry(4.5, 2.2, 0.35)
  const signMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    roughness: 0.25
  })
  const sign = new THREE.Mesh(signGeo, signMat)
  sign.position.y = 5.2
  sign.castShadow = true
  group.add(sign)

  // Point light
  const pointLight = new THREE.PointLight(color, 3, 18)
  pointLight.position.y = 5.2
  group.add(pointLight)

  group.position.set(x, 0, z)
  scene.add(group)
  zones.push({ pos: new THREE.Vector3(x, 0, z), name, group, color })
  return group
}

// Create zones
createZoneMarker(-22, -22, 0xf0a50b, 'about')
createZoneMarker(22, -22, 0xe94560, 'projects')
createZoneMarker(-22, 22, 0x00f3ff, 'skills')
createZoneMarker(22, 22, 0x7c3aed, 'experience')
createZoneMarker(0, -38, 0x10b981, 'contact')

// ─── NPCs ─────────────────────────────────────────────────────
const npcs = createNPCZones(scene)

// ─── Testimonial Characters ───────────────────────────────────
const testimonialChars = createTestimonialCharacters(scene)
window.testimonialChars = testimonialChars
let activeTestimonial: string | null = null

// ─── Testimonial Panel ────────────────────────────────────────
function showTestimonialPanel(data: typeof CHARACTERS_DATA[0]) {
  const panel = document.getElementById('testimonial-panel')
  if (!panel) return
  activeTestimonial = data.id.toString()
  panel.innerHTML = `
    <button class="close-btn" onclick="closeZone()">✕</button>
    <img class="avatar" src="${data.avatarUrl}" alt="${data.name}"
         onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27><rect width=%27100%27 height=%27100%27 fill=%27${data.color}%27/><text x=%2750%25%27 y=%2755%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2750%27 fill=%27%23fff%27 font-weight=%27bold%27>${data.name.charAt(0)}</text></svg>';">
    <h2 style="color:${data.color}">${data.name}</h2>
    <p class="subtitle" style="color:#94a3b8">${data.role}</p>
    <div class="stars" style="color:#ffd700;font-size:1.2rem;margin:12px 0;">${'★'.repeat(data.rating)}</div>
    <p class="review" style="color:#cbd5e1;line-height:1.8;margin-bottom:16px;">${data.review}</p>
    <p class="full-review" style="color:#94a3b8;font-size:0.9rem;line-height:1.7;margin-bottom:16px;">${data.fullReview}</p>
    <p class="location" style="color:#64748b;font-size:0.85rem;">📍 ${data.location}</p>
  `
  panel.classList.add('active')
}

function hideTestimonialPanel() {
  const panel = document.getElementById('testimonial-panel')
  if (panel) panel.classList.remove('active')
  activeTestimonial = null
}

// ─── Controls ─────────────────────────────────────────────────
const keys: Record<string, boolean> = {}
window.addEventListener('keydown', e => { keys[e.code] = true })
window.addEventListener('keyup', e => { keys[e.code] = false })

function getControls() {
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

// ─── Camera Follow ────────────────────────────────────────────
const camOffset = new THREE.Vector3(0, 15, 22)
const camTarget = new THREE.Vector3()

function updateCamera() {
  const carPos = car.position
  const angle = car.angle

  const idealOffset = new THREE.Vector3(
    -Math.sin(angle) * 22,
    15,
    -Math.cos(angle) * 22
  )

  const idealPos = carPos.clone().add(idealOffset)
  camera.position.lerp(idealPos, 0.06)

  camTarget.copy(carPos).add(new THREE.Vector3(0, 1.5, 0))
  camera.lookAt(camTarget)
}

// ─── Zone Detection ───────────────────────────────────────────
let activeZone: string | null = null

function checkZones() {
  const carPos = car.position
  for (const zone of zones) {
    const dist = carPos.distanceTo(zone.pos)
    const panel = document.getElementById(`zone-${zone.name}`)
    if (dist < 12 && panel) {
      panel.classList.add('active')
      activeZone = zone.name
    } else if (panel) {
      panel.classList.remove('active')
      if (activeZone === zone.name) activeZone = null
    }
  }
}

// ─── Populate Panels ──────────────────────────────────────────
// Override closeZone to also hide testimonial panel
const _origCloseZone = window.closeZone
window.closeZone = () => {
  _origCloseZone()
  hideTestimonialPanel()
}

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

// ─── Minimap ──────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
if (mmCanvas) {
  mmCanvas.width = 160
  mmCanvas.height = 160
}
const mmCtx = mmCanvas?.getContext('2d')

function drawMinimap() {
  if (!mmCtx) return
  mmCtx.clearRect(0, 0, 160, 160)
  mmCtx.fillStyle = 'rgba(9, 7, 27, 0.95)'
  mmCtx.fillRect(0, 0, 160, 160)

  const scale = 0.55
  const cx = 80, cy = 80

  zones.forEach(zone => {
    const dx = (zone.pos.x - car.position.x) * scale + cx
    const dz = (zone.pos.z - car.position.z) * scale + cy
    mmCtx.fillStyle = '#' + zone.color.toString(16).padStart(6, '0')
    mmCtx.beginPath()
    mmCtx.arc(dx, dz, 7, 0, Math.PI * 2)
    mmCtx.fill()
  })

  // Draw car as triangle
  mmCtx.save()
  mmCtx.translate(cx, cy)
  mmCtx.rotate(-car.angle)
  mmCtx.fillStyle = '#00d4ff'
  mmCtx.beginPath()
  mmCtx.moveTo(0, -8)
  mmCtx.lineTo(6, 6)
  mmCtx.lineTo(-6, 6)
  mmCtx.closePath()
  mmCtx.fill()
  mmCtx.restore()
}

// ─── NPC Proximity Detection ──────────────────────────────────
const NPC_NEAR = 10

function updateNPCs() {
  const carPos = car.position
  npcs.forEach(npc => {
    const dist = npc.getDistanceTo(carPos)
    if (dist < NPC_NEAR) {
      npc.activate()
    } else {
      npc.deactivate()
    }
    npc.update(0.016, carPos)
  })

  testimonialChars.forEach(char => {
    char.update(0.016, carPos, NPC_NEAR)
  })
}

// ─── Click Handler for Testimonials ──────────────────────────
renderer.domElement.addEventListener('click', (e) => {
  if (activeZone) return
  for (const char of testimonialChars) {
    const data = char.handleClick(e, camera, renderer)
    if (data) {
      showTestimonialPanel(data)
      break
    }
  }
})

renderer.domElement.addEventListener('pointermove', (e) => {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  let hovering = false
  for (const char of testimonialChars) {
    const intersects = raycaster.intersectObjects(char.clickableObjects, true)
    if (intersects.length > 0) {
      hovering = true
      char.handlePointerOver()
    } else {
      char.handlePointerOut()
    }
  }
  renderer.domElement.style.cursor = hovering ? 'pointer' : 'default'
})

// ─── Animation Loop ───────────────────────────────────────────
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
    z.group.position.y = Math.sin(time * 1.5 + i) * 0.25
  })

  // Update synthwave world
  synthwaveWorld.update(time)

  renderer.render(scene, camera)
}
animate()

// ─── Resize Handler ───────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ─── Loading Screen ───────────────────────────────────────────
setTimeout(() => {
  document.getElementById('loading')?.classList.add('hidden')
}, 800)

// ─── Language Toggle ──────────────────────────────────────────
document.getElementById('lang-btn-en')?.addEventListener('click', () => setLocale('en'))
document.getElementById('lang-btn-ar')?.addEventListener('click', () => setLocale('ar'))

// ─── Classic View ─────────────────────────────────────────────
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
    testimonialChars: any[]
  }
}

window.show3D = () => {
  document.getElementById('classic-view')?.classList.remove('active')
  const hud = document.getElementById('hud')
  if (hud) hud.style.display = ''
}

window.closeZone = () => {
  document.querySelectorAll('.zone-panel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.testimonial-panel').forEach(p => p.classList.remove('active'))
  activeZone = null
  activeTestimonial = null
}

// ─── Init ─────────────────────────────────────────────────────
initI18n()

console.log('🚀 Synthwave Portfolio Ready! Drive with WASD/Arrows')
