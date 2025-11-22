// Load scripts using extension URLs
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL(src)
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Main application code
function runMain() {
  // Get site from URL parameter
  const params = new URLSearchParams(window.location.search)
  const site = params.get('site')
  
  if (site) {
    document.getElementById('siteName').textContent = site
  }

  let currentToken = null
  let pollInterval = null
  let countdownInterval = null
  let expiresAt = null

  // Clear this site from temporarilyUnlocked on page load
  async function clearTemporaryUnlock() {
    try {
      const { temporarilyUnlocked = [] } = await chrome.storage.local.get(['temporarilyUnlocked'])
      const updated = temporarilyUnlocked.filter(s => s !== site)
      await chrome.storage.local.set({ temporarilyUnlocked: updated })
    } catch (error) {
      console.error('Error clearing temporary unlock:', error)
    }
  }

  // Generate UUID token
  function generateToken() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Create token in Supabase
  async function createToken() {
    const token = generateToken()
    const expiresAt = new Date(Date.now() + CONFIG.QR_EXPIRY_MINUTES * 60 * 1000)
    
    try {
      const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/unlock_tokens`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          token: token,
          expires_at: expiresAt.toISOString(),
          consumed: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create token: ${response.status} ${errorText}`)
      }

      return { token, expiresAt }
    } catch (error) {
      console.error('Error creating token:', error)
      showStatus('error', 'Failed to generate QR code. Please try again.')
      throw error
    }
  }

  // Generate QR code
  function generateQRCode(token) {
    const qrUrl = `${CONFIG.WEB_APP_URL}/unlock?token=${encodeURIComponent(token)}`
    const qrElement = document.getElementById('qrcode')
    
    // Clear existing QR code
    qrElement.innerHTML = ''
    
    // Generate new QR code
    new QRCode(qrElement, {
      text: qrUrl,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })
  }

  // Update countdown timer
  function updateCountdown() {
    if (!expiresAt) return
    
    const now = new Date()
    const remaining = expiresAt - now
    
    if (remaining <= 0) {
      document.getElementById('countdown').textContent = 'QR code expired'
      document.getElementById('countdown').classList.add('expiring')
      stopPolling()
      showStatus('error', 'QR code has expired. Generate a new one to continue.')
      document.getElementById('refreshBtn').classList.remove('hidden')
      return
    }
    
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    document.getElementById('countdown').textContent = `Expires in: ${minutes}m ${seconds}s`
    
    if (remaining < 60000) {
      document.getElementById('countdown').classList.add('expiring')
    }
  }

  // Check if token is consumed
  async function checkTokenConsumption() {
    if (!currentToken) return

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/rest/v1/unlock_tokens?token=eq.${encodeURIComponent(currentToken)}&select=consumed`,
        {
          method: 'GET',
          headers: {
            'apikey': CONFIG.SUPABASE_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to check token: ${response.status}`)
      }

      const data = await response.json()
      
      if (data && data.length > 0 && data[0].consumed === true) {
        // Token consumed! Unlock the site
        stopPolling()
        showStatus('success', 'Site unlocked! Refreshing...')
        
        // Send message to background.js to temporarily unlock
        chrome.runtime.sendMessage({
          action: 'temporaryUnlock',
          site: site
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError)
            showStatus('error', 'Failed to unlock site. Please try again.')
          } else {
            // Wait a moment for rules to update, then try to navigate
            setTimeout(() => {
              // Try to navigate to the site (will work now that it's unlocked)
              // Use https by default, fallback to http
              const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
              window.location.href = `${protocol}//${site}`
            }, 500)
          }
        })
      }
    } catch (error) {
      console.error('Error checking token consumption:', error)
      // Don't show error to user for polling errors, just log
    }
  }

  // Start polling
  function startPolling() {
    if (pollInterval) return
    
    pollInterval = setInterval(checkTokenConsumption, CONFIG.POLL_INTERVAL)
    countdownInterval = setInterval(updateCountdown, 1000)
  }

  // Stop polling
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  // Show status message
  function showStatus(type, message) {
    const statusEl = document.getElementById('status')
    statusEl.className = `status ${type}`
    statusEl.textContent = message
    statusEl.classList.remove('hidden')
  }

  // Initialize
  async function init() {
    // Clear temporary unlock for this site
    await clearTemporaryUnlock()
    
    // Show loading status
    showStatus('loading', 'Generating QR code...')
    
    try {
      // Create token and get expiry
      const { token, expiresAt: exp } = await createToken()
      currentToken = token
      expiresAt = exp
      
      // Generate QR code
      generateQRCode(token)
      
      // Start polling and countdown
      startPolling()
      updateCountdown()
      
      // Hide loading status
      document.getElementById('status').classList.add('hidden')
    } catch (error) {
      console.error('Initialization error:', error)
      document.getElementById('refreshBtn').classList.remove('hidden')
    }
  }

  // Start initialization
  init()

  // Add refresh button event listener
  const refreshBtn = document.getElementById('refreshBtn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      location.reload()
    })
  }
}

// Load scripts sequentially, then run main code
Promise.all([
  loadScript('lib/qrcode.js'),
  loadScript('config.js')
]).then(() => {
  // Scripts loaded, now run the main code
  runMain()
}).catch(error => {
  console.error('Error loading scripts:', error)
  const statusEl = document.getElementById('status')
  if (statusEl) {
    statusEl.textContent = 'Error loading extension scripts'
    statusEl.classList.remove('hidden')
    statusEl.className = 'status error'
  }
})

