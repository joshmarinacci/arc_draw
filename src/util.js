export function bufferToBlob(buffer, type) {
    let final_blob = new Blob([buffer],{type:type})
    return final_blob
}
