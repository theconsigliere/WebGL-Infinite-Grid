// const psd = {
//   w: 1680,
//   h: 992
// };
const mainPlane = {
  x: 936,
  y: 144,
  width: 520,
  height: 676,
  points: {
    hori: 18,
    vert: 14,
  },
  // margin between row/columns
  margin: {
    x: 120,
    y: 100,
  },
}

function initPlanes() {
  const planes = []
  // The total space the plane occupies. Includes margin
  const spaceX = mainPlane.width + mainPlane.margin.x
  const spaceY = mainPlane.height + mainPlane.margin.y

  // Since we are going to add all the planes in a single array.
  // We need to keep track of the index
  let index = 0
  // Right hand column
  const rightColX = mainPlane.x
  const rightColY = mainPlane.y
  for (var i = 0; i < 5; i++) {
    let offsetY = i - 2
    // This makes sure the center plane starts with the first image
    // And the planes behind the main plane start with the last image
    let imgNo = offsetY
    planes[index] = {
      x: rightColX,
      y: rightColY + spaceY * offsetY,
      width: mainPlane.width,
      height: mainPlane.height,
      points: mainPlane.points,
      direction: 1,
      imgNo,
    }
    index++
  }

  let middleColX = mainPlane.x - spaceX
  let middleColY = -350 + mainPlane.y
  for (var j = 0; j < 4; j++) {
    let offsetY = j - 1
    // In the center column we just want a different offset. It doesn't matter
    let imgNo = 4 - j
    planes[index] = {
      x: middleColX,
      y: middleColY + spaceY * offsetY,
      width: mainPlane.width,
      height: mainPlane.height,
      points: mainPlane.points,
      direction: -1,
      imgNo,
    }
    index++
  }

  const leftColX = mainPlane.x - 2 * spaceX
  const leftColY = rightColY
  for (var k = 0; k < 5; k++) {
    // this -2 will make the y start 2 rows above
    // Since its the same as the first(right) column, they start at the same place
    // basically offsetY
    let offsetY = k - 2

    // In the left column we just want to make it slightly different from the main plane
    let imageOffset = offsetY - 1
    let imgNo = imageOffset

    planes[index] = {
      x: leftColX,
      y: leftColY + spaceY * offsetY,
      width: mainPlane.width,
      height: mainPlane.height,
      points: mainPlane.points,
      direction: 1,
      imgNo,
    }
    index++
  }

  return { planes, spaceY }
}

export { initPlanes }
