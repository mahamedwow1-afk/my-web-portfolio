import * as THREE from 'three'

export class Spaceship {
  public group: THREE.Group
  public velocity: THREE.Vector3
  public rotationSpeed: number

  constructor() {
    this.group = new THREE.Group()
    this.velocity = new THREE.Vector3()
    this.rotationSpeed = 0

    this.buildShip()
    this.resetPosition()
  }

  private buildShip() {
    // Main fuselage - sleek cone shape
    const bodyGeo = new THREE.ConeGeometry(0.3, 2, 6)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.2
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.rotation.x = Math.PI / 2
    this.group.add(body)

    // Cockpit window
    const cockpitGeo = new THREE.SphereGeometry(0.2, 8, 8)
    const cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.5,
      transparent: true,
      opacity: 0.8
    })
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat)
    cockpit.position.set(0, 0.05, 0.5)
    this.group.add(cockpit)

    // Wings
    const wingGeo = new THREE.BoxGeometry(1.5, 0.05, 0.6)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.8,
      roughness: 0.3
    })
    const wings = new THREE.Mesh(wingGeo, wingMat)
    wings.position.set(0, 0, -0.2)
    this.group.add(wings)

    // Engine glow
    const engineGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.3, 8)
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff4400,
      emissiveIntensity: 2
    })
    const engine = new THREE.Mesh(engineGeo, engineMat)
    engine.rotation.x = Math.PI / 2
    engine.position.set(0, 0, -1.1)
    this.group.add(engine)

    // Engine light
    const engineLight = new THREE.PointLight(0xff4400, 1, 5)
    engineLight.position.set(0, 0, -1.3)
    this.group.add(engineLight)

    // Neon accent strip
    const stripGeo = new THREE.BoxGeometry(0.02, 0.02, 1.8)
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 3
    })
    const stripL = new THREE.Mesh(stripGeo, stripMat)
    stripL.position.set(0.4, 0, 0)
    this.group.add(stripL)

    const stripR = stripL.clone()
    stripR.position.set(-0.4, 0, 0)
    this.group.add(stripR)
  }

  private resetPosition() {
    // Random position high in the sky, entering from edges
    const side = Math.floor(Math.random() * 4)
    const speed = 80 + Math.random() * 60

    switch (side) {
      case 0: // From left
        this.group.position.set(-200, 50 + Math.random() * 80, (Math.random() - 0.5) * 300)
        this.velocity.set(speed, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 20)
        break
      case 1: // From right
        this.group.position.set(200, 50 + Math.random() * 80, (Math.random() - 0.5) * 300)
        this.velocity.set(-speed, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 20)
        break
      case 2: // From top (distance)
        this.group.position.set((Math.random() - 0.5) * 300, 130, (Math.random() - 0.5) * 300)
        this.velocity.set((Math.random() - 0.5) * 30, -speed * 0.5, (Math.random() - 0.5) * 30)
        break
      case 3: // From bottom
        this.group.position.set((Math.random() - 0.5) * 300, -20, (Math.random() - 0.5) * 300)
        this.velocity.set((Math.random() - 0.5) * 30, speed * 0.5, (Math.random() - 0.5) * 30)
        break
    }

    // Face direction of movement
    this.group.lookAt(
      this.group.position.x + this.velocity.x,
      this.group.position.y + this.velocity.y,
      this.group.position.z + this.velocity.z
    )
  }

  public update(delta: number, bounds: number = 250) {
    this.group.position.add(this.velocity.clone().multiplyScalar(delta))

    // Subtle banking based on velocity
    this.group.rotation.z = -this.velocity.x * 0.002
    this.group.rotation.x = this.velocity.y * 0.001

    // Reset if out of bounds
    if (Math.abs(this.group.position.x) > bounds ||
        Math.abs(this.group.position.y) > bounds ||
        Math.abs(this.group.position.z) > bounds) {
      this.resetPosition()
    }
  }
}

export function createSpaceshipTraffic(scene: THREE.Scene, count: number = 4): Spaceship[] {
  const ships: Spaceship[] = []
  for (let i = 0; i < count; i++) {
    const ship = new Spaceship()
    scene.add(ship.group)
    ships.push(ship)
  }
  return ships
}
