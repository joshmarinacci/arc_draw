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

    invert() {
        let data = this.data.slice()
        data.fill(0)
        function invert_value(v) {
            if(v === 0) return 5
            if(v === 1) return 3
            if(v === 2) return 4
            if(v === 3) return 1
            if(v === 4) return 2
            if(v === 5) return 0
            return v
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let n1 = this.width * y + x
                let v = this.data[n1]
                data[n1] = invert_value(v)
            }
        }
        let buf = new Buffer(this.width, this.height)
        buf.fgcolor = this.fgcolor
        buf.bgcolor = this.bgcolor
        buf.data = data
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

    resize(w,h) {
        let buf = new Buffer(w,h)
        buf.fgcolor = this.fgcolor
        buf.bgcolor = this.bgcolor
        return buf
    }

    persist() {
        localStorage.setItem(LATEST_BUFFER_KEY, JSON.stringify(this))
    }


}
