'use strict';

const NB_PARTICULES = 5000
const SIZE_ARRAY_INTERPOLATION = 100

let ctx, canvas
let width, height
let mouse = {x: 0, y: 0}
let particules = undefined
let noise = new Array(SIZE_ARRAY_INTERPOLATION).fill().map( () => new Float32Array(SIZE_ARRAY_INTERPOLATION)).map(row => row.map(col => Math.random() * 360))

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
  noise = noise.map(row => row.map(col => col + 1))
  draw(particules)
  particules.forEach(p => p.move())

  requestAnimationFrame(loop)
}

class Particule {
  constructor(width, height) {
    this.position = {x: Math.random() * width, y: Math.random() * height}
    this.orientation = Math.random() * 360
    this.speed = 1 // TODO: speed variable ?
    // TODO: voir 3d
  }
  move = () => {


    let x = linearInterpolation(this.position.x, 0, width, 0, SIZE_ARRAY_INTERPOLATION-2)
    let y = linearInterpolation(this.position.y, 0, height, 0, SIZE_ARRAY_INTERPOLATION-2)
    let xCase = Math.floor(x)
    let yCase = Math.floor(y)

    let interpolateX1 = interpolate(x % 1, noise[xCase][yCase], noise[xCase + 1][yCase])
    let interpolateX2 = interpolate(x % 1, noise[xCase][yCase + 1], noise[xCase + 1][yCase + 1])
    let interpolation = interpolate(y % 1, interpolateX1, interpolateX2)

    this.orientation = interpolation// * time % 360
    this.position.x += Math.cos((this.orientation) * Math.PI / 180) * this.speed
    this.position.y += Math.sin((this.orientation) * Math.PI / 180) * this.speed

    if (this.position.x > width) this.position.x = 5
    if (this.position.x < 0) this.position.x = width - 5
    if (this.position.y > height) this.position.y = 5
    if (this.position.y < 0) this.position.y = height - 5
  }
}

const draw = particules => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#000000"

  particules.forEach(particule => {
    ctx.beginPath()
    ctx.arc(particule.position.x, particule.position.y, 5, 0, 2*Math.PI)
    ctx.fill()
  })
  // particules.forEach(particule => {
  //   ctx.beginPath()
  //   ctx.moveTo(particule.position.x, particule.position.y)
  //   ctx.lineTo(mouse.x,mouse.y)
  //   ctx.stroke()
  // })
  ctx.beginPath()
  ctx.arc(mouse.x, mouse.y, 5, 0, 2*Math.PI)
  ctx.fill()
}

const linearInterpolation = (x, xMin, xMax, min, max) => x / (xMax - xMin) * (max - min)
const interpolate = (percent, c1, c2) => percent * c2 + (1 - percent) * c1



document.getElementById('canvas').addEventListener('mousemove', e => mouse = {x: e.clientX, y: e.clientY})
window.addEventListener('load', init)
