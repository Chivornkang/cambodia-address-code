// Generates public/sitemap.xml and public/robots.txt before every build.
// Site URL comes from VITE_SITE_URL (env or .env).
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let site = process.env.VITE_SITE_URL
if (!site && existsSync(join(root, '.env'))) {
  site = readFileSync(join(root, '.env'), 'utf8').match(/^VITE_SITE_URL=(.+)$/m)?.[1]?.trim()
}
site = (site || 'https://cambodia-explorer.vercel.app').replace(/\/$/, '')

const today = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: '/', pr: '1.0' },
  { loc: '/provinces', pr: '0.9' },
]
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const dir = join(root, 'public/data/p')
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const p = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  urls.push({ loc: `/province/${slug(p.en)}`, pr: '0.8' })
  for (const d of p.d) {
    urls.push({ loc: `/district/${slug(p.en)}/${slug(d.en)}`, pr: '0.6' })
    for (const c of d.c) urls.push({ loc: `/commune/${c.code}`, pr: '0.4' })
  }
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${site}${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.pr}</priority></url>`).join('\n') +
  `\n</urlset>\n`
writeFileSync(join(root, 'public/sitemap.xml'), xml)
writeFileSync(join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)
console.log(`seo: ${urls.length} URLs → sitemap.xml (${site})`)
