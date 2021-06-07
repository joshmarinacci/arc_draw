import './App.css';
import {useEffect, useRef, useState} from 'react'
import {ChromePicker, SketchPicker} from "react-color"

export const HBox = ({children}) => {
  return <div className={"hbox"}>{children}</div>
}
export const VBox = ({children}) => {
  return <div className={"vbox"}>{children}</div>
}

export const FillBox = ({children}) => {
  return <div className={"fillbox"}>{children}</div>
}

const LATEST_BUFFER_KEY = "LATEST_BUFFER_KEY"
class Buffer {
  constructor(w,h) {
    this.width = w
    this.height = h
    this.data = new Array(w*h)
    this.data.fill(0)
    this.fgcolor = {
      h:0.2,
      s:0.5,
      l:0.5,
    }
  }
  setPixel(pt, value) {
    if(pt.x < 0) return this
    if(pt.y < 0) return this
    if(pt.x >= this.width) return this
    if(pt.y >= this.height) return this

    let n = pt.y*this.width + pt.x
    this.data[n] = value
    return this.clone()
  }
  getPixel(pt) {
    let n = pt.y*this.width + pt.x
    return this.data[n]
  }
  clone() {
    let buf = new Buffer(this.width,this.height)
    buf.data = this.data
    buf.fgcolor = this.fgcolor
    buf.persist()
    return buf
  }
  restore() {
    const res = localStorage.getItem(LATEST_BUFFER_KEY)
    try {
      if (res) {
        let obj = JSON.parse(res)
        this.width = obj.width
        this.height = obj.height
        this.data = obj.data
      }
    } catch(e) {
      console.log(e)
    }
  }

  clear() {
    this.data.fill(0)
    return this.clone()
  }

  set_fg_color(c) {
    let buf = this.clone()
    buf.fgcolor = c
    return buf
  }

  shift(dx,dy) {
    const wrap = (v, max) => {
      if(v < 0) return v+max
      if(v >= max) return v%max
      return v
    }
    let data = this.data.slice()
    data.fill(0)
    for(let x=0; x<this.width; x++) {
      for(let y=0; y<this.height; y++) {
        let n1 = this.width*y + x
        let v = this.data[n1]
        let x2 = wrap(x+dx,this.width)
        let y2 = wrap(y+dy,this.height)
        let n2 = this.width*y2 + x2
        data[n2] = v
      }
    }
    let buf = new Buffer(this.width,this.height)
    buf.fgcolor = this.fgcolor
    buf.data = data
    buf.persist()
    return buf
  }
  persist() {
    localStorage.setItem(LATEST_BUFFER_KEY,JSON.stringify(this))
  }

  export_png(scale) {
    // console.log("exporting at scale",scale)
    let canvas = document.createElement("canvas")
    canvas.width = this.width*scale
    canvas.height = this.height*scale
    this.draw(canvas,scale,false)
    let url = canvas.toDataURL("png")
    const a = document.createElement('a')
    a.href = url
    a.download = 'image.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  export_json() {
    let data = JSON.stringify(this)
    console.log('data',btoa(data))
    const a = document.createElement('a')
    a.href ='data:application/json;base64,'+btoa(data)
    a.download = 'image.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  draw(canvas, scale, draw_grid) {
    let c = canvas.getContext('2d')
    c.fillStyle = 'white'
    c.fillRect(0,0,canvas.width,canvas.height)
    for(let x=0; x<this.width; x++) {
      for(let y=0; y<this.height; y++) {
        let v = this.getPixel({x:x,y:y})
        this.draw_pixel(c,x,y,v,scale)
      }
    }
    if(draw_grid) this.draw_grid(c,scale)

    c.strokeStyle = 'black'
    c.strokeRect(0,0,this.width*scale,this.height*scale)
  }

  // draw_pixel(c, x, y, v, scale) {
  //   let color = 'white'
  //   if(v === 1) color = 'black'
  //   if(v === 2) color = 'red'
  //   c.fillStyle = color
  //   c.fillRect(x*scale,y*scale,scale,scale)
  // }

