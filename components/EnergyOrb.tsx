"use client"

import React, { useRef, useEffect } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

interface EnergyOrbProps {
  // Size options
  size?: "sm" | "md" | "lg" | "xl" | number
  className?: string
  
  // Visual variants
  variant?: "default" | "intense" | "subtle" | "amber"
  
  // User-specific customization
  userId?: string
  
  // Advanced options
  intensity?: number
  showContainer?: boolean
  containerClassName?: string
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

const containerSizeMap = {
  sm: "size-8",
  md: "size-10",  
  lg: "size-12",
  xl: "size-16",
}

function getOrbVariant(userId?: string): "default" | "intense" | "subtle" | "amber" {
  if (!userId) return "default"
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  const variants = ["default", "intense", "subtle", "amber"] as const
  return variants[Math.abs(hash) % variants.length]
}

function getOrbIntensity(userId?: string): number {
  if (!userId) return 1.0
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 7) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  return 0.7 + ((Math.abs(hash) % 100) / 100) * 0.6 // Range: 0.7 to 1.3
}

export function EnergyOrb({
  size = "md",
  className,
  variant = "default",
  userId,
  intensity,
  showContainer = true,
  containerClassName,
}: EnergyOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    particles: THREE.Points
    animationId: number
  } | null>(null)

  // Determine actual size
  const actualSize = typeof size === "number" ? size : sizeMap[size]
  const containerSize = typeof size === "number" ? `${size}px` : containerSizeMap[size]

  // Determine variant and intensity
  const actualVariant = variant === "default" && userId ? getOrbVariant(userId) : variant
  const actualIntensity = intensity ?? (userId ? getOrbIntensity(userId) : 1.0)

  // Styling for container
  const backgroundStyles = {
    default: "bg-gradient-to-br from-emerald-900/40 via-slate-900/60 to-green-900/40",
    intense: "bg-gradient-to-br from-pink-900/60 via-slate-900/80 to-rose-900/60",
    subtle: "bg-gradient-to-br from-indigo-900/30 via-slate-900/50 to-teal-900/30",
    amber: "bg-gradient-to-br from-amber-900/50 via-slate-900/70 to-yellow-900/50",
  }

  const borderStyles = {
    default: "border-emerald-400/40 shadow-lg shadow-emerald-500/20",
    intense: "border-pink-400/60 shadow-xl shadow-pink-500/40",
    subtle: "border-indigo-400/30 shadow-md shadow-indigo-500/15",
    amber: "border-amber-400/50 shadow-lg shadow-amber-500/25",
  }

  const glowStyles = {
    default: "from-emerald-500/30 via-green-500/20 to-emerald-500/30",
    intense: "from-pink-500/50 via-rose-500/40 to-pink-500/50",
    subtle: "from-indigo-500/20 via-teal-500/15 to-purple-500/20",
    amber: "from-amber-500/40 via-yellow-500/30 to-amber-500/40",
  }

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(actualSize, actualSize)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const particleCount = actualVariant === "intense" ? 120 : actualVariant === "subtle" ? 40 : 80
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)

    const colorPalettes = {
      default: [
        new THREE.Color(0x22c55e), // Green 500
        new THREE.Color(0x16a34a), // Green 600
        new THREE.Color(0x15803d), // Green 700
        new THREE.Color(0x166534), // Green 800
        new THREE.Color(0x14532d), // Green 900
        new THREE.Color(0x052e16), // Green 950
      ],
      amber: [
        new THREE.Color(0xf59e0b), // Amber 500
        new THREE.Color(0xd97706), // Amber 600
        new THREE.Color(0xb45309), // Amber 700
        new THREE.Color(0x92400e), // Amber 800
        new THREE.Color(0x78350f), // Amber 900
        new THREE.Color(0x451a03), // Amber 950
      ],
      intense: [
        new THREE.Color(0xff69b4), // Hot Pink
        new THREE.Color(0xff1493), // Deep Pink
        new THREE.Color(0xdc2626), // Red 600
        new THREE.Color(0xb91c1c), // Red 700
        new THREE.Color(0x991b1b), // Red 800
        new THREE.Color(0x7f1d1d), // Red 900
      ],
      subtle: [
        new THREE.Color(0x6366f1), // Indigo
        new THREE.Color(0x14b8a6), // Teal
        new THREE.Color(0x8b5cf6), // Purple
        new THREE.Color(0x06b6d4), // Cyan
      ],
    }

    const colorPalette = colorPalettes[actualVariant]

    for (let i = 0; i < particleCount; i++) {
      const layer = Math.floor(i / (particleCount / 3))
      const baseRadius = 0.8 + layer * 0.4
      const radius = baseRadius + Math.random() * 0.6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const velocityMultiplier = (layer + 1) * 0.01 * actualIntensity
      velocities[i * 3] = (Math.random() - 0.5) * velocityMultiplier
      velocities[i * 3 + 1] = (Math.random() - 0.5) * velocityMultiplier
      velocities[i * 3 + 2] = (Math.random() - 0.5) * velocityMultiplier

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      const baseSizeMultiplier = actualVariant === "intense" ? 1.5 : actualVariant === "subtle" ? 0.8 : 1.0
      sizes[i] = (Math.random() * 4 + 2) * baseSizeMultiplier
    }

    // Create particle geometry
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")!

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, "rgba(255,255,255,0.8)")
    gradient.addColorStop(0.2, "rgba(255,255,255,0.6)")
    gradient.addColorStop(0.4, "rgba(255,255,255,0.4)")
    gradient.addColorStop(0.7, "rgba(255,255,255,0.2)")
    gradient.addColorStop(0.9, "rgba(255,255,255,0.05)")
    gradient.addColorStop(1, "rgba(255,255,255,0)")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)

    const imageData = ctx.getImageData(0, 0, 128, 128)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % 128
      const y = Math.floor(i / 4 / 128)
      const noise = (Math.random() - 0.5) * 0.3
      const turbulence = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 0.2
      data[i + 3] = Math.max(0, Math.min(255, data[i + 3] + (noise + turbulence) * 255))
    }
    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)

    const isLightVariant = actualVariant === "default" || actualVariant === "amber"
    const material = new THREE.PointsMaterial({
      map: texture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: isLightVariant ? 0.85 : actualVariant === "intense" ? 0.9 : actualVariant === "subtle" ? 0.5 : 0.7,
      size: actualVariant === "intense" ? 12 : actualVariant === "subtle" ? 6 : 10,
      sizeAttenuation: true,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    camera.position.z = 4

    let time = 0
    const LOOP_DURATION = Math.PI * 4

    const animate = () => {
      time = (time + 0.01 * actualIntensity) % LOOP_DURATION

      particles.rotation.y = (particles.rotation.y + 0.008 * actualIntensity) % (Math.PI * 2)
      particles.rotation.x = (particles.rotation.x + 0.003 * actualIntensity) % (Math.PI * 2)
      particles.rotation.z = (particles.rotation.z + 0.001 * actualIntensity) % (Math.PI * 2)

      const positions = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]

        const phase = i * 0.1
        const freq1 = time + phase
        const freq2 = time * 1.5 + phase * 0.5
        const freq3 = time * 0.7 + phase * 0.3

        positions[i * 3] += Math.sin(freq1) * 0.008 * actualIntensity
        positions[i * 3 + 1] += Math.cos(freq2) * 0.008 * actualIntensity
        positions[i * 3 + 2] += Math.sin(freq3) * 0.006 * actualIntensity

        const maxDistance = 2.5
        if (Math.abs(positions[i * 3]) > maxDistance) velocities[i * 3] *= -0.8
        if (Math.abs(positions[i * 3 + 1]) > maxDistance) velocities[i * 3 + 1] *= -0.8
        if (Math.abs(positions[i * 3 + 2]) > maxDistance) velocities[i * 3 + 2] *= -0.8
      }

      particles.geometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
      const animationId = requestAnimationFrame(animate)
      sceneRef.current = { scene, camera, renderer, particles, animationId }
    }

    animate()

    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
        geometry.dispose()
        material.dispose()
        texture.dispose()
      }
    }
  }, [actualSize, actualIntensity, actualVariant])

  const orbContent = (
    <div 
      ref={mountRef} 
      className="w-full h-full dynamic-size" 
      style={{
        '--dynamic-width': `${actualSize}px`,
        '--dynamic-height': `${actualSize}px`
      } as React.CSSProperties} 
    />
  )

  if (!showContainer) {
    return <div className={className}>{orbContent}</div>
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border backdrop-blur-sm",
        typeof size === "number" ? "dynamic-size" : "",
        backgroundStyles[actualVariant],
        borderStyles[actualVariant],
        typeof size === "string" ? containerSize : "",
        containerClassName,
        className,
      )}
      style={
        typeof size === "number" 
          ? ({
              '--dynamic-width': `${size}px`,
              '--dynamic-height': `${size}px`
            } as React.CSSProperties)
          : undefined
      }
    >
      {orbContent}
      
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r blur-sm opacity-60",
          `bg-gradient-to-r ${glowStyles[actualVariant]}`,
        )}
      />

      <div
        className={cn(
          "absolute inset-1 rounded-full bg-gradient-to-r blur-xs opacity-40", 
          `bg-gradient-to-r ${glowStyles[actualVariant]}`,
        )}
      />
    </div>
  )
}