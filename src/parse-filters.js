function computeATempo (speed) {
  if (speed === 1) {
    return speed
  }
  const result = []
  if (speed > 2) {
    while (speed > 2) {
      speed = speed / 2
      result.push(2)
    }
    result.push(speed)
    return result
  }
  while (speed < 0.5) {
    speed = speed / 0.5
    result.push(0.5)
  }
  result.push(speed)
  return result
}

function parseFilters (options) {
  const { crop, format, resize, speed } = options
  const videoFilters = []
  const audioFilters = []

  // https://superuser.com/a/624564
  if (resize) {
    videoFilters.push(`scale=${resize.width}:${resize.height}`)
  }

  // https://video.stackexchange.com/a/4571
  if (crop) {
    videoFilters.push(`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`)
  }

  // http://trac.ffmpeg.org/wiki/How%20to%20speed%20up%20/%20slow%20down%20a%20video
  if (speed !== 1) {
    videoFilters.push(`setpts=(1/${speed})*PTS`)
    computeATempo(speed).forEach(function (audioSpeed) {
      audioFilters.push(`atempo=${audioSpeed}`)
    })
  }

  // https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/
  if (format === 'gif') {
    videoFilters.push(
      `split [v1][v2];[v1] palettegen [palette];[v2][palette] paletteuse`
    )
  }

  const result = []
  if (videoFilters.length !== 0) {
    result.push({ vf: `"[0:v] ${videoFilters.join(',')}"` })
  }
  if (audioFilters.length !== 0) {
    result.push({ af: `"${audioFilters.join(',')}"` })
  }
  return result
}

module.exports = parseFilters
