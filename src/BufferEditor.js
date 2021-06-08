import {useEffect, useRef, useState} from 'react'
import {Buffer} from './Buffer.js'
import {HBox, Spacer, VBox} from './common.js'
import {ColorPickerButton} from './ColorPickerButton.js'
import {BufferRenderer} from './BufferRenderer.js'

function zoom_to_scale(zoom) {
    return Math.pow(1.5, zoom)
}

let renderer = new BufferRenderer()

export const BufferEditor = ({width, height, initialZoom}) => {
    let ref = useRef()
    let [buffer, set_buffer] = useState(() => {
        let buf = new Buffer(16, 16)
        buf.restore()
        return buf
    })
    let [zoom, set_zoom] = useState(initialZoom)
    let [draw_grid, set_draw_grid] = useState(true)
    let [dragging, set_dragging] = useState(false)

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
    function handle_click(e) {
        let off = e.target.getBoundingClientRect()
        let pt = {
            x: e.clientX - off.x,
            y: e.clientY - off.y
        }
        let scale = zoom_to_scale(zoom)
        pt.x = Math.floor(pt.x / scale)
        pt.y = Math.floor(pt.y / scale)
        let v = buffer.getPixel(pt)
        v = (v + 1) % 6
        set_buffer(buffer.setPixel(pt, v))
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
    function handle_move(e) {
        if(dragging) {
            let pt = to_point(e)
            set_buffer(buffer.setPixel(pt,drag_value))
        }
    }
    function handle_up(e) {
        set_dragging(false)
    }


    useEffect(() => {
        let scale = zoom_to_scale(zoom)
        if (ref.current) renderer.render(ref.current, buffer, scale, draw_grid)
    }, [ref, buffer, zoom, draw_grid])
    return <HBox>
        <VBox>
            <ColorPickerButton color={buffer.fgcolor}
                               onChange={(c) => set_buffer(buffer.set_fg_color(c.hsl))}/>
            <ColorPickerButton color={buffer.bgcolor}
                               onChange={(c) => set_buffer(buffer.set_bg_color(c.hsl))}/>
            <Spacer/>
            <button onClick={() => set_zoom(zoom + 1)}>zoom in</button>
            <button onClick={() => set_zoom(zoom - 1)}>zoom out</button>
            <button onClick={() => set_draw_grid(!draw_grid)}>grid</button>
            <Spacer/>
            <button onClick={() => set_buffer(buffer.shift(0, 1))}>shift down</button>
            <button onClick={() => set_buffer(buffer.shift(0, -1))}>shift up</button>
            <button onClick={() => set_buffer(buffer.shift(-1, 0))}>shift left</button>
            <button onClick={() => set_buffer(buffer.shift(1, 0))}>shift right</button>
            <Spacer/>
            <button onClick={() => set_buffer(buffer.clear())}>clear</button>
            <button onClick={() => renderer.export_png(buffer,30)}>export 30</button>
            <button onClick={() => renderer.export_json(buffer)}>export JSON</button>
        </VBox>
        <canvas className={"drawing-surface"} ref={ref} width={width} height={height}
                onMouseDown={handle_down}
                onMouseMove={handle_move}
                onMouseUp={handle_up}
        />
        <VBox>

        </VBox>
    </HBox>
}
