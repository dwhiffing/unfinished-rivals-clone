const cubeToCartesian = ({ q, r }) => ({
  x: q + Math.floor(r / 2),
  y: r,
})

export const lerp = (a, b, i) => {
  const q = a.q * (1 - i) + b.q * i
  const r = a.r * (1 - i) + b.r * i
  const s = -q - r
  let roundedQ = Math.round(q)
  let roundedR = Math.round(r)
  let roundedS = Math.round(s)
  const diffQ = Math.abs(q - roundedQ)
  const diffR = Math.abs(r - roundedR)
  const diffS = Math.abs(s - roundedS)

  if (diffQ > diffR && diffQ > diffS) {
    roundedQ = -roundedR - roundedS
  } else if (diffR > diffS) {
    roundedR = -roundedQ - roundedS
  }

  return cubeToCartesian({ q: roundedQ, r: roundedR })
}

export const distance = (a, b) =>
  Math.sqrt((a?.x - b?.x) ** 2 + (a?.y - b?.y) ** 2)
