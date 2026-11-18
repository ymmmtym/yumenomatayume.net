import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { prepareSearchBody } from './searchBody.ts'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:search-bodies'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/**
 * Strip each article's frontmatter and HTML at build time so the Worker never
 * runs the Markdown parser per request.
 */
export function buildSearchBodies(contentDir: string, onRead?: (path: string) => void): Record<string, string> {
  const bodies: Record<string, string> = {}
  for (const file of readdirSync(contentDir)) {
    const match = /^(.*)\.(md|mdx)$/.exec(file)
    if (!match) continue
    const path = join(contentDir, file)
    onRead?.(path)
    const source = readFileSync(path, 'utf8')
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
    bodies[match[1]] = prepareSearchBody(body)
  }
  return bodies
}

export function searchBodiesPlugin(contentDir: string): Plugin {
  return {
    name: 'search-bodies',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      return `export default ${JSON.stringify(buildSearchBodies(contentDir, path => this.addWatchFile(path)))}`
    }
  }
}
