/* lib/misc/animation */
/* using Animate.CSS to add and remove animations from things */
/* global Bogdle */

Bogdle._animateCSS = (element, animation, loop, prefix = 'animate__') => {
  // We create a Promise and return it
  return new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`
    const node = document.querySelector(element)

    node.classList.add(`${prefix}animated`, animationName)

    if (loop) {
      node.classList.add(`${prefix}infinite`)
    }

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation()
      node.classList.remove(`${prefix}animated`, `${prefix}infinite`, animationName)
      resolve('Animation ended')
    }

    node.addEventListener('animationend', handleAnimationEnd, { once: true })
  })
}

Bogdle.__winAnimation = async function () {
  return new Promise((resolve, reject) => {
    Array.from(Bogdle.dom.interactive.tiles).forEach((tile) =>
      tile.style.setProperty('--animate-duration', '1000ms')
    )

    setTimeout(() => Bogdle._animateCSS('#tile1', 'bounce'), 0)
    setTimeout(() => Bogdle._animateCSS('#tile2', 'bounce'), 100)
    setTimeout(() => Bogdle._animateCSS('#tile3', 'bounce'), 200)
    setTimeout(() => Bogdle._animateCSS('#tile4', 'bounce'), 300)
    setTimeout(() => Bogdle._animateCSS('#tile5', 'bounce'), 400)
    setTimeout(() => Bogdle._animateCSS('#tile6', 'bounce'), 500)
    setTimeout(() => Bogdle._animateCSS('#tile7', 'bounce'), 600)
    setTimeout(() => Bogdle._animateCSS('#tile8', 'bounce'), 700)
    setTimeout(() => Bogdle._animateCSS('#tile9', 'bounce'), 800)

    setTimeout(() => resolve('__winAnimation ended'), 2000)
  })
}
