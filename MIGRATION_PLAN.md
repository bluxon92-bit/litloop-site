# Litloop SEO Migration Plan
## cabbagetreebooks.com → www.litloop.co

---

## Overview

This document covers how to preserve SEO equity when moving the Cabbage Tree Books content
to the Litloop site. The blog slug format is identical on both sites (`/blog/[slug]/`),
so each individual post URL maps 1-to-1 — this is the best possible scenario for a migration.

---

## Step 1 — Deploy the Litloop site

1. Push the Litloop Jekyll site to a new GitHub repo (e.g. `litloop-co`)
2. In the repo Settings → Pages, set source to `main` branch
3. Add custom domain: `www.litloop.co`
4. The `CNAME` file is already in the repo root
5. In your DNS provider, add:
   ```
   CNAME  www  litloop-co.github.io
   A      @    185.199.108.153   (GitHub Pages IPs)
   A      @    185.199.109.153
   A      @    185.199.110.153
   A      @    185.199.111.153
   ```
6. Enable "Enforce HTTPS" in GitHub Pages settings

---

## Step 2 — Set up 301 redirects on cabbagetreebooks.com

### Option A: Netlify (recommended — free, instant)

Create a `_redirects` file in the Cabbage Tree Books repo root:

```
# Redirect entire site to Litloop, preserving path
https://cabbagetreebooks.com/*  https://www.litloop.co/:splat  301!
https://www.cabbagetreebooks.com/*  https://www.litloop.co/:splat  301!
```

Then change the Cabbage Tree DNS to point to Netlify instead of GitHub Pages.
The `!` forces the redirect even for existing files.

### Option B: GitHub Pages redirect repo

Replace the entire cabbagetreebooks.com repo content with a single `index.html`
and a `_redirects` approach via `jekyll-redirect-from`. For each old URL, add
a redirect page. This is more laborious but works without Netlify.

### Option C: Cloudflare (if using Cloudflare DNS — also free)

In Cloudflare → Rules → Redirect Rules:
- Match: `hostname: cabbagetreebooks.com`
- Action: Dynamic redirect → `concat("https://www.litloop.co", http.request.uri.path)`
- Status: 301

This is the cleanest option and requires zero changes to the old repo.

**Recommendation: Option C (Cloudflare) or A (Netlify)** — both preserve full URL
path structure, so every indexed post URL redirects to the exact same post on Litloop.

---

## Step 3 — Google Search Console

1. **Add `www.litloop.co`** as a new property in Search Console
2. Verify ownership (HTML file method or DNS TXT record)
3. Submit sitemap: `https://www.litloop.co/sitemap.xml`
4. In the **old** `cabbagetreebooks.com` property:
   - Go to Settings → Change of Address
   - Select `www.litloop.co` as the new site
   - Click Validate & Update
5. Keep monitoring both properties for 6 months — Google will transfer ranking
   signals to the new domain over 3–6 months

---

## Step 4 — Canonical tags

Every page on Litloop already has the correct canonical in `_layouts/default.html`:

```html
<link rel="canonical" href="https://www.litloop.co{{ page.url }}">
```

This tells Google which URL to treat as authoritative even before the old URLs
drop out of the index. No action needed.

---

## Step 5 — Update MailerLite

In your MailerLite account:
1. Create a new Waitlist group/form for Litloop signups
2. Replace `waitlist_form_url` in `_config.yml` with the new form embed ID
3. The existing newsletter subscribers from Cabbage Tree Books can be kept in a
   separate group — they signed up for book content, which continues on Litloop

---

## Step 6 — Update Google Analytics

In `_config.yml`, replace `G-XXXXXXXXXX` with the correct GA4 Measurement ID.
The Litloop site should use a **new GA4 property** so you can cleanly track
growth from launch. You can still view old Cabbage Tree data in the old property.

---

## Step 7 — What to do with the old domain

Keep `cabbagetreebooks.com` registered for at least 2 years after migration.
Let the 301 redirects run for the lifetime of the domain. Do NOT let it expire —
if someone else registers it, they could capture your inbound link equity.

---

## URL mapping reference

All 92 blog posts map directly:

| Old URL | New URL |
|---------|---------|
| `cabbagetreebooks.com/blog/[slug]/` | `www.litloop.co/blog/[slug]/` |
| `cabbagetreebooks.com/blog/` | `www.litloop.co/blog/` |
| `cabbagetreebooks.com/genres/fantasy/` | `www.litloop.co/genres/fantasy/` |
| `cabbagetreebooks.com/genres/sci-fi/` | `www.litloop.co/genres/sci-fi/` |
| `cabbagetreebooks.com/genres/horror/` | `www.litloop.co/genres/horror/` |
| `cabbagetreebooks.com/genres/dystopian/` | `www.litloop.co/genres/dystopian/` |
| `cabbagetreebooks.com/tools/quiz/` | `www.litloop.co/tools/quiz/` |
| `cabbagetreebooks.com/tools/name-generator/` | `www.litloop.co/tools/name-generator/` |
| `cabbagetreebooks.com/terms/` | `www.litloop.co/terms/` |
| `cabbagetreebooks.com/cookie-policy/` | `www.litloop.co/cookie-policy/` |

Tools pages (quiz, name generator, reading tracker, prompt generators) from the
old site are included in this repo under `/tools/` — copy them from the old repo
as-is and update any internal links.

---

## Timeline

| Week | Action |
|------|--------|
| 1 | Deploy Litloop site, verify it builds correctly |
| 1 | Set up 301 redirects on cabbagetreebooks.com |
| 1 | Add Litloop to Google Search Console, submit sitemap |
| 1 | Run Change of Address tool in old GSC property |
| 2 | Confirm redirects are working (check with curl or Screaming Frog) |
| 2 | Update MailerLite form URL in _config.yml |
| 4 | Check GSC for crawl errors on new domain |
| 12 | Most PageRank transfer complete — check rankings |
| 26 | Review old property in GSC — traffic should have moved |
