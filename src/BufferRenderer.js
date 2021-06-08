import {adjust_hue, hsl_to_css} from './ColorPickerButton.js'

const draw_grid_layer = (buffer, c, scale) => {
    //draw grid
    c.lineWidth = 0.5
    c.beginPath()
    for (let x = 0; x < buffer.width; x++) {
        c.moveTo(x * scale, 0)
        c.lineTo(x * scale, buffer.height * scale)
    }
    for (let y = 0; y < buffer.height; y++) {
        c.moveTo(0, y * scale)
        c.lineTo(buffer.width * scale, y * scale)
    }
    c.stroke()
}
const draw_background_layer = (buffer, c, scale) => {
    c.fillStyle = hsl_to_css(buffer.bgcolor)
    c.fillRect(0, 0, buffer.width * scale, buffer.height * scale)
}
const draw_border_layer = (buffer, c, scale) => {
    c.strokeStyle = 'black'
    c.strokeRect(0, 0, buffer.width * scale, buffer.height * scale)
}
const draw_pixel_layer = (buffer, c, scale, draw_pixel) => {
    for (let x = 0; x < buffer.width; x++) {
        for (let y = 0; y < buffer.height; y++) {
            let v = buffer.getPixel({x: x, y: y})
            draw_pixel(buffer, c, x, y, v, scale)
        }
    }
}
const draw_pixel = (buffer, c, x, y, v, scale) => {
    // let color = 'white'
    let color = hsl_to_css(buffer.fgcolor)
    c.beginPath()
    if (v === 0) {
        c.fillStyle = hsl_to_css(buffer.bgcolor)
        c.fillRect(x * scale, y * scale, scale, scale)
    }
    if (v === 1) {
        c.fillStyle = color
        c.moveTo(x * scale, y * scale)
        c.lineTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale + scale)
        c.fill()
    }
    if (v === 2) {
        c.fillStyle = color
        c.moveTo(x * scale + scale, y * scale)
        c.lineTo(x * scale, y * scale + scale)
        c.lineTo(x * scale, y * scale)
        c.fill()
    }
    if (v === 3) {
        c.fillStyle = color
        c.moveTo(x * scale + scale, y * scale)
        c.lineTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale)
        c.fill()
    }
    if (v === 4) {
        c.fillStyle = color
        c.moveTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale + scale)
        c.lineTo(x * scale + scale, y * scale)
        c.fill()
    }
    if (v === 5) {
        c.fillStyle = color
        c.moveTo(x * scale, y * scale)
        c.lineTo(x * scale + scale, y * scale)
        c.lineTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale + scale)
        c.fill()
    }
}
const draw_gradient_layer = (buffer, c,scale) => {
    let gradient = c.createLinearGradient(0,  buffer.height*scale,buffer.width*scale,0);
    gradient.addColorStop(0, hsl_to_css(adjust_hue(buffer.fgcolor,-45)));
    gradient.addColorStop(.5, hsl_to_css(adjust_hue(buffer.fgcolor,0)));
    gradient.addColorStop(1, hsl_to_css(adjust_hue(buffer.fgcolor,+45)));

    c.fillStyle = gradient
    c.beginPath()
    for (let x = 0; x < buffer.width; x++) {
        for (let y = 0; y < buffer.height; y++) {
            let v = buffer.getPixel({x: x, y: y})
            if(v > 0) {
                c.moveTo(x * scale, y * scale)
                c.lineTo(x * scale + scale, y * scale)
                c.lineTo(x * scale + scale, y * scale + scale)
                c.lineTo(x * scale, y * scale + scale)
            }
        }
    }
    c.fill()
}

export class BufferRenderer {
    constructor() {
    }

    render(canvas, buffer, scale, settings) {
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        draw_background_layer(buffer, ctx, scale)
        if(settings.draw_gradient) {
            draw_gradient_layer(buffer, ctx, scale)
        } else {
            draw_pixel_layer(buffer, ctx, scale, draw_pixel)
        }
        if (settings.draw_grid) draw_grid_layer(buffer, ctx, scale)
        draw_border_layer(buffer, ctx, scale)
    }
    export_png(buffer,scale) {
        // console.log("exporting at scale",scale)
        let canvas = document.createElement("canvas")
        canvas.width = buffer.width * scale
        canvas.height = buffer.height * scale
        this.render(canvas,buffer,scale,false)
        // his.draw(canvas, scale, false)
        let url = canvas.toDataURL("png")
        const a = document.createElement('a')
        a.href = url
        a.download = 'image.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    export_json(buffer) {
        let data = JSON.stringify(buffer)
        console.log('data', btoa(data))
        const a = document.createElement('a')
        a.href = 'data:application/json;base64,' + btoa(data)
        a.download = 'image.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

}
