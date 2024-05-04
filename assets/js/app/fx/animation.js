/* audio */
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

    node.addEventListener('animationend', handleAnimationEnd, {once: true})
  })
}
