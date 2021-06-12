import {adjust_hue, hsl_to_css} from './ColorPickerButton.js'
import {readMetadata, writeMetadata} from "./vendor/index.js"
import {buffer_to_dataurl, canvas_to_blob, force_download} from './util.js'


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
const draw_background_layer = (ctx, width, height, gradient, scale) => {
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width * scale, height * scale)
}
const draw_border_layer = (buffer, c, scale) => {
    c.strokeStyle = 'black'
    c.strokeRect(0, 0, buffer.width * scale, buffer.height * scale)
}
const draw_pixel_layer = (buffer, c, scale, draw_pixel) => {
    c.fillStyle = hsl_to_css(buffer.fgcolor)
    c.beginPath()
    for (let x = 0; x < buffer.width; x++) {
        for (let y = 0; y < buffer.height; y++) {
            let v = buffer.getPixel({x: x, y: y})
            if(v > 0) draw_pixel(buffer,c,x,y,v,scale)
        }
    }
    c.fill()
}
const draw_pixel = (buffer, c, x, y, v, scale) => {
    //v===0 means entire square is empty
    if (v === 1) { //lower left
        c.moveTo(x * scale, y * scale)
        c.lineTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale + scale)
    }
    if (v === 2) { //upper left
        c.moveTo(x * scale + scale, y * scale)
        c.lineTo(x * scale, y * scale + scale)
        c.lineTo(x * scale, y * scale)
    }
    if (v === 3) { //upper right
        c.moveTo(x * scale + scale, y * scale)
        c.lineTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale)
    }
    if (v === 4) { //lower right
        c.moveTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale + scale)
        c.lineTo(x * scale + scale, y * scale)
    }
    if (v === 5) { // fill entire square
        c.moveTo(x * scale, y * scale)
        c.lineTo(x * scale + scale, y * scale)
        c.lineTo(x * scale + scale, y * scale + scale)
        c.lineTo(x * scale, y * scale + scale)
    }
}

const ANGLES = {
    0:[0,0,0,1],
    45:[0,0,1,1],
    90:[0,0,1,0],
    135:[0,1,1,0],

    180:[0,1,0,0],
    225:[1,1,0,0],

    270:[1,0,0,0],
    315:[1,0,0,1],
}

const draw_gradient_layer = (c,buffer,width,height,gradient,scale) => {
    c.fillStyle = gradient
    c.beginPath()
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let v = buffer.getPixel({x: x, y: y})
            if(v > 0) draw_pixel(buffer,c,x,y,v,scale)
        }
    }
    c.fill()
}

function make_gradient(ctx, width, height, color, effect, scale) {
    let gradient = ctx.createLinearGradient(0,  height*scale,width*scale,0);
    if(ANGLES[effect.angle]) {
        let vals = ANGLES[effect.angle]
        let w = width*scale
        let h = height*scale
        gradient = ctx.createLinearGradient(vals[0]*w,vals[1]*h,vals[2]*w,vals[3]*h)
    }

    let COUNT = 8
    let a_inc = 180/(COUNT/2)
    for(let i=0; i<=COUNT; i++) {
        let j= i-(COUNT/2)
        let a = j*a_inc * effect.spread
        gradient.addColorStop(i/COUNT, hsl_to_css(adjust_hue(color,a)));
    }
    return gradient
}

export class BufferRenderer {
    constructor() {
    }

    render(canvas, buffer, scale, settings) {
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        let bggrad = make_gradient(ctx,buffer.width, buffer.height, buffer.bgcolor, buffer.bgeffect, scale)
        draw_background_layer(ctx,buffer.width,buffer.height,bggrad,scale)
        let fggrad = make_gradient(ctx,buffer.width, buffer.height, buffer.fgcolor, buffer.fgeffect, scale)
        draw_gradient_layer(ctx,buffer,buffer.width,buffer.height,fggrad,scale)
        if (settings.draw_grid) draw_grid_layer(buffer, ctx, scale)
        // draw_border_layer(buffer, ctx, scale)
    }

    async export_png(buffer,scale,settings) {
        let canvas = document.createElement("canvas")
        canvas.width = buffer.width * scale
        canvas.height = buffer.height * scale
        this.render(canvas,buffer,scale,settings)
        let json = JSON.stringify(buffer)
        let blob = await canvas_to_blob(canvas)
        let array_buffer = await blob.arrayBuffer()
        let uint8buffer = new Uint8Array(array_buffer)
        let out_buffer = writeMetadata(uint8buffer,{
            tEXt: {
                SOURCE:json,
            }
        })
        let url = buffer_to_dataurl(out_buffer,"image/png")
        force_download(url,"image.png")
    }

    export_json(buffer) {
        let data = JSON.stringify(buffer)
        let url = 'data:application/json;base64,' + btoa(data)
        force_download(url,'image.json')
    }

}
