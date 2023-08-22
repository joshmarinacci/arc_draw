import {useContext, useEffect, useRef, useState} from 'react'
import {Buffer} from './Buffer.js'
import {ColorPickerButton} from './ColorPickerButton.js'
import {BufferRenderer} from './BufferRenderer.js'
import {readMetadata} from './vendor'
import {DialogContext, HBox, PopupContext, Spacer, VBox} from 'josh_react_util'
import {IconButton} from './common.js'

function zoom_to_scale(zoom) {
    return Math.pow(1.5, zoom)
}

let renderer = new BufferRenderer()


function ResizeDialog({onCancel, onOkay, buffer}) {
    const [w, sw] = useState(buffer.width)
    const [h, sh] = useState(buffer.height)
    return <div className={'dialog'}>
        <header>do you want to save the document?</header>
        <section>
            <HBox>
                <label>width</label>
                <input type="number" value={w} onChange={(e)=>{
                    sw(parseInt(e.target.value))
                }}/>
            </HBox>
            <HBox>
                <label>height</label>
                <input type="number" value={h} onChange={(e)=>{
                    sh(parseInt(e.target.value))
                }}/>
            </HBox>
        </section>
            <footer>
                <Spacer/>
                <button onClick={onCancel}>cancel</button>
                <button onClick={()=>{
                    onOkay(buffer.resize(w,h))
                }}>resize</button>
            </footer>
    </div>
}

function ToggleButton({selected, children, ...rest}) {
    return <button className={selected?"selected":"unselected"} {...rest}>{children}</button>
}

function ToggleIconButton({selected, icon, children, ...rest}) {
    return <button className={selected?"selected":"unselected"}  {...rest}>
        <span className="material-symbols-rounded">{icon}</span>
        {children}</button>
}

function UploadButton({onUpload}) {
    return <input type={'file'} onChange={(e)=>{
        if(!e.target.files || e.target.files.length < 1) return
        let file = e.target.files[0]
        // console.log("changed",file, file.type)
        if(file.type === "image/png") {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                let buffer2 = new Uint8Array(reader.result);
                let metadata = readMetadata(buffer2)
                console.log("metadata is", metadata)
                if(metadata && metadata.tEXt && metadata.tEXt.SOURCE) {
                    let json = JSON.parse(metadata.tEXt.SOURCE)
                    onUpload(json)
                }
            })
            reader.readAsArrayBuffer(file)
        }
        if(file.type === 'application/json') {
            const reader = new FileReader();
            reader.addEventListener('load', (e) => {
                onUpload(JSON.parse(reader.result))
            })
            reader.readAsText(file)
        }
    }
    }/>
}

function GradientSelector({effect, onChange}) {
    const update = () => {
        onChange({
            ...effect,
            angle:(effect.angle+45)%360,
        })
    }
    const update_slider = (e) => {
        console.log(e.target.value)
        onChange({
            ...effect,
            spread:e.target.value/100,
        })
    }
    return <VBox>
        <button onClick={update}>{effect.angle}</button>
        <input type="range" value={effect.spread*100} onChange={update_slider} min={0} max={100}/>
    </VBox>
}

function UploadDialog({onUpload}) {
    return <div className={'dialog'}>
        <header>Upload JSON</header>
        <UploadButton onUpload={onUpload}/>
        <footer>
            <button>cancel</button>
        </footer>
    </div>
}


