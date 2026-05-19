'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number
    let t = 0

    const DARK_TOP='#1a4d38',DARK_LEFT='#0d2e20',DARK_RIGHT='#122a1c'
    const LIT_TOP='#3DC45A',LIT_LEFT='#2a9444',LIT_RIGHT='#1f7a35'
    const BRIGHT_TOP='#7FE89A',BRIGHT_LEFT='#3DC45A',BRIGHT_RIGHT='#2a9444'

    function hexToRgb(h:string){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
    function lerp(a:number,b:number,t:number){return a+(b-a)*t}
    function mix(c1:string,c2:string,t:number){
      const a=hexToRgb(c1),b=hexToRgb(c2)
      return `rgb(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))})`
    }

    function drawCell(col:number,row:number,h:number,tC:string,lC:string,rC:string,IX:number,IY:number,ox:number,oy:number){
      const x=ox+(col-row)*IX, y=oy+(col+row)*IY-h
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+IX,y+IY);ctx.lineTo(x,y+IY*2);ctx.lineTo(x-IX,y+IY);ctx.closePath()
      ctx.fillStyle=tC;ctx.fill()
      ctx.beginPath();ctx.moveTo(x-IX,y+IY);ctx.lineTo(x,y+IY*2);ctx.lineTo(x,y+IY*2+h);ctx.lineTo(x-IX,y+IY+h);ctx.closePath()
      ctx.fillStyle=lC;ctx.fill()
      ctx.beginPath();ctx.moveTo(x+IX,y+IY);ctx.lineTo(x,y+IY*2);ctx.lineTo(x,y+IY*2+h);ctx.lineTo(x+IX,y+IY+h);ctx.closePath()
      ctx.fillStyle=rC;ctx.fill()
    }

    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })
    ro.observe(canvas)

    function init() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      if (canvas.width === 0) { animId = requestAnimationFrame(init); return }

      const IX=28, IY=14
      const COLS = Math.ceil(canvas.width/IX)+6
      const ROWS = Math.ceil(canvas.height/(IY*2))+6
      const ox = canvas.width*0.5
      const oy = canvas.height*0.55

      const cells = Array.from({length:COLS*ROWS},(_,i)=>({
        col:i%COLS, row:Math.floor(i/COLS),
        phase:Math.random()*Math.PI*2,
        baseH:3+Math.random()*3,
        lit:0
      }))

      const sorted=[...cells].sort((a,b)=>(a.col+a.row)-(b.col+b.row))

      function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height)
        t+=0.005
        const wp=(t%1)*(COLS+ROWS)
        for(const c of sorted){
          const diag=(COLS-1-c.col)+c.row
          const dist=wp-diag
          let lit=0
          if(dist>0&&dist<4.5) lit=Math.sin((dist/4.5)*Math.PI)
          else if(dist>=4.5) lit=Math.max(0,1-(dist-4.5)*0.13)*0.38
          c.lit=lerp(c.lit,lit,0.10)
          const h=c.baseH+c.lit*18+Math.sin(t*2.5+c.phase)*0.04*2
          let tC,lC,rC
          if(c.lit>0.55){
            const b=(c.lit-0.55)/0.45
            tC=mix(LIT_TOP,BRIGHT_TOP,b);lC=mix(LIT_LEFT,BRIGHT_LEFT,b);rC=mix(LIT_RIGHT,BRIGHT_RIGHT,b)
          } else {
            tC=mix(DARK_TOP,LIT_TOP,c.lit);lC=mix(DARK_LEFT,LIT_LEFT,c.lit);rC=mix(DARK_RIGHT,LIT_RIGHT,c.lit)
          }
          drawCell(c.col,c.row,h,tC,lC,rC,IX,IY,ox,oy)
        }
        animId=requestAnimationFrame(loop)
      }
      loop()
    }

    animId=requestAnimationFrame(init)
    return()=>{cancelAnimationFrame(animId);ro.disconnect()}
  },[])

  return (
    <section style={{minHeight:'100vh',background:'#0F382B',display:'grid',gridTemplateColumns:'1fr 1fr',position:'relative',overflow:'hidden'}}>
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',padding:'80px 48px 80px 64px',position:'relative',zIndex:2,maxWidth:640}}>
        <div style={{display:'flex',gap:10,marginBottom:28,flexWrap:'wrap'}}>
          <span style={{background:'rgba(61,196,90,0.15)',border:'0.5px solid rgba(61,196,90,0.4)',color:'#3DC45A',fontSize:12,padding:'5px 14px',borderRadius:100}}>⚡ 1ª limpeza com 50% off</span>
          <span style={{background:'rgba(255,255,255,0.07)',border:'0.5px solid rgba(255,255,255,0.15)',color:'#C8DFC0',fontSize:12,padding:'5px 14px',borderRadius:100}}>🇧🇷 Feito em Santa Catarina</span>
        </div>
        <h1 style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(32px,3.5vw,54px)',fontWeight:800,color:'#fff',lineHeight:1.1,margin:'0 0 4px'}}>Sua usina solar<br/>merece cuidado</h1>
        <h1 style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(32px,3.5vw,54px)',fontWeight:800,color:'#3DC45A',lineHeight:1.1,margin:'0 0 24px'}}>todo mês.</h1>
        <p style={{color:'rgba(200,223,192,0.8)',fontSize:16,lineHeight:1.6,margin:'0 0 36px',maxWidth:420}}>
          Painéis sujos podem perder até <strong style={{color:'#3DC45A'}}>30% de eficiência</strong>.<br/>
          Mantenha sua geração no máximo com assinatura mensal a partir de R$ 30.
        </p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:32}}>
          <a href="#planos" style={{background:'#3DC45A',color:'#0F382B',fontWeight:700,fontSize:15,padding:'14px 28px',borderRadius:8,textDecoration:'none'}}>Assinar agora →</a>
          <a href="#calculadora" style={{background:'transparent',color:'#fff',fontWeight:600,fontSize:15,padding:'14px 28px',borderRadius:8,border:'1.5px solid rgba(255,255,255,0.25)',textDecoration:'none'}}>Calcular economia</a>
        </div>
        <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
          {['🧹 2 limpezas/ano','⚡ Relatório mensal','🔧 Checkup técnico','🛡️ Seguro na limpeza'].map(item=>(
            <span key={item} style={{color:'rgba(200,223,192,0.65)',fontSize:13}}>{item}</span>
          ))}
        </div>
      </div>
      <div style={{position:'relative'}}>
        <canvas ref={canvasRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',display:'block'}}/>
      </div>
      <style>{`
        @media(max-width:640px){
          section{grid-template-columns:1fr !important;}
          section>div:first-child{padding:60px 24px 32px !important;max-width:100% !important;}
          section>div:last-child{height:280px;position:relative;}
        }
      `}</style>
    </section>
  )
}
