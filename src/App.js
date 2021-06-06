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
  draw(canvas) {
    let c = canvas.getContext('2d')
    c.fillStyle = 'white'
    c.fillRect(0,0,canvas.width,canvas.height)
    for(let x=0; x<this.width; x++) {
      for(let y=0; y<this.height; y++) {
        let v = this.getPixel({x:x,y:y})
        let color = 'white'
        if(v === 1) color = 'black'
        c.fillStyle = color
        c.fillRect(x*8,y*8,8,8)
      }
    }
  }
}


function App() {
  let ref = useRef()
  let [buffer, set_buffer] = useState(new Buffer(16,16))
  let zoom = 8

  function handle_click(e) {
    let off = e.target.getBoundingClientRect()
    let pt = {
      x:e.clientX - off.x,
      y:e.clientY - off.y
    }
    pt.x = Math.floor(pt.x/zoom)
    pt.y = Math.floor(pt.y/zoom)
    set_buffer(buffer.setPixel(pt,1))
  }
  useEffect(()=>{
    if (ref.current) buffer.draw(ref.current)
  },[ref,buffer])
  return <HBox>
    <canvas className={"drawing-surface"} ref={ref} width={16*8} height={16*8}
            onClick={handle_click}
            // onMouseDown={mouse_down}
            // onMouseUp={mouse_up}
    />
  </HBox>
}

export default App;
