'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 50

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Particles - more visible
    const particleCount = 250
    const positions = new Float32Array(particleCount * 3)
    const velocities: THREE.Vector3[] = []
    const spread = 100

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01
      ))
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Custom shader material for glowing particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x4ade80) },
      },
      vertexShader: `
        uniform float uTime;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.5 + position.x * 0.1) * 0.5;
          pos.x += cos(uTime * 0.3 + position.y * 0.1) * 0.5;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = 4.5 * (50.0 / -mvPosition.z);

          vAlpha = 0.6 + 0.4 * sin(uTime + position.x * 0.5);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Connection lines
    const lineGeometry = new THREE.BufferGeometry()
    const linePositions = new Float32Array(particleCount * particleCount * 6)
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    })

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    // Mouse interaction
    const mouse = new THREE.Vector2(0, 0)
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / width - 0.5) * 2
      mouse.y = -(event.clientY / height - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation
    const clock = new THREE.Clock()

    const animate = () => {
      const time = clock.getElapsedTime()
      material.uniforms.uTime.value = time

      // Update particle positions
      const posArray = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x
        posArray[i * 3 + 1] += velocities[i].y
        posArray[i * 3 + 2] += velocities[i].z

        // Boundary check
        if (Math.abs(posArray[i * 3]) > spread / 2) velocities[i].x *= -1
        if (Math.abs(posArray[i * 3 + 1]) > spread / 2) velocities[i].y *= -1
        if (Math.abs(posArray[i * 3 + 2]) > spread / 4) velocities[i].z *= -1
      }
      geometry.attributes.position.needsUpdate = true

      // Update connection lines
      const linePos = lineGeometry.attributes.position.array as Float32Array
      let lineIndex = 0
      const maxDistance = 20

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArray[i * 3] - posArray[j * 3]
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1]
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < maxDistance && lineIndex < linePositions.length - 6) {
            linePos[lineIndex++] = posArray[i * 3]
            linePos[lineIndex++] = posArray[i * 3 + 1]
            linePos[lineIndex++] = posArray[i * 3 + 2]
            linePos[lineIndex++] = posArray[j * 3]
            linePos[lineIndex++] = posArray[j * 3 + 1]
            linePos[lineIndex++] = posArray[j * 3 + 2]
          }
        }
      }

      // Clear remaining lines
      for (let i = lineIndex; i < linePositions.length; i++) {
        linePos[i] = 0
      }
      lineGeometry.attributes.position.needsUpdate = true

      // Camera follows mouse slightly
      camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02
      camera.position.y += (mouse.y * 5 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement)
      }
      geometry.dispose()
      material.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  )
}
