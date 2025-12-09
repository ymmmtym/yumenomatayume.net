import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const file = process.argv[2]
if (!file) {
  console.error('Usage: bun run upload-single.ts <filepath>')
  process.exit(1)
}

const beforeUpload = Date.now()

const result = await cloudinary.uploader.upload(file, {
  folder: process.env.CLOUDINARY_FOLDER || 'yumenomatayume.net',
  use_filename: true,
  unique_filename: false
})

const createdAt = new Date(result.created_at).getTime()
const existing = (beforeUpload - createdAt) > 5000

// Generate URL with f_auto,q_auto
const urlWithOptimization = cloudinary.url(result.public_id, {
  fetch_format: 'auto',
  quality: 'auto',
  secure: true
})

console.log(JSON.stringify({ url: urlWithOptimization, existing }))
