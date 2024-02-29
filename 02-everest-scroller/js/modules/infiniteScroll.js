import { GLManager } from "./GLManager"
import { initPlanes } from "./initPlanes"
// import {initPlanes} from "./initPlanes"

const psd = {
  width: 1680,
  height: 992,
}
function getPsdToWinWidthFactor() {
  return window.innerWidth / psd.width
}

function getPsdToWinHeightFactor() {
  return window.innerHeight / psd.height
}

function infiniteScroll(images = []) {
  this.GL = new GLManager(this.container, images)
  // The planes are only dependent on the length of the images
  // Thus, we can initialize it on the constructor. And recreate them
  // only when the ammount of images change
  const { planes, spaceY } = initPlanes()

  // Right now the imgNo's are normalized to the ammount of planes on each column
  // This loops makes that into the ammount of images
  for (let index = 0; index < planes.length; index++) {
    const imgNo = planes[index].imgNo
    if (imgNo >= 0) {
      planes[index].imgNo =
        imgNo > images.length - 1 ? imgNo - images.length : imgNo
    } else {
      planes[index].imgNo = images.length + imgNo
    }
    // planes[index].imgNo =
    //   imgNo > images.length - 1 ? imgNo - images.length : imgNo;
  }

  this.images = images

  this.planes = planes
  this.spaceY = spaceY * getPsdToWinHeightFactor()
  this.spaceYHalf = this.spaceY / 2

  this.drawPlane = this.drawPlane.bind(this)
  this.isMouseDown = false
  this.mouseSensitivity = 4
  this.scroll = {
    // This is going to go dirrectly into the planes
    current: 0,
    // The current scroll will allways try to become target
    target: 0,
    // And this ones will be used for that calculation
    start: 0,
    sensitivity: 4,
    raw: 0,
    delta: 0,
    needsUpdate: false,
  }

  this.blackAndWhite = {
    current: [1, 1, 0, 1, 1],
    target: [1, 1, 0, 1, 1],
    needsUpdate: false,
  }
  this.activeImgNo = 0
  this.magnitude = {
    target: 0,
    current: 0,
    needsUpdate: false,
  }

  this.updateRAF = null
  this.update = this.update.bind(this)
  this.updateMagnitude = this.updateMagnitude.bind(this)
  this.updateScroll = this.updateScroll.bind(this)
  this.updateBlackAndWhite = this.updateBlackAndWhite.bind(this)
  this.updator = [
    [this.scroll, this.updateScroll],
    [this.magnitude, this.updateMagnitude],
    [this.blackAndWhite, this.updateBlackAndWhite],
  ]
}
infiniteScroll.prototype.mount = function (container) {
  this.GL.mount(container)
}
infiniteScroll.prototype.draw = function () {
  this.planes.forEach(this.drawPlane)
}
infiniteScroll.prototype.drawPlane = function (plane, index) {
  // Convert planes to screen proportions

  const psdToWinWidthFactor = getPsdToWinWidthFactor()
  const psdToWinHeightFactor = getPsdToWinHeightFactor()

  // Using Width Factor
  const x = plane.x * psdToWinWidthFactor
  const width = plane.width * psdToWinWidthFactor
  // Using height Factor
  const y = plane.y * psdToWinHeightFactor
  const height = plane.height * psdToWinHeightFactor

  let blackAndWhite = 1
  if (index < 4) {
    blackAndWhite = this.blackAndWhite.current[index]
  }
  this.GL.drawPlane({
    x,
    width,
    y,
    height,
    scroll: this.scroll.current * plane.direction,
    points: plane.points,
    imgNo: plane.imgNo,
    index,
    magnitude: this.magnitude.current,
    blackAndWhite,
  })
}
infiniteScroll.prototype.render = function () {
  this.GL.render()
}
infiniteScroll.prototype.onResize = function () {
  this.GL.onResize()
}
infiniteScroll.prototype.onMouseDown = function (scroll) {
  this.scroll.start = scroll
  this.scroll.raw = scroll
  this.isMouseDown = true
  this.magnitude.target = 0.75
  this.magnitude.needsUpdate = true
  this.scheduleUpdate()
}
infiniteScroll.prototype.jumpBack = function () {
  this.scroll.start = this.scroll.raw
  this.scroll.target = this.scroll.target - this.spaceY * this.scroll.delta
  this.scroll.current = this.scroll.current - this.spaceY * this.scroll.delta

  const lastIndex = this.images.length - 1
  // If delta is -1 we want to loop back at the end
  // If delta is 1 we want to loop back to 0
  const edge = 1 === this.scroll.delta ? lastIndex : 0
  const edgeNext = 1 === this.scroll.delta ? 0 : lastIndex
  for (let i = 0; i < this.planes.length; i++) {
    const imgNo = this.planes[i].imgNo
    this.planes[i].imgNo = imgNo === edge ? edgeNext : imgNo + this.scroll.delta
  }
  // Shift blacks and whites
  if (this.scroll.delta === 1) {
    for (let i = 0; i < 5; i++) {
      var nextIndex = 4 === i ? 0 : i + 1
      this.blackAndWhite.target[i] = this.blackAndWhite.target[nextIndex]
      this.blackAndWhite.current[i] = this.blackAndWhite.current[nextIndex]
    }
  } else {
    for (let i = 4; -1 < i; i--) {
      var prevIndex = 0 === i ? 4 : i - 1
      this.blackAndWhite.target[i] = this.blackAndWhite.target[prevIndex]
      this.blackAndWhite.current[i] = this.blackAndWhite.current[prevIndex]
    }
  }
  this.blackAndWhite.needsUpdate = true
  this.scheduleUpdate()
}
infiniteScroll.prototype.onMouseMove = function (scroll) {
  if (!this.isMouseDown) return
  // Just restart them
  this.scroll.delta = Math.sign(this.scroll.raw - scroll)
  this.scroll.raw = scroll

  if (Math.abs(this.scroll.target) > this.spaceY) {
    this.jumpBack()
  }
  this.scroll.target = -(scroll - this.scroll.start) * this.scroll.sensitivity
  // This handles the color/black and white
  this.noChange()

  this.scroll.needsUpdate = true
  this.scheduleUpdate()
}
infiniteScroll.prototype.noChange = function (scroll) {
  const thirdPlaneImgNo = this.planes[2].imgNo
  const isOverThreshold = Math.abs(this.scroll.target) > this.spaceYHalf

  // edge cases i think
  const isBelowThreshold =
    (0 < this.scroll.target && this.scroll.target < this.spaceYHalf) ||
    (this.scroll.target < 0 && this.scroll.target > -this.spaceYHalf)
  const hasSameImg = this.activeImgNo === thirdPlaneImgNo
  if ((isOverThreshold && hasSameImg) || (isBelowThreshold && !hasSameImg)) {
    const lastIndex = this.images.length - 1
    // If delta is -1 we want to loop back at the end
    // If delta is 1 we want to loop back to 0
    const edge = 1 === this.scroll.delta ? lastIndex : 0
    const edgeNext = 1 === this.scroll.delta ? 0 : lastIndex
    const lastActiveImgNo = this.activeImgNo
    this.activeImgNo =
      this.activeImgNo === edge
        ? edgeNext
        : this.activeImgNo + this.scroll.delta

    if (lastActiveImgNo !== this.activeImgNo) {
      this.blackAndWhite.needsUpdate = true
    }
  }
}
infiniteScroll.prototype.onMouseUp = function () {
  // Just restart them
  // this.scroll.start = 0;
  // this.scroll.posY = 0;

  if (this.scroll.delta === 1 && this.scroll.target > this.spaceY / 2) {
    // If the closest plane is plane 1(the plane over our main plane).
    // Set scroll.target
    // jumpBack will substract spaceY
    // Finally, making scroll.target to 0
    // And making scroll.current to 1 block backwards
    this.scroll.target = this.spaceY
    this.jumpBack()
  } else if (
    this.scroll.delta === -1 &&
    this.scroll.target < -this.spaceY / 2
  ) {
    // If the closest plane is plane 3(the plane under our main plane).
    // Set negative scroll.target
    // jumpBack will add spaceY
    // Finally, making scroll.target to 0
    // And making scroll.current to 1 block backwards
    this.scroll.target = -this.spaceY
    this.jumpBack()
  } else {
    this.scroll.target = 0
  }
  this.isMouseDown = false

  this.scroll.needsUpdate = true
  this.magnitude.target = 0
  this.magnitude.needsUpdate = true
  this.noUp()
  this.scheduleUpdate()
}
infiniteScroll.prototype.noUp = function () {
  const lastActiveImgNo = this.activeImgNo
  this.activeImgNo = this.planes[2].imgNo
  if (lastActiveImgNo !== this.activeImgNo) {
    this.blackAndWhite.needsUpdate = true
    this.scheduleUpdate()
  }
}
infiniteScroll.prototype.updateMagnitude = function () {
  let magnitude =
    this.magnitude.current +
    (this.magnitude.target - this.magnitude.current) * 0.1

  if (Math.abs(this.magnitude.target - magnitude) < 0.001) {
    this.magnitude.current = this.magnitude.target
    this.magnitude.needsUpdate = false
  } else {
    this.magnitude.current = magnitude
  }
}
infiniteScroll.prototype.updateBlackAndWhite = function () {
  let done = 0
  for (let index = 0; index < 5; index++) {
    //  Give colors ( 1 ) to the current ImgNo
    this.blackAndWhite.target[index] =
      this.planes[index].imgNo === this.activeImgNo ? 0 : 1
    // Reach target
    let newCurrent =
      this.blackAndWhite.current[index] +
      0.1 *
        (this.blackAndWhite.target[index] - this.blackAndWhite.current[index])
    if (Math.abs(this.blackAndWhite.target[index] - newCurrent) < 0.001) {
      this.blackAndWhite.current[index] = this.blackAndWhite.target[index]
      done += 1
    } else {
      this.blackAndWhite.current[index] = newCurrent
    }
  }
  if (done === 5) {
    this.blackAndWhite.needsUpdate = false
  }
}
infiniteScroll.prototype.updateScroll = function () {
  // this.scroll.current  = this.scroll.target;
  // Ease current Scroll into target
  let currentScroll =
    this.scroll.current + (this.scroll.target - this.scroll.current) * 0.09
  if (Math.abs(this.scroll.target - currentScroll) < 0.1) {
    this.scroll.current = this.scroll.target
    this.scroll.needsUpdate = false
  } else {
    this.scroll.current = currentScroll
  }
}

infiniteScroll.prototype.scheduleUpdate = function () {
  if (this.updateRAF) return
  this.updateRAF = requestAnimationFrame(this.update)
}

infiniteScroll.prototype.update = function () {
  let didUpdate = false

  for (var i = 0; i < this.updator.length; i++) {
    if (this.updator[i][0].needsUpdate) {
      didUpdate = true
      // Run update function
      this.updator[i][1]()
    }
  }

  if (didUpdate) {
    this.draw()
    this.render()
    this.updateRAF = requestAnimationFrame(this.update)
  } else {
    cancelAnimationFrame(this.updateRAF)
    this.updateRAF = null
  }
}
export { infiniteScroll }
