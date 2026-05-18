// Local Netlify build plugin: purge Cloudflare cache after a successful deploy.
// Requires Netlify env var CLOUDFLARE_API_TOKEN (zone-scoped, cache:purge).

module.exports = {
  onSuccess: async ({ inputs, utils }) => {
    const token = process.env.CLOUDFLARE_API_TOKEN
    const zoneId = inputs.zoneId

    if (!token) {
      console.log('[cf-purge] CLOUDFLARE_API_TOKEN not set; skipping purge')
      return
    }
    if (!zoneId) {
      console.log('[cf-purge] zoneId input missing; skipping')
      return
    }

    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
    })
    const data = await res.json()

    if (!data.success) {
      utils.build.failPlugin(`Cloudflare purge failed: ${JSON.stringify(data.errors)}`)
    } else {
      console.log(`[cf-purge] zone ${zoneId} cache purged`)
    }
  },
}
