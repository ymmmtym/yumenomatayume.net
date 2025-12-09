import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const IMAGES_DIR = './public/images'
const CONTENT_DIR = './app/content'

async function uploadAndReplace() {
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))

  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file)
    console.log(`\n📤 Uploading: ${file}...`)
    
    const result = spawnSync('bun', ['scripts/upload-single.ts', filePath], {
      encoding: 'utf-8',
      env: process.env
    })
    
    if (result.status !== 0) {
      console.error(`❌ Failed: ${file}`)
      console.error(result.stderr)
      continue
    }
    
    const { url: newUrl, existing } = JSON.parse(result.stdout.trim())
    
    if (existing) {
      console.log(`♻️  Already exists: ${newUrl}`)
    } else {
      console.log(`✅ Uploaded: ${newUrl}`)
    }
    
    // Find files that reference this image
    const oldUrl = `/images/${file}`
    const referencingFiles: string[] = []
    
    function searchFiles(dir: string) {
      const files = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const f of files) {
        const fullPath = path.join(dir, f.name)
        
        if (f.isDirectory()) {
          searchFiles(fullPath)
        } else if (/\.(md|mdx)$/i.test(f.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          if (content.includes(oldUrl)) {
            referencingFiles.push(fullPath)
            // Replace URL
            const newContent = content.replaceAll(oldUrl, newUrl)
            fs.writeFileSync(fullPath, newContent)
          }
        }
      }
    }
    
    searchFiles(CONTENT_DIR)
    
    if (referencingFiles.length > 0) {
      console.log(`📝 Referenced in:`)
      referencingFiles.forEach(f => console.log(`   - ${f}`))
    } else {
      console.log(`🧹  Not referenced in any files`)
    }
  }

  console.log('\n✨ Done!')
}

uploadAndReplace().catch(console.error)
