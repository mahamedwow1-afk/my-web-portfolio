#!/usr/bin/env node
/**
 * Fetches GitHub user profile and repos data
 * Usage: node scripts/fetch-github.mjs [output-path]
 * Optional: GITHUB_TOKEN env var for higher rate limits
 */

import https from 'node:https'

const USERNAME = 'mahamedwow1-afk'
const DEFAULT_OUTPUT = 'src/data/github.json'

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
    req.on('error', reject)
  })
}

async function main() {
  const outputPath = process.argv[2] || DEFAULT_OUTPUT

  console.log(`Fetching GitHub data for ${USERNAME}...`)

  try {
    const [user, repos] = await Promise.all([
      fetchJson(`https://api.github.com/users/${USERNAME}`),
      fetchJson(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated&direction=desc&type=owner`)
    ])

    const profile = {
      name: user.name || user.login,
      bio: user.bio || '',
      location: user.location || '',
      avatarUrl: user.avatar_url,
      githubUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      repos: repos
        .filter(r => !r.fork && r.language !== null)
        .map(r => ({
          name: r.name,
          description: r.description || 'No description',
          htmlUrl: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
          updatedAt: r.pushed_at.split('T')[0]
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    }

    const fs = await import('node:fs')
    fs.mkdirSync(new URL(outputPath).pathname.split('/').slice(0, -1).join('/') || '.', { recursive: true })
    fs.writeFileSync(new URL(outputPath), JSON.stringify(profile, null, 2), 'utf-8')
    console.log(`Written to ${outputPath}`)
    console.log(`  Repos: ${profile.repos.length}`)
    console.log(`  Name: ${profile.name}`)
  } catch (err) {
    console.error('Fetch failed:', err.message)
    console.log('Using fallback data from src/data/profile.ts')
    process.exit(1)
  }
}

main()
