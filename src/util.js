export function canvas_to_blob(canvas) {
    return new Promise((res,rej)=>{
        canvas.toBlob(blob => {
            res(blob)
        })
    })
}

export function buffer_to_dataurl(buffer, type) {
    let final_blob = new Blob([buffer],{type:type})
    return URL.createObjectURL(final_blob)
}

export function force_download(url, filename) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

