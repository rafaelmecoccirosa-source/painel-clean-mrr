'use client'

// ──────────────────────────────────────────────────────────────
// Painel Clean — Hero "solar activation" animation (v2)
//
// Grade de painéis. Um FEIXE de luz diagonal viaja pela grade; ao
// chegar, os painéis sobem e ACENDEM (energizam) e a placa de vidro
// de cima reflete o sol; atrás fica verde "limpo", à frente escuro
// "poeira". Acabamento: vidro fotovoltaico (topo ≠ laterais), chão
// reflexivo, fundo com luz que viaja em sync, bloom (MSAA HDR),
// reinício sem flash, parallax no mouse.
//
// Drop-in: mesmo `export default` e mesmo container que a versão
// anterior — o Hero.tsx não precisa mudar. Props são opcionais.
// Deps já presentes no repo: three ^0.184 + @types/three.
// ──────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

type PaletteName = 'green' | 'teal' | 'gold' | 'aurora'

type SolarProps = {
  palette?: PaletteName
  speed?: number
  bloom?: number
  glow?: number
  density?: number
  height?: number
  parallax?: number
}

type Palette = {
  stops: number[]
  glow: number
  fog: number
  back0: string
  back1: string
}

// Shader chunk patcher (apenas os campos que tocamos)
type ShaderLike = {
  uniforms: Record<string, { value: unknown }>
  vertexShader: string
  fragmentShader: string
}

const PALETTES: Record<PaletteName, Palette> = {
  green:  { stops: [0x0a2418, 0x12492a, 0x238a42, 0x39c45a], glow: 0x6dffa0, fog: 0x020a06, back0: '#051509', back1: '#010503' },
  teal:   { stops: [0x07242a, 0x0d4651, 0x12909c, 0x28d6c4], glow: 0x5cf8e8, fog: 0x030f10, back0: '#051617', back1: '#010506' },
  gold:   { stops: [0x271907, 0x523710, 0x9c7a22, 0xe0b23d], glow: 0xffd884, fog: 0x0c0903, back0: '#180f04', back1: '#080401' },
  aurora: { stops: [0x0b1a2a, 0x143851, 0x2a6a8a, 0x39b0c4], glow: 0x7fe6ff, fog: 0x030810, back0: '#050f1e', back1: '#010408' },
}

const MOBILE_BP = 760

function lerpHex(a: number, b: number, t: number) {
  return new THREE.Color(a).lerp(new THREE.Color(b), t)
}
function paletteColor(stops: number[], t: number) {
  const n = stops.length - 1
  const i = Math.min(Math.floor(t * n), n - 1)
  return lerpHex(stops[i], stops[i + 1], t * n - i)
}
function radialTexture(hex: number) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256
  const g = cv.getContext('2d')!
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  const c = new THREE.Color(hex)
  const rgb = `${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0}`
  rg.addColorStop(0, `rgba(${rgb},0.55)`)
  rg.addColorStop(0.5, `rgba(${rgb},0.16)`)
  rg.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(cv)
}

