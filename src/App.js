import './App.css';
import {useEffect, useRef, useState} from 'react'

export const HBox = ({children}) => {
  return <div className={"hbox"}>{children}</div>
}
export const VBox = ({children}) => {
  return <div className={"vbox"}>{children}</div>
}

export const FillBox = ({children}) => {
  return <div className={"fillbox"}>{children}</div>
}

class Buffer {
  constructor(w,h) {
    this.width = w
    this.height = h
    this.data = new Array(w*h)
    this.data.fill(0)
  }
  setPixel(pt, value) {
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
    return buf
  }
  draw(canvas, scale) {
    let c = canvas.getContext('2d')
    c.fillStyle = 'white'
    c.fillRect(0,0,canvas.width,canvas.height)
    for(let x=0; x<this.width; x++) {
      for(let y=0; y<this.height; y++) {
        let v = this.getPixel({x:x,y:y})
        let color = 'white'
        if(v === 1) color = 'black'
        if(v === 2) color = 'red'
        c.fillStyle = color
        c.fillRect(x*scale,y*scale,scale,scale)
      }
    }
    c.strokeStyle = 'black'
    c.strokeRect(0,0,this.width*scale,this.height*scale)
  }
}

const BufferEditor = ({width, height}) => {
  let ref = useRef()
  let [buffer, set_buffer] = useState(new Buffer(16,16))
  let [zoom, set_zoom] = useState(1)

  function handle_click(e) {
    let off = e.target.getBoundingClientRect()
    let pt = {
      x:e.clientX - off.x,
      y:e.clientY - off.y
    }
    let scale = Math.pow(2,zoom)
    pt.x = Math.floor(pt.x/scale)
    pt.y = Math.floor(pt.y/scale)
    let v = buffer.getPixel(pt)
    v = (v + 1) %3
    set_buffer(buffer.setPixel(pt,v))
  }
  useEffect(()=>{
    let scale = Math.pow(2,zoom)
    if (ref.current) buffer.draw(ref.current,scale)
  },[ref,buffer,zoom])
  return <HBox>
    <VBox>
      <button onClick={()=>{
        set_zoom(zoom+1)
      }}>zoom in</button>
      <button onClick={()=>{
        set_zoom(zoom-1)
      }}>zoom out</button>
    </VBox>
    <canvas className={"drawing-surface"} ref={ref} width={width} height={height} onClick={handle_click}  />
  </HBox>
}

function App() {

  return <HBox>
    <BufferEditor width={1280} height={768}/>
  </HBox>
}

export default App;
