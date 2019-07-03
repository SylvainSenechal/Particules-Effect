'use strict';
// TODO: rename lonely planets
// TODO: draw acceleration, tangente, vitesse etc
// TODO: remettre en 2d + mettre un poids logarithmique
const NB_PARTICULES = 100
const SIZE_ARR = 10
const DEPTH = 256
const MAX_SIZE_POINT = 10
const FRAMES_BETWEEN_NEW_TARGET = 500
const SLOW_FACTOR = 0.99

let ctx, canvas
let width, height
let mouse = {x: 0, y: 0}
let particules = undefined
let nbFrame = 0

const init = () => {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height

  particules = new Array(NB_PARTICULES).fill().map( elem => new Particule(width, height))
  particules.forEach(particule => particule.assignTarget(particules))
  console.log(particules)
  loop()
}
let time = 0
const loop = () => {
  time += 0.00273
  nbFrame++
  // if (nbFrame % FRAMES_BETWEEN_NEW_TARGET === 0) particules.forEach(particule => particule.assignTarget(particules))
  particules.forEach(p => p.accelerate())
  particules.forEach(p => p.move())

  draw(particules)
  requestAnimationFrame(loop)
}

// TODO: clic enfoncé : la bulle de la sourie <=> planète
// TODO: voir pourquoi ils vont vers la gauche
// TODO: Gradient de couleur sur les lignes entre eux
// TODO: gradient, si z identique pas de gradient, selon la difference de profondeur gradient qui sarrete plus ou moins loin ?
// TODO: régler le clignotement aux bordures ( les virer et remettre au milieu ?)
// TODO: faire un 5x5x5 pour tester 3d vector
// transparant : aucune liaison, de plus en plus foncé
class Particule {
  constructor(width, height) {
    this.position = {
      x: Math.random() * (width - width * 0.1) + width * 0.05,
      y: Math.random() * (height - height * 0.1) + height * 0.05,
      z: Math.random() * (DEPTH - DEPTH * 0.1) + DEPTH * 0.05
    }
    this.speed = {x: 0, y: 0, z: 0}
    this.acceleration = {x: 0, y: 0, z: 0}
    this.target = undefined

    this.speed = {x: 0, y: 0, z: 0} // 0.3 + Math.random() * (2 - 0.3)  // TODO: speed variable ?
    this.nbFrame = 0
  }
  move = () => {
    this.position.x += this.speed.x
    this.position.y += this.speed.y
    this.position.z += this.speed.z

    if (this.position.x > width-100) {
      this.acceleration.x = 0
      this.speed.x = - this.speed.x * 0.5
      this.position.x = width-100
    } // this.position.x = Math.random() * width // 5
    if (this.position.x < 100) {
      this.acceleration.x = 0
      this.speed.x = - this.speed.x * 0.5
      this.position.x = 100
    } //  this.position.x = Math.random() * width // - 5
    if (this.position.y > height-100) {
      this.acceleration.y = 0
      this.speed.y = - this.speed.y * 0.5
      this.position.y = height-100
    } // this.position.y = Math.random() * height // 5
    if (this.position.y < 100) {
      this.acceleration.y = 0
      this.speed.y = - this.speed.y * 0.5
      this.position.y = 100
    } // this.position.y = Math.random() * height // - 5
    if (this.position.z > DEPTH) {
      this.acceleration.z = 0
      this.speed.z = - this.speed.z * 0.5
      this.position.z = DEPTH
    } // this.position.z = Math.random() * DEPTH // 5
    if (this.position.z < 0) {
      this.acceleration.z = 0
      this.speed.z = - this.speed.z * 0.5
      this.position.z = 0
    } // this.position.z = Math.random() * DEPTH // - 5
  }

  accelerate = () => {
    let vectorDirection = {
      x: this.target.x - this.position.x,
      y: this.target.y - this.position.y,
      z: this.target.z - this.position.z
    }
    this.acceleration = {
      x: this.acceleration.x + (vectorDirection.x - this.acceleration.x),// * 0.01,
      y: this.acceleration.y + (vectorDirection.y - this.acceleration.y),// * 0.01,
      z: this.acceleration.z + (vectorDirection.z - this.acceleration.z)// * 0.01
    }
    let norm = Math.sqrt(this.acceleration.x * this.acceleration.x + this.acceleration.y * this.acceleration.y + this.acceleration.z * this.acceleration.z)
    let normalizedOrientation = {
      x: this.acceleration.x / norm,
      y: this.acceleration.y / norm,
      z: this.acceleration.z / norm
    }
    this.speed.x += normalizedOrientation.x * 0.05
    this.speed.y += normalizedOrientation.y * 0.05
    this.speed.z += normalizedOrientation.z * 0.05

    this.speed.x = this.speed.x * SLOW_FACTOR
    this.speed.y = this.speed.y * SLOW_FACTOR
    this.speed.z = this.speed.z * SLOW_FACTOR
  }

  assignTarget = listTarget => {
    let index = Math.floor(Math.random() * (listTarget.length - 1))
    this.target = listTarget.filter(particule => particule.position.x !== this.position.x)[index].position
  }
}

const draw = particules => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#000000"

  particules.forEach(particule => {
    let size = linearInterpolation(particule.position.z, 0, DEPTH, 1, MAX_SIZE_POINT)
    ctx.beginPath()
    ctx.arc(particule.position.x, particule.position.y, size, 0, 2*Math.PI)
    ctx.fill()
  })
  particules.forEach(particule => {
    ctx.beginPath()
    // let gradient = ctx.createLinearGradient(particule.target.x, particule.target.y, particule.position.x, particule.position.y)
    // gradient.addColorStop(0, '#000000')
    // gradient.addColorStop(1, '#ffffff')
    // ctx.strokeStyle = gradient
    ctx.moveTo(particule.position.x, particule.position.y)
    ctx.lineTo(particule.target.x, particule.target.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(particule.target.x, particule.target.y, 5, 0, 2*Math.PI)
    ctx.fill()
  })
  // ctx.beginPath()
  // ctx.arc(mouse.x, mouse.y, 5, 0, 2*Math.PI)
  // ctx.fill()
}

const linearInterpolation = (x, xMin, xMax, min, max) => x / (xMax - xMin) * (max - min)
const interpolate = (percent, c1, c2) => percent * c2 + (1 - percent) * c1



document.getElementById('canvas').addEventListener('mousemove', e => mouse = {x: e.clientX, y: e.clientY})
window.addEventListener('load', init)
