'use strict';

const NB_PARTICULES = 10
const SIZE_ARR = 10
const DEPTH = 256
const MAX_SIZE_POINT = 10

let ctx, canvas
let width, height
let mouse = {x: 0, y: 0}
let particules = undefined

const init = () => {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height

  particules = new Array(NB_PARTICULES).fill().map( elem => new Particule(width, height))
  console.log(particules)
  loop()
}
let time = 0
const loop = () => {
  time+=0.00273
  // noise = noise.map(row => row.map(col => col + 1))
  draw(particules)
  particules.forEach(p => p.move())

  requestAnimationFrame(loop)
}

// TODO: voir pourquoi ils vont vers la gauche
// TODO: Gradient de couleur sur les lignes entre eux
// TODO: gradient, si z identique pas de gradient, selon la difference de profondeur gradient qui sarrete plus ou moins loin ?
// TODO: régler le clignotement aux bordures ( les virer et remettre au milieu ?)
// TODO: faire un 5x5x5 pour tester 3d vector
// transparant : aucune liaison, de plus en plus foncé
class Particule {
  constructor(width, height) {
    this.position = {x: Math.random() * width, y: Math.random() * height, z: Math.random() * DEPTH}
    this.orientation = Math.random() * 360
    this.speed = 1 // TODO: speed variable ?
    this.noise = new Float32Array(SIZE_ARR * SIZE_ARR * SIZE_ARR).map( () => Math.floor(Math.random() * 360))
    // console.log(this.noise)
    // this.noise = new Array(SIZE_ARR).fill()
    // .map( () => new Float32Array(SIZE_ARR))
    // .map(row => row.map(col => Math.random() * 360))
    this.tt = 0
  }
  move = () => {
    // faire une fonction changeOrientation
    let x = linearInterpolation(this.position.x, 0, width, 0, SIZE_ARR-2)
    let y = linearInterpolation(this.position.y, 0, height, 0, SIZE_ARR-2)
    let z = linearInterpolation(this.position.z, 0, DEPTH, 0, SIZE_ARR-2)
    let xCase = Math.floor(x)
    let yCase = Math.floor(y)
    let zCase = Math.floor(z)
    // [zCase + SIZE_ARR * yCase + SIZE_ARR * SIZE_ARR * xCase]
    // let interpolateX12 = interpolate(x % 1, this.noise[xCase][yCase][zCase], this.noise[xCase + 1][yCase][zCase])
    // let interpolateX34 = interpolate(x % 1, this.noise[xCase][yCase + 1][zCase], this.noise[xCase + 1][yCase + 1][zCase])
    // let interpolationX1234 = interpolate(y % 1, interpolateX12, interpolateX34)
    // let interpolateX56 = interpolate(x % 1, this.noise[xCase][yCase][zCase+1], this.noise[xCase + 1][yCase][zCase+1])
    // let interpolateX78 = interpolate(x % 1, this.noise[xCase][yCase + 1][zCase+1], this.noise[xCase + 1][yCase + 1][zCase+1])
    // let interpolationX5678 = interpolate(y % 1, interpolateX56, interpolateX78)
    // let interpolationX12345678 = interpolate(z % 1, interpolationX1234, interpolationX5678)

    let interpolateX12 = interpolate(x % 1, this.noise[zCase + SIZE_ARR * yCase + SIZE_ARR * SIZE_ARR * xCase], this.noise[zCase + SIZE_ARR * yCase + SIZE_ARR * SIZE_ARR * (xCase + 1)])
    let interpolateX34 = interpolate(x % 1, this.noise[zCase + SIZE_ARR * (yCase + 1) + SIZE_ARR * SIZE_ARR * xCase], this.noise[zCase + SIZE_ARR * (yCase + 1) + SIZE_ARR * SIZE_ARR * (xCase + 1)])
    let interpolationX1234 = interpolate(y % 1, interpolateX12, interpolateX34)
    let interpolateX56 = interpolate(x % 1, this.noise[(zCase + 1) + SIZE_ARR * yCase + SIZE_ARR * SIZE_ARR * xCase], this.noise[(zCase + 1) + SIZE_ARR * yCase + SIZE_ARR * SIZE_ARR * (xCase + 1)])
    let interpolateX78 = interpolate(x % 1, this.noise[(zCase + 1) + SIZE_ARR * (yCase + 1) + SIZE_ARR * SIZE_ARR * xCase], this.noise[(zCase + 1) + SIZE_ARR * (yCase + 1) + SIZE_ARR * SIZE_ARR * (xCase + 1)])
    let interpolationX5678 = interpolate(y % 1, interpolateX56, interpolateX78)
    let interpolationX12345678 = interpolate(z % 1, interpolationX1234, interpolationX5678)

    this.orientation = interpolationX12345678// * time % 360
    this.position.x += Math.cos((this.orientation) * Math.PI / 180) * this.speed
    this.position.y += Math.sin((this.orientation) * Math.PI / 180) * this.speed
    this.position.z += Math.cos((this.orientation) * Math.PI / 180) * this.speed + Math.sin((this.orientation) * Math.PI / 180) * this.speed
    this.tt += this.orientation
    // console.log(this.orientation)
    console.log(this.tt)
    if (this.position.x > width) this.position.x = Math.random() * width // 5
    if (this.position.x < 0) this.position.x = Math.random() * width // - 5
    if (this.position.y > height) this.position.y = Math.random() * height // 5
    if (this.position.y < 0) this.position.y = Math.random() * height // - 5
    if (this.position.z > DEPTH) this.position.z = Math.random() * DEPTH // 5
    if (this.position.z < 0) this.position.z = Math.random() * DEPTH // - 5
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
    let gradient = ctx.createLinearGradient(mouse.x, mouse.y, particule.position.x, particule.position.y)
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(1, '#ffffff')
    ctx.strokeStyle = gradient
    ctx.moveTo(particule.position.x, particule.position.y)
    ctx.lineTo(mouse.x, mouse.y)
    ctx.stroke()
  })
  ctx.beginPath()
  ctx.arc(mouse.x, mouse.y, 5, 0, 2*Math.PI)
  ctx.fill()
}

const linearInterpolation = (x, xMin, xMax, min, max) => x / (xMax - xMin) * (max - min)
const interpolate = (percent, c1, c2) => percent * c2 + (1 - percent) * c1



document.getElementById('canvas').addEventListener('mousemove', e => mouse = {x: e.clientX, y: e.clientY})
window.addEventListener('load', init)
