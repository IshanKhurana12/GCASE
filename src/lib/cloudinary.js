const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const MAX_MB = 10

function uploadOne(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!CLOUD || !PRESET) return reject(new Error('Cloudinary is not configured. Check your .env file.'))
    if (file.size > MAX_MB * 1024 * 1024) return reject(new Error(`${file.name} is larger than ${MAX_MB} MB.`))

    const body = new FormData()
    body.append('file', file)
    body.append('upload_preset', PRESET)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText || '{}')
      xhr.status === 200 ? resolve(res.secure_url) : reject(new Error(res.error?.message || 'Upload failed.'))
    }
    xhr.onerror = () => reject(new Error('Network error while uploading.'))
    xhr.send(body)
  })
}

/** Uploads in parallel. onProgress(index, percent). Resolves to secure URLs in order. */
export const uploadImagesToCloudinary = (files, onProgress) =>
  Promise.all(files.map((f, i) => uploadOne(f, (pct) => onProgress(i, pct))))