export default function SolarAnimation({
  palette = 'green',
  speed = 0.7,
  bloom = 1.0,
  glow = 0.7,
  density = 17,
  height = 1,
  parallax = 1,
}: SolarProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const P = { palette, speed, bloom, glow, density, height, parallax }

    let W = container.offsetWidth, H = container.offsetHeight
    if (W === 0 || H === 0) { W = 1280; H = 720 }

    const scene = new THREE.Scene()
    let pal = PALETTES[P.palette] || PALETTES.green
    scene.fog = new THREE.FogExp2(pal.fog, 0.012)

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 400)
    const CAM_BASE = new THREE.Vector3()
    const CAM_LOOK = new THREE.Vector3()

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // WebGL unavailable — CSS gradient fallback already visible on container
    }
    renderer.setPixelRatio(dpr)
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.98
    container.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    scene.environmentIntensity = 0.35 // RoomEnvironment é um estúdio claro — segurar p/ não lavar os painéis

    // ── Backdrop com profundidade + LUZ QUE VIAJA (sync c/ feixe) ─
    const backUniforms = {
      c0: { value: new THREE.Color(pal.back0) },
      c1: { value: new THREE.Color(pal.back1) },
      cGlow: { value: new THREE.Color(pal.glow) },
      uHead: { value: 0.5 },
      uEnv: { value: 1 },
    }
    const backMat = new THREE.ShaderMaterial({
      uniforms: backUniforms, depthWrite: false, depthTest: false, fog: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: [
        'varying vec2 vUv; uniform vec3 c0; uniform vec3 c1; uniform vec3 cGlow; uniform float uHead; uniform float uEnv;',
        'void main(){',
        '  vec3 col = mix(c1, c0, smoothstep(0.0,1.0,vUv.y)) * 0.55;',
        '  float dx = vUv.x - uHead;',
        '  float band = exp(-dx*dx/(2.0*0.15*0.15));',
        '  float vert = smoothstep(1.0,0.05,vUv.y);',
        '  col += cGlow * band * vert * 0.30 * uEnv;',
        '  col += cGlow * exp(-dx*dx/(2.0*0.38*0.38)) * vert * 0.05 * uEnv;',
        '  col *= 1.0 - 0.30*smoothstep(0.4,1.0,abs(vUv.x-0.5)*2.0);',
        '  gl_FragColor = vec4(col,1.0);',
        '}',
      ].join('\n'),
    })
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1200, 700), backMat)
    backdrop.position.set(0, 60, -90); backdrop.renderOrder = -2
    scene.add(backdrop)

    // sol/halo grande que cruza o fundo junto com o feixe
    const sunMat = new THREE.SpriteMaterial({ map: radialTexture(pal.glow), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0.13, fog: false })
    const sun = new THREE.Sprite(sunMat)
    sun.scale.set(105, 105, 1); sun.position.set(0, 26, -68); sun.renderOrder = -1
    scene.add(sun)

    // ── Luzes ────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xbfe6cf, 0.14))
    const key = new THREE.DirectionalLight(0xffffff, 1.35)
    key.position.set(-14, 22, 10); scene.add(key)
    const rim = new THREE.DirectionalLight(0x39c45a, 0.9)
    rim.position.set(12, 8, -14); scene.add(rim)
    const fill = new THREE.DirectionalLight(0x8fd3ff, 0.18)
    fill.position.set(8, 6, 16); scene.add(fill)

    // ── Material: vidro fotovoltaico + glow emissivo (via shader) ─
    const glowUniform = { value: new THREE.Color(pal.glow) }
    const glowStrength = { value: 2.4 }
    function patchShader(shader: ShaderLike) {
      shader.uniforms.uGlow = glowUniform
      shader.uniforms.uGlowStrength = glowStrength
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aLit;\nattribute float aClean;\nvarying float vLit;\nvarying float vBase;\nvarying float vClean;\nvarying vec3 vNrm;\nvarying vec3 vLoc;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLit = aLit;\nvClean = aClean;\nvBase = position.y + 0.5;\nvNrm = normal;\nvLoc = position;')
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vLit;\nvarying float vBase;\nvarying float vClean;\nvarying vec3 vNrm;\nvarying vec3 vLoc;\nuniform vec3 uGlow;\nuniform float uGlowStrength;\nfloat _topness(){ return smoothstep(0.55,0.92,vNrm.y); }')
        // topo = vidro (mais liso e reflexivo); laterais = moldura fosca
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor *= mix(1.0, 0.4, _topness());')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.6, _topness());')
        .replace('#include <color_fragment>',
          '#include <color_fragment>\n' +
          // poeira: dessaturado/escuro e amarronzado (sujo) → vibrante quando limpa
          'float _lum = dot(diffuseColor.rgb, vec3(0.299,0.587,0.114));\n' +
          'vec3 _dirty = mix(vec3(_lum * 0.9), vec3(0.15,0.13,0.09), 0.6) * 0.6;\n' +
          'diffuseColor.rgb = mix(_dirty, diffuseColor.rgb * 1.08, clamp(vClean,0.0,1.0));\n' +
          // placa de cima: vidro azulado + grade de células fotovoltaicas
          'float _t = _topness();\n' +
          'vec2 _cell = vLoc.xz * 3.4;\n' +
          'vec2 _gg = abs(fract(_cell) - 0.5);\n' +
          'float _grid = smoothstep(0.37, 0.5, max(_gg.x, _gg.y));\n' +
          'vec3 _glass = diffuseColor.rgb * vec3(0.78, 0.94, 1.10);\n' +
          '_glass = mix(_glass, _glass * 0.34, _grid);\n' +
          'diffuseColor.rgb = mix(diffuseColor.rgb, _glass, _t);\n' +
          'diffuseColor.rgb *= mix(0.26, 1.0, clamp(vBase,0.0,1.0));')
        .replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\n' +
          'float _top = _topness();\n' +
          // energia VERDE subindo pelo corpo da barra
          'float _en = pow(clamp(vLit,0.0,1.6),1.4);\n' +
          'totalEmissiveRadiance += uGlow * _en * uGlowStrength * smoothstep(0.05,0.85,vBase) * (1.0 - 0.55*_top);\n' +
          // reflexo do SOL na placa de vidro de cima (branco, some quando o feixe passa)
          'float _gl = pow(clamp(vLit,0.0,1.0),2.2);\n' +
          'totalEmissiveRadiance += vec3(0.85,1.0,0.92) * _top * _gl * uGlowStrength * 1.4;')
    }
    const onBeforeCompile = (shader: unknown) => patchShader(shader as ShaderLike)

    let COLS = Math.round(P.density), ROWS = COLS
    const SEP = 1.0, BAR = 0.82
    const geo = new RoundedBoxGeometry(BAR, 1, BAR, 4, 0.15)
    const mat = new THREE.MeshPhysicalMaterial({ metalness: 0.22, roughness: 0.42, clearcoat: 0.32, clearcoatRoughness: 0.3, envMapIntensity: 0.45 })
    mat.onBeforeCompile = onBeforeCompile

    let mesh: THREE.InstancedMesh
    let refl: THREE.InstancedMesh
    let count = 0
    let litArr: Float32Array, litReflArr: Float32Array, actArr: Float32Array, cleanArr: Float32Array
    let centerBias: Float32Array, diagArr: Float32Array
    const dummy = new THREE.Object3D()
    const gridGroup = new THREE.Group()
    scene.add(gridGroup)

    // poça de luz na base
    const padMat = new THREE.MeshBasicMaterial({ map: radialTexture(pal.glow), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5, fog: true })
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), padMat)
    pad.rotation.x = -Math.PI / 2; pad.position.y = 0.015
    gridGroup.add(pad)

    function recolor() {
      let i = 0
      for (let ix = 0; ix < COLS; ix++) for (let iz = 0; iz < ROWS; iz++) {
        const col = paletteColor(pal.stops, diagArr[i]).multiplyScalar(0.7)
        mesh.setColorAt(i, col)
        refl.setColorAt(i, col.clone().multiplyScalar(0.55))
        i++
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      if (refl.instanceColor) refl.instanceColor.needsUpdate = true
    }

    function buildGrid() {
      if (mesh) { gridGroup.remove(mesh); mesh.geometry.dispose(); mesh.dispose() }
      if (refl) { gridGroup.remove(refl); refl.geometry.dispose(); refl.dispose() }
      count = COLS * ROWS
      litArr = new Float32Array(count)
      litReflArr = new Float32Array(count)
      actArr = new Float32Array(count)
      cleanArr = new Float32Array(count)
      centerBias = new Float32Array(count)
      diagArr = new Float32Array(count)

      mesh = new THREE.InstancedMesh(geo, mat, count)
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.geometry.setAttribute('aLit', new THREE.InstancedBufferAttribute(litArr, 1))
      mesh.geometry.setAttribute('aClean', new THREE.InstancedBufferAttribute(cleanArr, 1))

      const reflMat = mat.clone()
      reflMat.transparent = true; reflMat.opacity = 0.26; reflMat.depthWrite = false
      reflMat.onBeforeCompile = onBeforeCompile
      refl = new THREE.InstancedMesh(geo, reflMat, count)
      refl.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      refl.geometry.setAttribute('aLit', new THREE.InstancedBufferAttribute(litReflArr, 1))
      refl.geometry.setAttribute('aClean', new THREE.InstancedBufferAttribute(cleanArr, 1))

      let i = 0
      for (let ix = 0; ix < COLS; ix++) {
        for (let iz = 0; iz < ROWS; iz++) {
          const nx = ix / (COLS - 1), nz = iz / (ROWS - 1)
          const edge = Math.pow(Math.max(Math.abs(nx - 0.5) * 2, Math.abs(nz - 0.5) * 2), 1.6)
          centerBias[i] = 1 - edge * 0.42
          diagArr[i] = (ix + (ROWS - 1 - iz)) / (COLS + ROWS - 2)
          i++
        }
      }
      recolor()
      gridGroup.add(refl)
      gridGroup.add(mesh)
    }
    buildGrid()

    function gridPos(idx: number): [number, number] {
      const ix = Math.floor(idx / ROWS), iz = idx % ROWS
      return [(ix - COLS / 2 + 0.5) * SEP, (iz - ROWS / 2 + 0.5) * SEP]
    }

    // ── Composer + Bloom (MSAA HDR → bordas nítidas) ─────────────
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 2 })
    const composer = new EffectComposer(renderer, rt)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), 0.62, 0.45, 0.62)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())
    composer.setSize(W, H)

    // ── Parallax ─────────────────────────────────────────────────
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    function onMove(e: PointerEvent) {
      const r = container!.getBoundingClientRect()
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    // ── Layout responsivo ────────────────────────────────────────
    // FOV vertical de base, calibrado para um hero "alto" (aspect de
    // referência ~1.7). Em telas largas/curtas o aspect cresce e o FOV
    // horizontal abriria demais — puxando o sol e o backdrop pra dentro
    // do quadro e estourando tudo de branco. Então fechamos o FOV
    // vertical pra manter o enquadramento horizontal constante.
    const FOV_BASE = 40
    const ASPECT_REF = 1.7
    function applyFov() {
      const aspect = camera.aspect
      let fov = FOV_BASE
      if (aspect > ASPECT_REF) {
        const hHalf = Math.atan(Math.tan((FOV_BASE * Math.PI / 180) / 2) * ASPECT_REF)
        fov = (2 * Math.atan(Math.tan(hHalf) / aspect)) * 180 / Math.PI
      }
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    function layout() {
      if (W < MOBILE_BP) {
        // Retrato: lente mais aberta + câmera oblíqua (como o desktop, mas
        // enquadrada pra portrait). Grade puxada pra baixo do quadro pra
        // sobrar topo escuro p/ o texto.
        gridGroup.position.set(0, 0, -2)
        CAM_BASE.set(7, 6.8, 13)
        CAM_LOOK.set(0, 4.6, -2)
        camera.fov = 58
        camera.updateProjectionMatrix()
      } else {
        gridGroup.position.set(4.5, 0, -1.5)
        CAM_BASE.set(14.5, 13.5, 17.5)
        CAM_LOOK.set(0.5, 1.4, 0)
        applyFov()
      }
    }
    layout()

    function applyPalette() {
      const np = PALETTES[P.palette] || PALETTES.green
      if (np === pal) return
      pal = np
      glowUniform.value.set(pal.glow)
      scene.fog!.color.set(pal.fog)
      backUniforms.c0.value.set(pal.back0); backUniforms.c1.value.set(pal.back1); backUniforms.cGlow.value.set(pal.glow)
      sunMat.map = radialTexture(pal.glow); sunMat.needsUpdate = true
      padMat.map = radialTexture(pal.glow); padMat.needsUpdate = true
      recolor()
    }

    // ── Loop ─────────────────────────────────────────────────────
    let t = 0.4, last = performance.now()
    let raf = 0
    let running = false
    const MAXH = 4.3, BASEH = 0.1
    const SIG_H = 0.19, SIG_BEAM = 0.04
    const motion = reduce ? 0.7 : 1

    function frame(now: number) {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (Math.round(P.density) !== COLS) { COLS = ROWS = Math.round(P.density); buildGrid() }
      applyPalette()
      glowStrength.value = 1.9 * P.glow
      bloomPass.strength = 0.62 * P.bloom

      t += dt * P.speed * motion
      // ciclo 0..1; a crista viaja além das bordas (-0.6 → 1.6) e some off-grid antes do wrap
      const cyc = (t * 0.093) % 1
      const head = cyc * 2.2 - 0.6
      const headN = (head + 0.6) / 2.2
      const ramp = Math.max(0, Math.min(1, cyc / 0.12, (1 - cyc) / 0.12))
      const env = ramp * ramp * (3 - 2 * ramp)
      backUniforms.uHead.value = headN
      backUniforms.uEnv.value = env
      sun.position.x = -95 + headN * 190
      sunMat.opacity = 0.13 * env
      const phase = t * 0.9

      const litAttr = mesh.geometry.getAttribute('aLit') as THREE.InstancedBufferAttribute
      const reflAttr = refl.geometry.getAttribute('aLit') as THREE.InstancedBufferAttribute
      const cleanAttr = mesh.geometry.getAttribute('aClean') as THREE.InstancedBufferAttribute
      const cleanAttrR = refl.geometry.getAttribute('aClean') as THREE.InstancedBufferAttribute

      for (let i = 0; i < count; i++) {
        const iz = i % ROWS
        const dist = diagArr[i] - head
        const swell = Math.exp(-(dist * dist) / (2 * SIG_H * SIG_H))
        const beam = Math.exp(-(dist * dist) / (2 * SIG_BEAM * SIG_BEAM))

        const undul = 0.5 + 0.5 * Math.sin(diagArr[i] * Math.PI * 3.2 - phase + iz * 0.15)
        const hNorm = undul * 0.14 + swell
        actArr[i] += (hNorm - actArr[i]) * 0.16
        const a = actArr[i]

        // COR sujo→limpo persiste atrás do feixe (não mexe na altura)
        let tc: number
        if (dist < 0) tc = 1
        else if (dist < 0.22) tc = 0
        else tc = cleanArr[i]
        cleanArr[i] += (tc - cleanArr[i]) * (tc > cleanArr[i] ? 0.1 : 0.05)

        const shimmer = cleanArr[i] * (0.28 + 0.06 * Math.sin(t * 2.2 + diagArr[i] * 24 + i))
        const target = Math.max(beam * env, shimmer)
        litArr[i] += (target - litArr[i]) * 0.3

        const h = (BASEH + a * MAXH * centerBias[i]) * P.height
        const [x, z] = gridPos(i)

        dummy.position.set(x, h / 2, z)
        dummy.scale.set(1, h, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        dummy.position.set(x, -h / 2 - 0.05, z)
        dummy.scale.set(1, -h, 1)
        dummy.updateMatrix()
        refl.setMatrixAt(i, dummy.matrix)
        litReflArr[i] = litArr[i] * 0.6
      }
      mesh.instanceMatrix.needsUpdate = true
      refl.instanceMatrix.needsUpdate = true
      litAttr.needsUpdate = true
      reflAttr.needsUpdate = true
      cleanAttr.needsUpdate = true
      cleanAttrR.needsUpdate = true

      const amt = P.parallax
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      camera.position.set(
        CAM_BASE.x + pointer.x * 1.6 * amt,
        CAM_BASE.y - pointer.y * 1.0 * amt,
        CAM_BASE.z,
      )
      camera.lookAt(CAM_LOOK)

      composer.render()
    }

    // Só roda quando o hero está visível e a aba ativa — evita gastar
    // GPU/bateria com a animação fora da tela.
    let onScreen = true
    function start() {
      if (running || !onScreen || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    const io = new IntersectionObserver(
      ([e]) => { onScreen = e.isIntersecting; if (onScreen) start(); else stop() },
      { threshold: 0 },
    )
    io.observe(container)
    function onVisibility() { if (document.hidden) stop(); else start() }
    document.addEventListener('visibilitychange', onVisibility)
    start()

    // ── Resize ───────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = container.offsetWidth, h = container.offsetHeight
      if (!w || !h) return
      W = w; H = h
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h); composer.setSize(w, h)
      layout()
    })
    ro.observe(container)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onMove)
      renderer.dispose(); geo.dispose(); pmrem.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [palette, speed, bloom, glow, density, height, parallax])

  const pal = PALETTES[palette] || PALETTES.green
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 62% 38%, ${pal.back0} 0%, ${pal.back1} 100%)`,
      }}
    />
  )
}
