import {Component, useState} from 'react'
import {ChromePicker, CustomPicker, HuePicker} from 'react-color'
import {Hue, Saturation} from 'react-color/lib/components/common'

export function hsl_to_css(color) {
    return `hsl(${Math.floor(color.h)},${Math.floor(color.s * 100)}%,${color.l * 100}%)`
}
export function adjust_hue(hsl, d) {
    return {
        h:hsl.h+d,
        s:hsl.s,
        l:hsl.l,
    }
}


export const ColorPickerButton = ({color, onChange}) => {
    const [show, set_show] = useState(false)
    const handle_click = () => {
        set_show(!show)
    }
    const handle_close = () => {
        set_show(false)
    }

    const popover = {
        position: 'absolute',
        zIndex: '2'
    }
    const cover = {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
    }
    const swatch = {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer'
    }
    const colorStyle = {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        background: hsl_to_css(color)
    }


    return <div>
        <div style={swatch} onClick={() => handle_click()}>
            <div style={colorStyle}/>
        </div>
        {show ? <div style={popover}>
            <div style={cover} onClick={handle_close}/>
            <MyColorPicker color={color} onChange={onChange}/>
        </div> : null}
    </div>
}

class MyColorPickerImpl extends Component {
    render() {
        return <div style={{
            width:'400px',
            height:'100px',
        }}>
            <div style={{
                position:'relative',
                height:'40px',
            }}><Hue {...this.props} direction={"horizontal"}/></div>
            <div style={{
                position:'relative',
                height:'60px',
            }}><Saturation {...this.props} direction={"horizontal"}/></div>
        </div>
    }
}

const MyColorPicker = CustomPicker(MyColorPickerImpl);

