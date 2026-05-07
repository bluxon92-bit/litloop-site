#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/export-reading-lists.js
//
// Exports all reading lists from Supabase into _data/reading_lists/<slug>.json
// Run once to seed, re-run whenever lists change.
//
// Usage:
//   SUPABASE_URL=https://... SUPABASE_ANON_KEY=... node scripts/export-reading-lists.js
//
// Or add to package.json:
//   "export-lists": "node scripts/export-reading-lists.js"
// ─────────────────────────────────────────────────────────────────────────────

const https  = require('https')
const fs     = require('fs')
const path   = require('path')

const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://afwvsrjbaxutfonmmxjd.supabase.co'
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
const OUTPUT_DIR    = path.join(__dirname, '..', '_data', 'reading_lists')

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_ANON_KEY environment variable is required.')
  process.exit(1)
}

function supabaseFetch(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path)
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      }
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

async function main() {
  console.log('Fetching reading lists from Supabase…')

  // 1. Get all lists
  const lists = await supabaseFetch('/rest/v1/reading_lists?select=id,slug,title,description&order=title')
  if (!Array.isArray(lists)) {
    console.error('Unexpected response for reading_lists:', lists)
    process.exit(1)
  }
  console.log(`Found ${lists.length} reading lists`)

  // 2. Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // 3. For each list, fetch books with full details
  for (const list of lists) {
    console.log(`  Exporting: ${list.title} (${list.slug})…`)

    const items = await supabaseFetch(
      `/rest/v1/reading_list_books` +
      `?select=position,books(title,author,ol_key,cover_url,cover_id,isbn,description,first_publish_year)` +
      `&list_id=eq.${list.id}` +
      `&order=position`
    )

    if (!Array.isArray(items)) {
      console.warn(`  Warning: unexpected response for ${list.slug}, skipping`)
      continue
    }

    const books = items
      .filter(item => item.books && item.books.title)
      .map(item => ({
        rank:        item.position,
        title:       item.books.title,
        author:      item.books.author || '',
        ol_key:      item.books.ol_key || null,
        cover_url:   item.books.cover_url || null,
        cover_id:    item.books.cover_id || null,
        isbn:        item.books.isbn || null,
        description: item.books.description || null,
        year:        item.books.first_publish_year || null,
        // Derive a slug for future book detail pages
        slug:        slugify(item.books.title, item.books.author),
      }))

    const output = {
      slug:        list.slug,
      title:       list.title,
      description: list.description || '',
      book_count:  books.length,
      books,
    }

    const outPath = path.join(OUTPUT_DIR, `${list.slug}.json`)
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
    console.log(`  ✓ ${list.slug}.json (${books.length} books)`)
  }

  // 4. Write an index file listing all lists (used by Jekyll genre index page)
  const index = lists.map(l => ({
    slug:        l.slug,
    title:       l.title,
    description: l.description || '',
  }))
  const indexPath = path.join(OUTPUT_DIR, '_index.json')
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
  console.log(`\n✓ Written _index.json`)
  console.log(`✓ Done. Files in: ${OUTPUT_DIR}`)
}

function slugify(title, author) {
  const base = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return base
}

main().catch(err => {
  console.error('Export failed:', err)
  process.exit(1)
})
