import {useEffect, useRef, useState} from 'react'
import {Buffer} from './Buffer.js'
import {ColorPickerButton} from './ColorPickerButton.js'
import {BufferRenderer} from './BufferRenderer.js'
import {Dialog, HBox, Spacer, VBox} from 'appy-comps'

function zoom_to_scale(zoom) {
    return Math.pow(1.5, zoom)
}

let renderer = new BufferRenderer()

function ResizeDialog({onCancel, onOkay, buffer}) {
    const [w, sw] = useState(buffer.width)
    const [h, sh] = useState(buffer.height)
    return <div>
        <p>do you want to save the document?</p>
        <HBox>
            <form>
                <label>width</label>
                <input type="number" value={w} onChange={(e)=>{
                    sw(parseInt(e.target.value))
                }}/>
                <label>height</label>
                <input type="number" value={h} onChange={(e)=>{
                    sh(parseInt(e.target.value))
                }}/>
            </form>
            <button onClick={onCancel}>cancel</button>
            <button onClick={()=>{
                onOkay(buffer.resize(w,h))
            }}>resize</button>
        </HBox>
    </div>
}

export const BufferEditor = ({width, height, initialZoom}) => {
    let ref = useRef()
    let [buffer, set_buffer] = useState(() => {
        let buf = new Buffer(16, 16)
        buf.restore()
        return buf
    })
    let [zoom, set_zoom] = useState(initialZoom)
    let [draw_grid, set_draw_grid] = useState(false)
    let [draw_gradient, set_draw_gradient] = useState(true)
    let [dragging, set_dragging] = useState(false)
    let [resize_shown, set_resize_shown] = useState(false)

    function to_point(e) {
        let off = e.target.getBoundingClientRect()
        let pt = {
            x: e.clientX - off.x,
            y: e.clientY - off.y
        }
        let scale = zoom_to_scale(zoom)
        pt.x = Math.floor(pt.x / scale)
        pt.y = Math.floor(pt.y / scale)
        return pt
    }

    let [drag_value, set_drag_value] = useState(0)
    function handle_down(e) {
        set_dragging(true)
        let pt = to_point(e)
        let v = buffer.getPixel(pt)
        v = (v+1)%6
        set_buffer(buffer.setPixel(pt,v))
        set_drag_value(v)
    }
    function handle_touchstart(e) {
        if(e.touches.length !==  1) return
        return handle_down(e.touches[0])
    }
    function handle_move(e) {
        if(dragging) {
            let pt = to_point(e)
            set_buffer(buffer.setPixel(pt,drag_value))
        }
    }
    function handle_touchmove(e) {
        if(e.touches.length !==  1) return
        return handle_move(e.touches[0])
    }
    function handle_up(e) {
        set_dragging(false)
    }
    function handle_touchend(e) {
        if(e.touches.length !==  1) return
        return handle_up(e.touches[0])
    }

    function show_resize() {
        set_resize_shown(true)
    }

    useEffect(() => {
        let scale = zoom_to_scale(zoom)
        if (ref.current) renderer.render(ref.current, buffer, scale, {
            draw_grid:draw_grid,
            draw_gradient:draw_gradient
        })
    }, [ref, buffer, zoom, draw_grid, draw_gradient])
    return <HBox>
        <VBox>
            <ColorPickerButton color={buffer.fgcolor}
                               onChange={(c) => set_buffer(buffer.set_fg_color(c.hsl))}/>
            <ColorPickerButton color={buffer.bgcolor}
                               onChange={(c) => set_buffer(buffer.set_bg_color(c.hsl))}/>
            <button onClick={() => set_buffer(buffer.invert())}>invert</button>
            <Spacer/>
            <button onClick={() => set_buffer(buffer.shift(0, 1))}>shift down</button>
            <button onClick={() => set_buffer(buffer.shift(0, -1))}>shift up</button>
            <button onClick={() => set_buffer(buffer.shift(-1, 0))}>shift left</button>
            <button onClick={() => set_buffer(buffer.shift(1, 0))}>shift right</button>
            <Spacer/>
            <button onClick={() => set_buffer(buffer.clear())}>clear</button>
            <button onClick={() => show_resize()}>resize</button>
            <Spacer/>
            <button onClick={() => renderer.export_png(buffer,30,{
                draw_grid:false,
                draw_gradient:draw_gradient,
            })}>export 30</button>
            <button onClick={() => renderer.export_json(buffer)}>export JSON</button>
        </VBox>
        <canvas className={"drawing-surface"} ref={ref} width={width} height={height}
                onMouseDown={handle_down}
                onMouseMove={handle_move}
                onMouseUp={handle_up}
                onTouchStart={handle_touchstart}
                onTouchMove={handle_touchmove}
                onTouchEnd={handle_touchend}
        />
        <VBox>
            <button onClick={() => set_zoom(zoom + 1)}>zoom&nbsp;in</button>
            <button onClick={() => set_zoom(zoom - 1)}>zoom&nbsp;out</button>
            <button onClick={() => set_draw_grid(!draw_grid)}>grid</button>
            <button onClick={()=>set_draw_gradient(!draw_gradient)}>gradient</button>
        </VBox>

        <Dialog visible={resize_shown}>
            <ResizeDialog buffer={buffer} onCancel={()=>set_resize_shown(false)} onOkay={(buffer)=>{
                set_buffer(buffer)
                set_resize_shown(false)
            }}/>
        </Dialog>

    </HBox>
}
