import {hsl_to_css} from './ColorPickerButton.js'

const LATEST_BUFFER_KEY = "LATEST_BUFFER_KEY"

export class Buffer {
    constructor(w, h) {
        this.version = 1
        this.width = w
        this.height = h
        this.data = new Array(w * h)
        this.data.fill(0)
        this.fgcolor = {
            h: 0.2,
            s: 0.5,
            l: 0.5
        }
        this.fgeffect = {
            spread:0,
            angle:0,
        }
        this.bgcolor = {
            h: 0.2,
            s: 0.0,
            l: 1.0
        }
        this.bgeffect = {
            spread:0,
            angle:0,
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
        buf.fgcolor = {...this.fgcolor}
        buf.bgcolor = {...this.bgcolor}
        buf.fgeffect = {...this.fgeffect}
        buf.bgeffect = {...this.bgeffect}
        buf.persist()
        return buf
    }

    restore() {
        const res = localStorage.getItem(LATEST_BUFFER_KEY)
        try {
            if (res) {
                let obj = JSON.parse(res)
                return this.clone_from_json(obj)
            }
        } catch (e) {
            console.log(e)
            return this
        }
        return this
    }

    clear() {
        this.data.fill(0)
        return this.clone()
    }

    set_fg_color(c) {
        let buf = this.clone()
        buf.fgcolor = c
        buf.persist()
        return buf
    }


    set_fg_effect(effect) {
        let buf = this.clone()
        buf.fgeffect = {...effect}
        buf.persist()
        return buf
    }


    set_bg_color(c) {
        let buf = this.clone()
        buf.bgcolor = c
        buf.persist()
        return buf
    }

    set_bg_effect(effect) {
        let buf = this.clone()
        buf.bgeffect = {...effect}
        buf.persist()
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
        buf.fgeffect = {...this.fgeffect}
        buf.bgcolor = this.bgcolor
        buf.bgeffect = {...this.bgeffect}
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
        buf.fgeffect = {...this.fgeffect}
        buf.bgcolor = this.bgcolor
        buf.bgeffect = {...this.bgeffect}
        buf.data = data
        buf.persist()
        return buf
    }

    resize(w,h) {
        let buf = new Buffer(w,h)
        buf.fgcolor = this.fgcolor
        buf.fgeffect = {...this.fgeffect}
        buf.bgcolor = this.bgcolor
        buf.bgeffect = {...this.bgeffect}
        return buf
    }

    persist() {
        localStorage.setItem(LATEST_BUFFER_KEY, JSON.stringify(this))
    }


    clone_from_json(json) {
        if(!json.version) {
            json.version = 0
        }
        if(json.version === 0) {
            json.fgeffect = {spread:0,angle:0}
            json.bgeffect = {spread:0,angle:0}
            json.version++
        }
        let buf = new Buffer(json.width,json.height)
        buf.data = json.data
        if(json.fgcolor) buf.fgcolor = json.fgcolor
        if(json.bgcolor) buf.bgcolor = json.bgcolor
        if(json.fgeffect) buf.fgeffect = json.fgeffect
        if(json.bgeffect) buf.bgeffect = json.bgeffect
        return buf
    }
}
