import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  radius: number; alpha: number; pulse: number; pulseSpeed: number
}

interface FloatShape {
  x: number; y: number; vx: number; vy: number
  size: number; rotation: number; rotSpeed: number; alpha: number; sides: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (pref.matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const c = canvas
    let animId: number
    let nodes: Particle[] = []
    let shapes: FloatShape[] = []

    function resize() {
      c.width = window.innerWidth
      c.height = window.innerHeight
      init()
    }

    function init() {
      const count = Math.min(30, Math.floor((c.width * c.height) / 20000))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      }))

      shapes = Array.from({ length: 6 }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 20 + Math.random() * 35,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        alpha: 0.04 + Math.random() * 0.04,
        sides: [3, 4, 6][Math.floor(Math.random() * 3)],
      }))
    }

    function drawPolygon(x: number, y: number, sides: number, size: number, rotation: number) {
      ctx.beginPath()
      for (let i = 0; i < sides; i++) {
        const angle = rotation + (i / sides) * Math.PI * 2
        const px = x + Math.cos(angle) * size
        const py = y + Math.sin(angle) * size
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    function draw() {
      ctx.clearRect(0, 0, c.width, c.height)

      // Floating geometric shapes
      shapes.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.rotation += s.rotSpeed
        if (s.x < -100) s.x = c.width + 100
        if (s.x > c.width + 100) s.x = -100
        if (s.y < -100) s.y = c.height + 100
        if (s.y > c.height + 100) s.y = -100

        ctx.save()
        drawPolygon(s.x, s.y, s.sides, s.size, s.rotation)
        ctx.strokeStyle = `rgba(204, 34, 41, ${s.alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })

      // Connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.12
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(204, 34, 41, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Nodes with pulse
      nodes.forEach(n => {
        n.pulse += n.pulseSpeed
        const pulsed = n.radius + Math.sin(n.pulse) * 0.5
        const a = n.alpha + Math.sin(n.pulse) * 0.1

        // Glow ring
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulsed * 4)
        grad.addColorStop(0, `rgba(204, 34, 41, ${a * 0.5})`)
        grad.addColorStop(1, 'rgba(204, 34, 41, 0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, pulsed * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, pulsed, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(204, 34, 41, ${a})`
        ctx.fill()

        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > c.width) n.vx *= -1
        if (n.y < 0 || n.y > c.height) n.vy *= -1
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 0 }}
    />
  )
}
