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
    const camera = new THREE.PerspectiveCamera(45, W/H, 1, 10000)
    camera.position.set(-180, 420, 620)
    camera.lookAt(-60, 20, -40)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    function makeRoundedBox(w: number, d: number, r: number) {
      const s = new THREE.Shape()
      s.moveTo(-w/2+r,-d/2); s.lineTo(w/2-r,-d/2)
      s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r)
      s.lineTo(w/2,d/2-r); s.quadraticCurveTo(w/2,d/2,w/2-r,d/2)
      s.lineTo(-w/2+r,d/2); s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r)
      s.lineTo(-w/2,-d/2+r); s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2)
      return new THREE.ExtrudeGeometry(s, {
        depth:1, bevelEnabled:true,
        bevelSize:r*0.28, bevelThickness:r*0.28, bevelSegments:4
      })
    }

    const PALETTE = [
      new THREE.Color(0x0C2B1C),
      new THREE.Color(0x174D2A),
      new THREE.Color(0x2A8A42),
      new THREE.Color(0x3DC45A),
      new THREE.Color(0x7FE89A),
      new THREE.Color(0xA8EED4),
    ]
    function palColor(t: number) {
      const n = PALETTE.length-1
      const i = Math.min(Math.floor(t*n),n-1)
      return PALETTE[i].clone().lerp(PALETTE[i+1],t*n-i)
    }

    const COLS=22, ROWS=22, SEP=26, BASE_H=2
    const geoCache: Record<number, THREE.ExtrudeGeometry> = {}
    function getGeo(sz: number) {
      const k=Math.round(sz)
      if(!geoCache[k]) geoCache[k]=makeRoundedBox(sz,sz,sz*0.26)
      return geoCache[k]
    }

    function blockSize(ix: number, iz: number) {
      const nx=ix/(COLS-1), nz=iz/(ROWS-1)
      const dx=Math.abs(nx-0.5)*2, dz=Math.abs(nz-0.5)*2
      const edge=Math.pow(Math.max(dx,dz),1.6)
      return Math.round(20-edge*10)
    }

    const bars: {
      mesh: THREE.Mesh
      ix: number; iz: number
      lit: number
      baseCol: THREE.Color
      baseEmis: THREE.Color
      sz: number
    }[] = []

    for(let ix=0;ix<COLS;ix++){
      for(let iz=0;iz<ROWS;iz++){
        const sz=blockSize(ix,iz)
        const geo=getGeo(sz)
        const diag=((COLS-1-ix)+iz)/(COLS+ROWS-2)
        const baseCol=palColor(diag)
        const baseEmis=baseCol.clone().multiplyScalar(0.28)
        const mat=new THREE.MeshPhongMaterial({
          color:baseCol.clone(), emissive:baseEmis.clone(),
          shininess:80, specular:new THREE.Color(0x88ffbb),
        })
        const mesh=new THREE.Mesh(geo,mat)
        mesh.rotation.x=-Math.PI/2
        mesh.position.set((ix-COLS/2+0.5)*SEP, BASE_H/2, (iz-ROWS/2+0.5)*SEP)
        mesh.scale.z=BASE_H
        scene.add(mesh)
        bars.push({mesh,ix,iz,lit:0,baseCol:baseCol.clone(),baseEmis:baseEmis.clone(),sz})
      }
    }

    scene.add(new THREE.AmbientLight(0xffffff,0.25))
    const d1=new THREE.DirectionalLight(0xffffff,1.0)
    d1.position.set(-300,600,200); scene.add(d1)
    const d2=new THREE.DirectionalLight(0x3DC45A,0.28)
    d2.position.set(150,250,-100); scene.add(d2)

    let t=0, paused=false, pauseTimer=0
    let lastTime=performance.now()
    let animId: number

    function animate(now: number) {
      animId=requestAnimationFrame(animate)
      const delta=Math.min((now-lastTime)/1000,0.05)
      lastTime=now

      if(paused){
        pauseTimer+=delta
        if(pauseTimer>=2.0){paused=false;pauseTimer=0;t=0}
        for(const bar of bars){
          bar.lit+=(0-bar.lit)*0.06
          const newH=bar.mesh.scale.z+(BASE_H-bar.mesh.scale.z)*0.06
          bar.mesh.scale.z=newH
          bar.mesh.position.y=newH/2
        }
        renderer.render(scene,camera)
        return
      }

      t+=0.003
      if(t>=1){paused=true;t=1}

      const wavePos=t*(COLS+ROWS)

      for(const bar of bars){
        const diag=(COLS-1-bar.ix)+bar.iz
        const dist=wavePos-diag
        const WW=6
        let wave=0
        if(dist>0&&dist<WW) wave=Math.sin((dist/WW)*Math.PI)
        else if(dist>=WW) wave=Math.max(0,1-(dist-WW)*0.07)*0.18
        bar.lit+=(wave-bar.lit)*0.09

        const scale=bar.sz/20
        const targetH=BASE_H+bar.lit*65*scale
        const newH=bar.mesh.scale.z+(targetH-bar.mesh.scale.z)*0.09
        bar.mesh.scale.z=newH

        const sineY=bar.lit>0.05?Math.sin((diag*0.35)+t*Math.PI*5)*0.015*newH:0
        bar.mesh.position.y=newH/2+sineY

        const em=bar.baseEmis.clone().lerp(bar.baseCol,bar.lit*0.5)
        ;(bar.mesh.material as THREE.MeshPhongMaterial).emissive.copy(em)
      }

      renderer.render(scene,camera)
    }

    animId=requestAnimationFrame(animate)

    const ro=new ResizeObserver(()=>{
      const W2=container.offsetWidth, H2=container.offsetHeight
      camera.aspect=W2/H2; camera.updateProjectionMatrix()
      renderer.setSize(W2,H2)
    })
    ro.observe(container)

    return ()=>{
      cancelAnimationFrame(animId)
      ro.disconnect()
      renderer.dispose()
      if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      Object.values(geoCache).forEach((g: THREE.ExtrudeGeometry)=>g.dispose())
    }
  },[])

  return <div ref={containerRef} style={{position:'absolute',inset:0}} />
}
