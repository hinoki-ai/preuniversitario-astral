"use client"

import React, { useRef, useEffect } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

interface EnergyOrbProps {
  // Size options
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string

  // visual variants;
  variant?: "default" | "místico" | "guerrero" | "arcano" | "cristal" | "intense" | "subtle"

  // user-specific customization;
  userId?: string

  // advanced options;
  intensity?: number;
  showContainer?: boolean;
  containerClassName?: string
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64
}

const containerSizeMap = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
}

function getOrbVariant(userId?: string): "default" | "místico" | "guerrero" | "arcano" | "cristal" | "intense" | "subtle" {
  if (!userId) return "default"
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  const variants = ["default", "místico", "guerrero", "arcano", "cristal", "intense", "subtle"] as const
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
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    animationId: number
  } | null>(null)

  // Determine actual size
  const actualSize = typeof size === "number" ? size : sizeMap[size]
  const containerSize = typeof size === "number" ? `${size}px` : containerSizeMap[size]

  // Determine variant and intensity
  const actualVariant = variant === "default" && userId ? getOrbVariant(userId) : variant
  const actualIntensity = intensity ?? (userId ? getOrbIntensity(userId) : 1.0)

  // Enhanced styling with medieval magical palettes
  const backgroundStyles = {
    default: "bg-gradient-to-br from-purple-900/60 via-slate-900/80 to-indigo-900/60",
    místico: "bg-gradient-to-br from-violet-800/70 via-slate-900/85 to-purple-800/70",
    guerrero: "bg-gradient-to-br from-red-800/65 via-slate-900/80 to-orange-800/65",
    arcano: "bg-gradient-to-br from-cyan-800/60 via-slate-900/75 to-blue-800/60",
    cristal: "bg-gradient-to-br from-emerald-800/55 via-slate-900/70 to-teal-800/55",
    intense: "bg-gradient-to-br from-red-900/80 via-slate-900/90 to-orange-900/80",
    subtle: "bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-indigo-900/40",
  }

  const borderStyles = {
    default: "border-purple-300/60 shadow-xl shadow-purple-400/30",
    místico: "border-violet-300/70 shadow-xl shadow-violet-400/40",
    guerrero: "border-red-300/65 shadow-xl shadow-red-400/35",
    arcano: "border-cyan-300/60 shadow-xl shadow-cyan-400/30",
    cristal: "border-emerald-300/55 shadow-xl shadow-emerald-400/30",
    intense: "border-red-400/80 shadow-xl shadow-red-500/40",
    subtle: "border-blue-300/40 shadow-xl shadow-blue-400/20",
  }

  const glowStyles = {
    default: "from-purple-400/50 via-indigo-400/35 to-violet-400/50",
    místico: "from-violet-400/60 via-purple-400/45 to-fuchsia-400/60",
    guerrero: "from-red-400/55 via-orange-400/40 to-amber-400/55",
    arcano: "from-cyan-400/45 via-blue-400/30 to-indigo-400/45",
    cristal: "from-emerald-400/50 via-teal-400/35 to-cyan-400/50",
    intense: "from-red-500/70 via-orange-500/55 to-amber-500/70",
    subtle: "from-blue-400/30 via-indigo-400/25 to-violet-400/30",
  }

  useEffect(() => {
    if (!mountRef.current) return

    const mountElement = mountRef.current

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(actualSize, actualSize)
    renderer.setClearColor(0x000000, 0)
    mountElement.appendChild(renderer.domElement)

    const particleCount = actualVariant === "guerrero" ? 120 :
                         actualVariant === "místico" ? 40 :
                         actualVariant === "intense" ? 150 :
                         actualVariant === "subtle" ? 60 : 80
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)

    const colorPalettes = {
      default: [
        new THREE.Color(0x8b5cf6), // Purple 400 - Medium purple
        new THREE.Color(0x7c3aed), // Violet 500 - Medium violet
        new THREE.Color(0x6d28d9), // Purple 600 - Dark purple
        new THREE.Color(0x6366f1), // Indigo 400 - Medium indigo
        new THREE.Color(0x4f46e5), // Indigo 500 - Medium indigo
        new THREE.Color(0x4338ca), // Indigo 600 - Dark indigo
        new THREE.Color(0x8b5cf6), // Purple 400 - Light purple
        new THREE.Color(0x7c3aed), // Violet 500 - Light violet
      ],
      místico: [
        new THREE.Color(0xc4b5fd), // Violet 300 - Light pastel violet
        new THREE.Color(0xa78bfa), // Violet 400 - Medium violet
        new THREE.Color(0x7c3aed), // Violet 600 - Dark violet
        new THREE.Color(0xd8b4fe), // Purple 300 - Light purple
        new THREE.Color(0xc084fc), // Purple 400 - Medium purple
        new THREE.Color(0x9333ea), // Purple 500 - Medium purple
        new THREE.Color(0xe879f9), // Fuchsia 400 - Bright fuchsia
        new THREE.Color(0xc026d3), // Fuchsia 600 - Dark fuchsia
      ],
      guerrero: [
        new THREE.Color(0xf87171), // Red 400 - Medium red
        new THREE.Color(0xef4444), // Red 500 - Medium red
        new THREE.Color(0xdc2626), // Red 600 - Dark red
        new THREE.Color(0xfb923c), // Orange 400 - Medium orange
        new THREE.Color(0xf97316), // Orange 500 - Medium orange
        new THREE.Color(0xea580c), // Orange 600 - Dark orange
        new THREE.Color(0xfbbf24), // Amber 400 - Bright amber
        new THREE.Color(0xf59e0b), // Amber 500 - Medium amber
      ],
      arcano: [
        new THREE.Color(0x67e8f9), // Cyan 300 - Light cyan
        new THREE.Color(0x22d3ee), // Cyan 400 - Medium cyan
        new THREE.Color(0x0891b2), // Cyan 600 - Dark cyan
        new THREE.Color(0x60a5fa), // Blue 400 - Medium blue
        new THREE.Color(0x3b82f6), // Blue 500 - Medium blue
        new THREE.Color(0x2563eb), // Blue 600 - Dark blue
        new THREE.Color(0x5eead4), // Teal 300 - Light teal
        new THREE.Color(0x2dd4bf), // Teal 400 - Medium teal
      ],
      cristal: [
        new THREE.Color(0x6ee7b7), // Emerald 300 - Light emerald
        new THREE.Color(0x34d399), // Emerald 400 - Medium emerald
        new THREE.Color(0x10b981), // Emerald 500 - Medium emerald
        new THREE.Color(0x5eead4), // Teal 300 - Light teal
        new THREE.Color(0x2dd4bf), // Teal 400 - Medium teal
        new THREE.Color(0x0d9488), // Teal 600 - Dark teal
        new THREE.Color(0x7dd3fc), // Sky 300 - Light sky
        new THREE.Color(0x38bdf8), // Sky 400 - Medium sky
      ],
      intense: [
        new THREE.Color(0xf87171), // Red 400 - Medium red
        new THREE.Color(0xef4444), // Red 500 - Medium red
        new THREE.Color(0xdc2626), // Red 600 - Dark red
        new THREE.Color(0xfb923c), // Orange 400 - Medium orange
        new THREE.Color(0xf97316), // Orange 500 - Medium orange
        new THREE.Color(0xea580c), // Orange 600 - Dark orange
        new THREE.Color(0xfbbf24), // Amber 400 - Bright amber
        new THREE.Color(0xf59e0b), // Amber 500 - Medium amber
      ],
      subtle: [
        new THREE.Color(0x60a5fa), // Blue 400 - Medium blue
        new THREE.Color(0x3b82f6), // Blue 500 - Medium blue
        new THREE.Color(0x2563eb), // Blue 600 - Dark blue
        new THREE.Color(0x8b5cf6), // Violet 400 - Medium violet
        new THREE.Color(0x7c3aed), // Violet 500 - Medium violet
        new THREE.Color(0x6d28d9), // Violet 600 - Dark violet
        new THREE.Color(0xa78bfa), // Purple 400 - Medium purple
        new THREE.Color(0x9333ea), // Purple 500 - Medium purple
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

    // Enhanced particle texture with dual-color smoke effect and thin edges
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")!
    const center = 128

    // Clear the canvas with transparency
    ctx.clearRect(0, 0, 256, 256)

    // Create the main energy core (bright center)
    const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, 40)
    coreGradient.addColorStop(0, "rgba(255,255,255,1.0)")
    coreGradient.addColorStop(0.3, "rgba(255,255,255,0.9)")
    coreGradient.addColorStop(0.6, "rgba(255,255,255,0.6)")
    coreGradient.addColorStop(1, "rgba(255,255,255,0)")
    
    ctx.fillStyle = coreGradient
    ctx.fillRect(0, 0, 256, 256)

    // Create the outer smoke/energy layer with contrast
    const smokeGradient = ctx.createRadialGradient(center, center, 30, center, center, 120)
    smokeGradient.addColorStop(0, "rgba(255,255,255,0.0)")
    smokeGradient.addColorStop(0.1, "rgba(200,200,200,0.4)")
    smokeGradient.addColorStop(0.4, "rgba(160,160,160,0.3)")
    smokeGradient.addColorStop(0.7, "rgba(120,120,120,0.2)")
    smokeGradient.addColorStop(0.85, "rgba(80,80,80,0.15)")  // Dark thin edge
    smokeGradient.addColorStop(0.95, "rgba(40,40,40,0.1)")   // Very thin dark edge
    smokeGradient.addColorStop(1, "rgba(0,0,0,0)")

    ctx.globalCompositeOperation = "multiply"
    ctx.fillStyle = smokeGradient
    ctx.fillRect(0, 0, 256, 256)
    ctx.globalCompositeOperation = "source-over"

    // Add thin bright edge for extra contrast and glow
    const edgeGradient = ctx.createRadialGradient(center, center, 100, center, center, 128)
    edgeGradient.addColorStop(0, "rgba(255,255,255,0)")
    edgeGradient.addColorStop(0.8, "rgba(255,255,255,0)")
    edgeGradient.addColorStop(0.9, "rgba(255,255,255,0.3)")   // Bright thin edge
    edgeGradient.addColorStop(0.95, "rgba(255,255,255,0.2)")
    edgeGradient.addColorStop(1, "rgba(255,255,255,0)")

    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = edgeGradient
    ctx.fillRect(0, 0, 256, 256)
    ctx.globalCompositeOperation = "source-over"

    // Add noise and turbulence for organic energy feel
    const imageData = ctx.getImageData(0, 0, 256, 256)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % 256
      const y = Math.floor(i / 4 / 256)
      const centerDist = Math.sqrt((x - center) ** 2 + (y - center) ** 2) / center
      
      // More sophisticated noise pattern
      const noise = (Math.sin(x * 0.02) * Math.cos(y * 0.02) + 
                     Math.sin(x * 0.05) * Math.cos(y * 0.05) * 0.5 +
                     Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.25) * 0.15
      
      // Apply noise more subtly, preserving the dual-color structure
      const alpha = data[i + 3]
      if (alpha > 0) {
        const noiseEffect = noise * (1 - centerDist) * 255
        data[i + 3] = Math.max(0, Math.min(255, alpha + noiseEffect))
      }
    }
    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    // Enhanced material properties for better glow and contrast
    const material = new THREE.PointsMaterial({
      map: texture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: actualVariant === "intense" ? 0.95 :
               actualVariant === "subtle" ? 0.65 :
               actualVariant === "cristal" ? 0.88 : 0.82,
      size: actualVariant === "intense" ? 16 :
            actualVariant === "subtle" ? 8 :
            actualVariant === "cristal" ? 14 : 12,
      sizeAttenuation: true,
      depthWrite: false,
      alphaTest: 0.001, // Helps with edge rendering
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    camera.position.z = 4

    let time = 0
    const loopDuration = Math.PI * 6  // Longer loop for more variation

    // Enhanced animation with multiple movement layers
    const animate = () => {
      time = (time + 0.012 * actualIntensity) % loopDuration

      // More sophisticated rotation with varying speeds per axis
      particles.rotation.y = (particles.rotation.y + 0.01 * actualIntensity) % (Math.PI * 2)
      particles.rotation.x = (particles.rotation.x + 0.004 * actualIntensity) % (Math.PI * 2)
      particles.rotation.z = (particles.rotation.z + 0.002 * actualIntensity) % (Math.PI * 2)

      const positions = particles.geometry.attributes.position.array as Float32Array
      const sizesAttribute = particles.geometry.attributes.size.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const layer = Math.floor(i / (particleCount / 3))
        const layerIntensity = (layer + 1) * 0.3

        // Base velocity movement
        positions[i * 3] += velocities[i * 3] * actualIntensity
        positions[i * 3 + 1] += velocities[i * 3 + 1] * actualIntensity
        positions[i * 3 + 2] += velocities[i * 3 + 2] * actualIntensity

        const phase = i * 0.08
        const particleTime = time + phase

        // Multiple frequency layers for complex movement
        const freq1 = particleTime + layer * 0.5
        const freq2 = particleTime * 1.8 + phase * 0.7
        const freq3 = particleTime * 0.6 + phase * 0.4
        const freq4 = particleTime * 2.3 + phase * 1.1  // New frequency for complexity

        // Enhanced oscillation with layered frequencies
        const oscillationX = Math.sin(freq1) * 0.01 + Math.sin(freq4) * 0.004
        const oscillationY = Math.cos(freq2) * 0.01 + Math.cos(freq4 * 0.7) * 0.004
        const oscillationZ = Math.sin(freq3) * 0.008 + Math.sin(freq4 * 1.3) * 0.003

        positions[i * 3] += oscillationX * layerIntensity * actualIntensity
        positions[i * 3 + 1] += oscillationY * layerIntensity * actualIntensity
        positions[i * 3 + 2] += oscillationZ * layerIntensity * actualIntensity

        // Pulsing effect for particles sizes (breathing energy effect)
        const pulsePhase = time * 2.5 + i * 0.1
        const pulseFactor = 1.0 + Math.sin(pulsePhase) * 0.3
        const originalSize = (Math.random() * 4 + 2) * (actualVariant === "intense" ? 1.5 : actualVariant === "subtle" ? 0.8 : 1.0)
        sizesAttribute[i] = originalSize * pulseFactor

        // Spiral motion for outer particles
        if (layer === 2) {
          const spiralTime = time * 0.8 + i * 0.15
          const radius = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2)
          const spiralForce = 0.002 * actualIntensity
          
          positions[i * 3] += Math.cos(spiralTime) * spiralForce
          positions[i * 3 + 1] += Math.sin(spiralTime) * spiralForce
        }

        // Improved boundary handling with elastic collision
        const maxDistance = 2.8
        const damping = 0.85

        if (Math.abs(positions[i * 3]) > maxDistance) {
          velocities[i * 3] *= -damping
          positions[i * 3] = Math.sign(positions[i * 3]) * maxDistance
        }
        if (Math.abs(positions[i * 3 + 1]) > maxDistance) {
          velocities[i * 3 + 1] *= -damping
          positions[i * 3 + 1] = Math.sign(positions[i * 3 + 1]) * maxDistance
        }
        if (Math.abs(positions[i * 3 + 2]) > maxDistance) {
          velocities[i * 3 + 2] *= -damping
          positions[i * 3 + 2] = Math.sign(positions[i * 3 + 2]) * maxDistance
        }
      }

      particles.geometry.attributes.position.needsUpdate = true
      particles.geometry.attributes.size.needsUpdate = true

      renderer.render(scene, camera)
      const animationId = requestAnimationFrame(animate)
      sceneRef.current = { scene, camera, renderer, particles, animationId }
    }

    animate()

    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)
        if (mountElement && renderer.domElement) {
          mountElement.removeChild(renderer.domElement)
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
      className={cn(
        "w-full h-full",
        typeof size === "number" ? `orb-size-${actualSize}` : ""
      )}
    />
  )

  if (!showContainer) {
    return <div className={className}>{orbContent}</div>
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border backdrop-blur-sm",
        backgroundStyles[actualVariant],
        borderStyles[actualVariant],
        typeof size === "string" ? containerSize : `orb-size-${size}`,
        containerClassName,
        className,
      )}
    >
      {orbContent}
      
      {/* Outer glow layer - largest blur for ambient light */}
      <div
        className={cn(
          "absolute -inset-4 rounded-full blur-2xl opacity-30 animate-pulse",
          `bg-gradient-to-r ${glowStyles[actualVariant]}`,
        )}
        data-animation-duration={
          actualVariant === "intense" ? "1.5s" :
          actualVariant === "subtle" ? "4s" :
          actualVariant === "cristal" ? "2.5s" : "3s"
        }
      />

      {/* Medium glow layer - mid-range bloom */}
      <div
        className={cn(
          "absolute -inset-2 rounded-full blur-lg opacity-50",
          `bg-gradient-to-r ${glowStyles[actualVariant]}`,
        )}
      />

      {/* Inner glow layer - close to surface */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-sm opacity-70",
          `bg-gradient-to-r ${glowStyles[actualVariant]}`,
        )}
      />

      {/* Core highlight - subtle inner glow */}
      <div
        className={cn(
          "absolute inset-1 rounded-full blur-xs opacity-40", 
          `bg-gradient-to-r ${glowStyles[actualVariant]}`,
        )}
      />

      {/* Pulsing energy ring - for extra visual effect */}
      <div
        className={cn(
          "absolute -inset-1 rounded-full border-2 border-opacity-20 animate-ping",
          actualVariant === "default" ? "border-cyan-300" :
          actualVariant === "intense" ? "border-rose-300" :
          actualVariant === "subtle" ? "border-violet-300" :
          actualVariant === "cristal" ? "border-emerald-300" :
          "border-sky-300"
        )}
        data-animation-duration={
          actualVariant === "intense" ? "1.5s" : 
          actualVariant === "subtle" ? "3s" : "2s"
        }
      />
    </div>
  )
}