  draw_pixel(c, x, y, v, scale) {
    // let color = 'white'
    let color = `hsl(${Math.floor(this.fgcolor.h)},${Math.floor(this.fgcolor.s*100)}%,${this.fgcolor.l*100}%)`
    c.beginPath()
    if(v === 0) {
      c.fillStyle = 'white'
      c.fillRect(x*scale,y*scale,scale,scale)
    }
    if(v === 1) {
      c.fillStyle = color
      c.moveTo(x*scale,y*scale)
      c.lineTo(x*scale+scale,y*scale+scale)
      c.lineTo(x*scale,y*scale+scale)
      c.fill()
    }
    if(v === 2) {
      c.fillStyle = color
      c.moveTo(x*scale+scale,y*scale)
      c.lineTo(x*scale,y*scale+scale)
      c.lineTo(x*scale,y*scale)
      c.fill()
    }
    if(v === 3) {
      c.fillStyle = color
      c.moveTo(x*scale+scale,y*scale)
      c.lineTo(x*scale+scale,y*scale+scale)
      c.lineTo(x*scale,y*scale)
      c.fill()
    }
    if(v === 4) {
      c.fillStyle = color
      c.moveTo(x*scale+scale,y*scale+scale)
      c.lineTo(x*scale,y*scale+scale)
      c.lineTo(x*scale+scale,y*scale)
      c.fill()
    }
    if(v === 5) {
      c.fillStyle = color
      c.moveTo(x*scale,y*scale)
      c.lineTo(x*scale+scale,y*scale)
      c.lineTo(x*scale+scale,y*scale+scale)
      c.lineTo(x*scale,y*scale+scale)
      c.fill()
    }
  }

  draw_grid(c, scale) {
    //draw grid
    c.lineWidth = 0.5
    c.beginPath()
    for(let x=0; x<this.width; x++) {
      c.moveTo(x*scale,0)
      c.lineTo(x*scale,this.height*scale)
    }
    for(let y=0; y<this.height; y++) {
      c.moveTo(0,y*scale)
      c.lineTo(this.width*scale,y*scale)
    }
    c.stroke()
  }
}

function zoom_to_scale(zoom) {
  return Math.pow(1.5,zoom)
}

const BufferEditor = ({width, height, initialZoom}) => {
  let ref = useRef()
  let [buffer, set_buffer] = useState(()=>{
    let buf = new Buffer(16,16)
    buf.restore()
    return buf
  })
  let [zoom, set_zoom] = useState(initialZoom)
  let [draw_grid, set_draw_grid] = useState(true)

  function handle_click(e) {
    let off = e.target.getBoundingClientRect()
    let pt = {
      x:e.clientX - off.x,
      y:e.clientY - off.y
    }
    let scale = zoom_to_scale(zoom)
    pt.x = Math.floor(pt.x/scale)
    pt.y = Math.floor(pt.y/scale)
    let v = buffer.getPixel(pt)
    v = (v + 1) %6
    set_buffer(buffer.setPixel(pt,v))
  }
  useEffect(()=>{
    let scale = zoom_to_scale(zoom)
    if (ref.current) buffer.draw(ref.current,scale,draw_grid)
  },[ref,buffer,zoom, draw_grid])
  return <HBox>
    <VBox>
      <button onClick={()=>set_zoom(zoom+1)}>zoom in</button>
      <button onClick={()=>set_zoom(zoom-1)}>zoom out</button>
      <button onClick={()=>set_draw_grid(!draw_grid)}>grid</button>
      <button onClick={()=>set_buffer(buffer.clear())}>clear</button>
      <button onClick={()=>buffer.persist()}>persist</button>
      <button onClick={()=>buffer.export_png(30)}>export 30</button>
      <button onClick={()=>buffer.export_json()}>export JSON</button>
      <button onClick={()=>set_buffer(buffer.shift(0,1))}>shift down</button>
      <button onClick={()=>set_buffer(buffer.shift(0,-1))}>shift up</button>
      <button onClick={()=>set_buffer(buffer.shift(-1,0))}>shift left</button>
      <button onClick={()=>set_buffer(buffer.shift(1,0))}>shift right</button>
      <ColorPickerButton color={buffer.fgcolor} onChange={(c)=> set_buffer(buffer.set_fg_color(c.hsl))}/>
      {/*<ColorPickerButton color={buffer.fgcolor}*/}
    </VBox>
    <canvas className={"drawing-surface"} ref={ref} width={width} height={height} onClick={handle_click}  />
  </HBox>
}

function App() {

  return <HBox>
    <BufferEditor width={1280} height={768} initialZoom={4}/>
  </HBox>
}

function hsl_to_css(color) {
  return `hsl(${Math.floor(color.h)},${Math.floor(color.s*100)}%,${color.l*100}%)`
}

const ColorPickerButton = ({color,onChange})=>{
  const [show, set_show] = useState(false)
  const handle_click = () => {
    set_show(!show)
  }
  const handle_close = () => {
    set_show(false)
  }

  const popover = {
    position: 'absolute',
    zIndex: '2',
  }
  const cover = {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  }
  const swatch = {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
  }
  const colorStyle = {
      width: '36px',
      height: '14px',
      borderRadius: '2px',
      background: hsl_to_css(color)
  }


  return <div>
    <div style={swatch} onClick={()=>handle_click()}><div style={colorStyle}/></div>
    { show ? <div style={ popover }>
      <div style={cover} onClick={handle_close}/>
      <ChromePicker color={color} onChange={onChange} />
    </div> : null }
  </div>
}

export default App;
