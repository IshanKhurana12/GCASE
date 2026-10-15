const COLORS = ['#0f6b63', '#d6f56b', '#ff8fab', '#ffd166']

/** Tiny click-confetti. Uses the Web Animations API so it needs no CSS file. */
export function sparkBurst(x, y) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement('span')
    const angle = (Math.PI * 2 * i) / 10
    const dist = 28 + Math.random() * 26
    Object.assign(dot.style, {
      position: 'fixed', left: `${x}px`, top: `${y}px`, width: '7px', height: '7px', borderRadius: '50%',
      background: COLORS[i % COLORS.length], pointerEvents: 'none', zIndex: 9999,
    })
    document.body.appendChild(dot)
    dot.animate(
      [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
       { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }],
      { duration: 550, easing: 'ease-out' }
    ).onfinish = () => dot.remove()
  }
}
