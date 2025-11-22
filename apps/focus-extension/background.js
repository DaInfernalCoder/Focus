console.log('Focus App background script loaded')

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus App installed!')
  // Initialize storage
  chrome.storage.local.set({ 
    blockedSites: [],
    isBlocked: false,
    temporarilyUnlocked: []
  })
})

// Listen for changes to blocked sites or temporarily unlocked sites
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local') {
    if (changes.blockedSites || changes.temporarilyUnlocked) {
      const { blockedSites = [], temporarilyUnlocked = [] } = await chrome.storage.local.get(['blockedSites', 'temporarilyUnlocked'])
      updateBlockingRules(blockedSites, temporarilyUnlocked)
    }
  }
})

// Listen for temporary unlock messages from blocked.html
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'temporaryUnlock' && request.site) {
    handleTemporaryUnlock(request.site)
      .then(() => sendResponse({ success: true }))
      .catch(error => {
        console.error('Error handling temporary unlock:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Indicates we will send a response asynchronously
  }
})

// Handle temporary unlock for a specific site
async function handleTemporaryUnlock(site) {
  const { temporarilyUnlocked = [] } = await chrome.storage.local.get(['temporarilyUnlocked'])
  
  // Add site to temporarily unlocked list if not already there
  if (!temporarilyUnlocked.includes(site)) {
    temporarilyUnlocked.push(site)
    await chrome.storage.local.set({ temporarilyUnlocked })
    console.log(`Temporarily unlocked: ${site}`)
  }
}

// Update blocking rules based on sites list, filtering out temporarily unlocked sites
async function updateBlockingRules(sites, temporarilyUnlocked = []) {
  // Get current rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingRuleIds = existingRules.map(rule => rule.id)

  // Remove all existing rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds
  })

  // Filter out temporarily unlocked sites
  const sitesToBlock = sites.filter(site => !temporarilyUnlocked.includes(site))

  // If no sites to block, we're done
  if (!sitesToBlock || sitesToBlock.length === 0) {
    console.log('No sites to block')
    return
  }

  // Create new blocking rules
  const rules = sitesToBlock.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { 
      type: 'redirect',
      redirect: { 
        url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(site)
      }
    },
    condition: {
      urlFilter: `*://*.${site}/*`,
      resourceTypes: ['main_frame']
    }
  }))

  // Add new rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules
  })

  console.log(`Blocking ${sitesToBlock.length} sites:`, sitesToBlock)
  if (temporarilyUnlocked.length > 0) {
    console.log(`Temporarily unlocked: ${temporarilyUnlocked.join(', ')}`)
  }
}

// Initialize blocking on startup
chrome.storage.local.get(['blockedSites', 'temporarilyUnlocked'], (data) => {
  if (data.blockedSites) {
    updateBlockingRules(data.blockedSites, data.temporarilyUnlocked || [])
  }
})