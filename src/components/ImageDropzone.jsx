import { useRef, useState } from 'react'
import { uploadImagesToCloudinary } from '../lib/cloudinary'
import { optimizeImage } from '../lib/format'
import './ImageDropzone.css'

/**
 * Drag-and-drop (or click-to-browse) multi-image uploader backed by Cloudinary.
 * Props: value: string[] of image URLs · onChange(urls)
 */
export default function ImageDropzone({ value = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState([])
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  // Always read the latest list so edits made during an upload aren't overwritten.
  const valueRef = useRef(value)
  valueRef.current = value
  const uploading = progress.length > 0

  async function handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setError('')
    setProgress(files.map(() => 0))
    try {
      const urls = await uploadImagesToCloudinary(files, (i, pct) =>
        setProgress((prev) => prev.map((p, idx) => (idx === i ? pct : p)))
      )
      onChange([...valueRef.current, ...urls])
    } catch (err) {
      setError(err.message || 'Upload failed. Check your Cloudinary preset.')
    } finally {
      setProgress([])
    }
  }

  const removeAt = (idx) => onChange(value.filter((_, i) => i !== idx))

  function moveTo(from, to) {
    if (to < 0 || to >= value.length) return
    const next = [...value]
    next.splice(to, 0, next.splice(from, 1)[0])
    onChange(next)
  }

  return (
    <div className="dropzone-wrap">
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), inputRef.current?.click())}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />
        {uploading ? (
          <div className="dropzone__status">
            <p>Uploading {progress.length} photo{progress.length > 1 ? 's' : ''}…</p>
            <div className="dropzone__bars">
              {progress.map((pct, i) => (
                <div key={i} className="dropzone__bar"><div className="dropzone__bar-fill" style={{ width: `${pct}%` }} /></div>
              ))}
            </div>
          </div>
        ) : (
          <p>
            <strong>{value.length ? '+ Add more photos' : 'Drag & drop photos here'}</strong>
            <br />or click to browse. You can pick several at once.
            <br />The first photo is the cover; buyers see all of them when they open the product.
          </p>
        )}
      </div>

      {error && <p className="field-error">{error}</p>}

      {value.length > 0 && (
        <div className="image-grid">
          {value.map((url, idx) => (
            <div className="image-tile" key={url}>
              <img src={optimizeImage(url, 300)} alt={`Photo ${idx + 1}`} loading="lazy" />
              {idx === 0 ? (
                <span className="image-tile__cover">Cover</span>
              ) : (
                <button type="button" className="image-tile__make-cover" onClick={() => moveTo(idx, 0)}>★ Set as cover</button>
              )}
              <div className="image-tile__actions">
                <button type="button" onClick={() => moveTo(idx, idx - 1)} disabled={idx === 0} aria-label="Move left">←</button>
                <button type="button" onClick={() => removeAt(idx)} className="image-tile__remove" aria-label="Remove photo">✕</button>
                <button type="button" onClick={() => moveTo(idx, idx + 1)} disabled={idx === value.length - 1} aria-label="Move right">→</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
