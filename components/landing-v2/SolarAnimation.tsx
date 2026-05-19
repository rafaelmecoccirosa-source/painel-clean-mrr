'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function SolarAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const W = container.offsetWidth
    const H = container.offsetHeight
    if (W === 0 || H === 0) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W/H, 1, 10000)
    camera.position.set(40, 490, 660)
    camera.lookAt(40, 50, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    function makeRoundedBox(w: number, d: number, r: number) {
      const s = new THREE.Shape()
      s.moveTo(-w/2+r, -d/2)
      s.lineTo(w/2-r, -d/2)
      s.quadraticCurveTo(w/2, -d/2, w/2, -d/2+r)
      s.lineTo(w/2, d/2-r)
      s.quadraticCurveTo(w/2, d/2, w/2-r, d/2)
      s.lineTo(-w/2+r, d/2)
      s.quadraticCurveTo(-w/2, d/2, -w/2, d/2-r)
      s.lineTo(-w/2, -d/2+r)
      s.quadraticCurveTo(-w/2, -d/2, -w/2+r, -d/2)
      return new THREE.ExtrudeGeometry(s, {
        depth: 1,
        bevelEnabled: true,
        bevelSize: r*0.3,
        bevelThickness: r*0.3,
        bevelSegments: 3,
      })
    }

    const PALETTE = [
      new THREE.Color(0x0C2B1C),
      new THREE.Color(0x1C5C32),
      new THREE.Color(0x3DC45A),
      new THREE.Color(0x7FE89A),
      new THREE.Color(0xA8EED4),
    ]

    function paletteColor(t: number) {
      const n = PALETTE.length - 1
      const i = Math.min(Math.floor(t * n), n-1)
      const f = t * n - i
      return PALETTE[i].clone().lerp(PALETTE[i+1], f)
    }

    const COLS = 16, ROWS = 16, SEP = 36, BASE_H = 3
    const geoCache: Record<number, THREE.ExtrudeGeometry> = {}

    function getGeo(sz: number) {
      const k = Math.round(sz)
      if (!geoCache[k]) geoCache[k] = makeRoundedBox(sz, sz, sz*0.22)
      return geoCache[k]
    }

    function blockSize(ix: number, iz: number) {
      const bx = Math.min(ix, COLS-1-ix)
      const bz = Math.min(iz, ROWS-1-iz)
      const b = Math.min(bx, bz)
      if (b === 0) return 12
      if (b === 1) return 19
      return 26
    }

    const bars: {
      mesh: THREE.Mesh
      ix: number; iz: number
      lit: number
      baseCol: THREE.Color
      baseEmis: THREE.Color
    }[] = []

    for (let ix = 0; ix < COLS; ix++) {
      for (let iz = 0; iz < ROWS; iz++) {
        const sz = blockSize(ix, iz)
        const geo = getGeo(sz)
        const diag = (ix + iz) / (COLS + ROWS - 2)
        const baseCol = paletteColor(diag)
        const baseEmis = baseCol.clone().multiplyScalar(0.3)
        const mat = new THREE.MeshPhongMaterial({
          color: baseCol.clone(),
          emissive: baseEmis.clone(),
          shininess: 70,
          specular: new THREE.Color(0xaaffcc),
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.rotation.x = -Math.PI / 2
        const x = (ix - COLS/2 + 0.5) * SEP
        const z = (iz - ROWS/2 + 0.5) * SEP
        mesh.position.set(x, BASE_H/2, z)
        mesh.scale.z = BASE_H
        scene.add(mesh)
        bars.push({ mesh, ix, iz, lit: 0, baseCol: baseCol.clone(), baseEmis: baseEmis.clone() })
      }
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.28))
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.1)
    dir1.position.set(200, 600, 150)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0x3DC45A, 0.3)
    dir2.position.set(-100, 200, -100)
    scene.add(dir2)

    let t = 0, paused = false, pauseTimer = 0
    let lastTime = performance.now()
    let animId: number

    function animate(now: number) {
      animId = requestAnimationFrame(animate)
      const delta = Math.min((now - lastTime)/1000, 0.05)
      lastTime = now

      if (paused) {
        pauseTimer += delta
        if (pauseTimer >= 1.5) { paused = false; pauseTimer = 0; t = 0 }
      } else {
        t += 0.004
        if (t >= 1) { paused = true; t = 1 }
      }

      const wavePos = t * (COLS + ROWS)

      for (const bar of bars) {
        const diag = bar.ix + bar.iz
        const dist = wavePos - diag
        const WW = 5
        let wave = 0
        if (dist > 0 && dist < WW) wave = Math.sin((dist/WW)*Math.PI)
        else if (dist >= WW) wave = Math.max(0, 1-(dist-WW)*0.09)*0.22
        bar.lit += (wave - bar.lit) * 0.10

        const targetH = BASE_H + bar.lit * 72
        const newH = bar.mesh.scale.z + (targetH - bar.mesh.scale.z) * 0.10
        bar.mesh.scale.z = newH
        bar.mesh.position.y = newH / 2

        const em = bar.baseEmis.clone().lerp(bar.baseCol, bar.lit * 0.55)
        ;(bar.mesh.material as THREE.MeshPhongMaterial).emissive.copy(em)
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    const ro = new ResizeObserver(() => {
      const W2 = container.offsetWidth
      const H2 = container.offsetHeight
      camera.aspect = W2/H2
      camera.updateProjectionMatrix()
      renderer.setSize(W2, H2)
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      Object.values(geoCache).forEach(g => g.dispose())
    }
  }, [])

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
}
