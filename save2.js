'use strict';

const NB_PARTICULES = 10
const SIZE_ARR = 10
const DEPTH = 256
const MAX_SIZE_POINT = 10
const FRAMES_BETWEEN_NEW_TARGET = 1000

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
  if (nbFrame % FRAMES_BETWEEN_NEW_TARGET === 0) {
    particules.forEach(particule => particule.assignTarget(particules))
  }
  draw(particules)
  particules.forEach(p => p.move())

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
    this.target = undefined
    // {
    //   x: Math.random() * (width - width * 0.1) + width * 0.05,
    //   y: Math.random() * (height - height * 0.1) + height * 0.05,
    //   z: Math.random() * (DEPTH - DEPTH * 0.1) + DEPTH * 0.05
    // }
    this.orientation = {
      x: Math.random() * (width - width * 0.1) + width * 0.05,
      y: Math.random() * (height - height * 0.1) + height * 0.05,
      z: Math.random() * (DEPTH - DEPTH * 0.1) + DEPTH * 0.05
    }
    this.speed = 0.3 + Math.random() * (2 - 0.3)  // TODO: speed variable ?
    this.nbFrame = 0
  }
  move = () => {
    // if (this.nbFrame % FRAMES_BETWEEN_NEW_TARGET === 0) {
    //   this.target = {
    //     x: Math.random() * (width - width * 0.1) + width * 0.05,
    //     y: Math.random() * (height - height * 0.1) + height * 0.05,
    //     z: Math.random() * (DEPTH - DEPTH * 0.1) + DEPTH * 0.05
    //   }
    // }
    let vectorDirection = {
      x: this.target.x - this.position.x,
      y: this.target.y - this.position.y,
      z: this.target.z - this.position.z
    }
    this.orientation = {
      x: this.orientation.x + (vectorDirection.x - this.orientation.x) * 0.01,
      y: this.orientation.y + (vectorDirection.y - this.orientation.y) * 0.01,
      z: this.orientation.z + (vectorDirection.z - this.orientation.z) * 0.01
    }
    let norm = Math.sqrt(this.orientation.x * this.orientation.x + this.orientation.y * this.orientation.y + this.orientation.z * this.orientation.z)
    let normalizedOrientation = {
      x: this.orientation.x / norm,
      y: this.orientation.y / norm,
      z: this.orientation.z / norm
    }
// TODO: assign a une target
    this.position.x += normalizedOrientation.x * this.speed
    this.position.y += normalizedOrientation.y * this.speed
    this.position.z += normalizedOrientation.z * this.speed

    if (this.position.x > width) this.position.x = Math.random() * width // 5
    if (this.position.x < 0) this.position.x = Math.random() * width // - 5
    if (this.position.y > height) this.position.y = Math.random() * height // 5
    if (this.position.y < 0) this.position.y = Math.random() * height // - 5
    if (this.position.z > DEPTH) this.position.z = Math.random() * DEPTH // 5
    if (this.position.z < 0) this.position.z = Math.random() * DEPTH // - 5
  }

  assignTarget = listTarget => {
    let index = Math.floor(Math.random() * listTarget.length)
    this.target = listTarget[index].position
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
    let gradient = ctx.createLinearGradient(particule.target.x, particule.target.y, particule.position.x, particule.position.y)
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(1, '#ffffff')
    ctx.strokeStyle = gradient
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