export const BufferEditor = ({initialZoom}) => {
    const pm = useContext(PopupContext)
    const dm = useContext(DialogContext)
    let ref = useRef()
    let [buffer, set_buffer] = useState(() => {
        let buf = new Buffer(16, 16)
        buf = buf.restore()
        return buf
    })
    let [zoom, set_zoom] = useState(initialZoom)
    let [draw_grid, set_draw_grid] = useState(false)
    let [draw_vignette, set_draw_vignette] = useState(true)
    let [dragging, set_dragging] = useState(false)
    let [vor, set_vor] = useState(1.0)
    let [vir, set_vir] = useState(0.5)
    let [v2_strength, set_v2_strength] = useState(0)
    let [v2_alpha, set_v2_alpha] = useState(0)

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
        dm.show(<ResizeDialog buffer={buffer} onCancel={()=>dm.hide()} onOkay={(buffer)=>{
            set_buffer(buffer)
            dm.hide()
        }}/>)
    }

    function show_upload() {
        dm.show(<UploadDialog onUpload={(json)=>{
            set_buffer(buffer.clone_from_json(json))
        }}/>)
    }

    useEffect(() => {
        let scale = zoom_to_scale(zoom)
        if (ref.current) renderer.render(ref.current, buffer, scale, {
            draw_grid:draw_grid,
            v2:{
                visible:draw_vignette,
                radius:v2_strength,
                alpha:v2_alpha,
            }
        })
    }, [ref, buffer, zoom, draw_grid, draw_vignette, vor, vir, v2_strength, v2_alpha])

    function export_png_scaled(scale) {
        pm.hide()
        renderer.export_png(buffer,scale,{
            draw_grid:false,
            v2:{
                visible:draw_vignette,
                radius:v2_strength,
                alpha:v2_alpha,
            }
        }).then(()=>console.log("done exporting"))
    }

    return <HBox>
        <VBox>
            <h3>Foreground Color</h3>
            <ColorPickerButton color={buffer.fgcolor}
                               onChange={(c) => set_buffer(buffer.set_fg_color(c.hsl))}/>
            <GradientSelector effect={buffer.fgeffect}
                              onChange={e => set_buffer(buffer.set_fg_effect(e))}/>
            <h3>Background Color</h3>
            <ColorPickerButton color={buffer.bgcolor}
                               onChange={(c) => set_buffer(buffer.set_bg_color(c.hsl))}/>
            <GradientSelector effect={buffer.bgeffect}
                              onChange={e => set_buffer(buffer.set_bg_effect(e))}/>
            <button onClick={() => set_buffer(buffer.invert())}>invert</button>
            <h3>shift</h3>
            <HBox>
                <IconButton icon={'arrow_drop_down'} onClick={() => set_buffer(buffer.shift(0, 1))}/>
                <IconButton icon={'arrow_drop_up'} onClick={() => set_buffer(buffer.shift(0, -1))}/>
                <IconButton icon={'arrow_left'} onClick={() => set_buffer(buffer.shift(-1, 0))}/>
                <IconButton icon={'arrow_right'} onClick={() => set_buffer(buffer.shift(1, 0))}/>
            </HBox>
            <button onClick={() => set_buffer(buffer.clear())}>clear</button>
            <button onClick={() => show_resize()}>resize</button>

            <button onClick={(e)=>{
                pm.show(<VBox>
                    <button onClick={()=>export_png_scaled(25)}>png 25x</button>
                    <button onClick={()=>export_png_scaled(30)}>png 30x</button>
                    <button onClick={()=>export_png_scaled(50)}>png 50x</button>
                    <button onClick={()=>export_png_scaled(100)}>png 100x</button>
                    <button onClick={() => renderer.export_json(buffer)}>export JSON</button>
                </VBox>,e.target)
            }}>export</button>
            <ToggleButton selected={draw_vignette} onClick={()=>set_draw_vignette(!draw_vignette)}>vignette</ToggleButton>
            <input type={'range'} min={0} max={50} value={v2_strength} onChange={(e)=>set_v2_strength(e.target.value)}/>
            <input type={'range'} min={0} max={100} value={v2_alpha} onChange={(e)=>set_v2_alpha(e.target.value)}/>
            <button onClick={() => show_upload()}>upload</button>

        </VBox>
        <VBox>
            <HBox className={'toolbar'}>
                <IconButton icon={'zoom_in'} onClick={() => set_zoom(zoom + 1)}/>
                <label>{zoom_to_scale(zoom).toFixed(2)}</label>
                <IconButton icon={'zoom_out'} onClick={() => set_zoom(zoom - 1)}/>
                <ToggleIconButton icon={'grid_on'} selected={draw_grid} onClick={() => set_draw_grid(!draw_grid)}/>
            </HBox>
        <div className={"scroll-area"}>
            <canvas className={"drawing-surface"} ref={ref}
                    width={buffer.width*zoom_to_scale(zoom)}
                    height={buffer.height*zoom_to_scale(zoom)}
                    onMouseDown={handle_down}
                    onMouseMove={handle_move}
                    onMouseUp={handle_up}
                    onTouchStart={handle_touchstart}
                    onTouchMove={handle_touchmove}
                    onTouchEnd={handle_touchend}
            />
        </div>
        </VBox>
    </HBox>
}
