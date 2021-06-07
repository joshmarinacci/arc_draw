import {hsl_to_css} from './ColorPickerButton.js'

const LATEST_BUFFER_KEY = "LATEST_BUFFER_KEY"

export class Buffer {
    constructor(w, h) {
        this.width = w
        this.height = h
        this.data = new Array(w * h)
        this.data.fill(0)
        this.fgcolor = {
            h: 0.2,
            s: 0.5,
            l: 0.5
        }
        this.bgcolor = {
            h: 0.2,
            s: 0.0,
            l: 1.0
        }
    }

    setPixel(pt, value) {
        if (pt.x < 0) return this
        if (pt.y < 0) return this
        if (pt.x >= this.width) return this
        if (pt.y >= this.height) return this

        let n = pt.y * this.width + pt.x
        if(this.data[n] === value) return this
        this.data[n] = value
        return this.clone()
    }

    getPixel(pt) {
        let n = pt.y * this.width + pt.x
        return this.data[n]
    }

    clone() {
        let buf = new Buffer(this.width, this.height)
        buf.data = this.data
        buf.fgcolor = this.fgcolor
        buf.bgcolor = this.bgcolor
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
        } catch (e) {
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

    set_bg_color(c) {
        let buf = this.clone()
        buf.bgcolor = c
        return buf
    }

    shift(dx, dy) {
        const wrap = (v, max) => {
            if (v < 0) return v + max
            if (v >= max) return v % max
            return v
        }
        let data = this.data.slice()
        data.fill(0)
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let n1 = this.width * y + x
                let v = this.data[n1]
                let x2 = wrap(x + dx, this.width)
                let y2 = wrap(y + dy, this.height)
                let n2 = this.width * y2 + x2
                data[n2] = v
            }
        }
        let buf = new Buffer(this.width, this.height)
        buf.fgcolor = this.fgcolor
        buf.bgcolor = this.bgcolor
        buf.data = data
        buf.persist()
        return buf
    }

    persist() {
        localStorage.setItem(LATEST_BUFFER_KEY, JSON.stringify(this))
    }

    export_png(scale) {
        // console.log("exporting at scale",scale)
        let canvas = document.createElement("canvas")
        canvas.width = this.width * scale
        canvas.height = this.height * scale
        this.draw(canvas, scale, false)
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
        console.log('data', btoa(data))
        const a = document.createElement('a')
        a.href = 'data:application/json;base64,' + btoa(data)
        a.download = 'image.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    draw(canvas, scale, draw_grid) {
        let c = canvas.getContext('2d')
        c.fillStyle = 'white'
        c.fillRect(0, 0, canvas.width, canvas.height)
        c.fillStyle = hsl_to_css(this.bgcolor)
        c.fillRect(0, 0, this.width * scale, this.height * scale)
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let v = this.getPixel({x: x, y: y})
                this.draw_pixel(c, x, y, v, scale)
            }
        }
        if (draw_grid) this.draw_grid(c, scale)

        c.strokeStyle = 'black'
        c.strokeRect(0, 0, this.width * scale, this.height * scale)
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
        let color = hsl_to_css(this.fgcolor)
        c.beginPath()
        if (v === 0) {
            c.fillStyle = hsl_to_css(this.bgcolor)
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

    draw_grid(c, scale) {
        //draw grid
        c.lineWidth = 0.5
        c.beginPath()
        for (let x = 0; x < this.width; x++) {
            c.moveTo(x * scale, 0)
            c.lineTo(x * scale, this.height * scale)
        }
        for (let y = 0; y < this.height; y++) {
            c.moveTo(0, y * scale)
            c.lineTo(this.width * scale, y * scale)
        }
        c.stroke()
    }
}
