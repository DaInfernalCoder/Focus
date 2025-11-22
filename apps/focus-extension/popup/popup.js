// Elements
const addBtn = document.getElementById('addBtn')
const addForm = document.getElementById('addForm')
const siteInput = document.getElementById('siteInput')
const saveBtn = document.getElementById('saveBtn')
const cancelBtn = document.getElementById('cancelBtn')
const siteList = document.getElementById('siteList')

// Load sites when popup opens
loadSites()

// Show add form
addBtn.addEventListener('click', () => {
  addForm.classList.add('active')
  siteInput.focus()
})

// Hide add form
cancelBtn.addEventListener('click', () => {
  addForm.classList.remove('active')
  siteInput.value = ''
})

// Add site
saveBtn.addEventListener('click', async () => {
  const site = siteInput.value.trim().toLowerCase()
  if (site) {
    await addSite(site)
    siteInput.value = ''
    addForm.classList.remove('active')
  }
})

// Enter key to save
siteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveBtn.click()
  }
})

// Load sites from Chrome storage
async function loadSites() {
  const { blockedSites = [] } = await chrome.storage.local.get(['blockedSites'])
  
  siteList.innerHTML = ''
  
  if (blockedSites.length === 0) {
    siteList.innerHTML = '<div class="empty-state">No sites blocked yet.<br>Click + to add one.</div>'
    return
  }
  
  blockedSites.forEach(site => {
    addSiteToList(site)
  })
}

// Add site to storage and UI
async function addSite(site) {
  const { blockedSites = [] } = await chrome.storage.local.get(['blockedSites'])
  
  // Don't add duplicates
  if (blockedSites.includes(site)) {
    alert('Site already blocked!')
    return
  }
  
  blockedSites.push(site)
  await chrome.storage.local.set({ blockedSites })
  
  addSiteToList(site)
}

// Remove site from storage and UI
async function removeSite(site) {
  const { blockedSites = [] } = await chrome.storage.local.get(['blockedSites'])
  const updatedSites = blockedSites.filter(s => s !== site)
  await chrome.storage.local.set({ blockedSites: updatedSites })
}

// Add site to UI list
function addSiteToList(site) {
  // Remove empty state if present
  const emptyState = siteList.querySelector('.empty-state')
  if (emptyState) {
    emptyState.remove()
  }

  const item = document.createElement('div')
  item.className = 'site-item'
  item.innerHTML = `
    <div class="site-name">${site}</div>
    <button class="remove-btn">×</button>
  `

  // Remove button
  item.querySelector('.remove-btn').addEventListener('click', async () => {
    await removeSite(site)
    item.remove()
    
    // Show empty state if no sites left
    if (siteList.children.length === 0) {
      siteList.innerHTML = '<div class="empty-state">No sites blocked yet.<br>Click + to add one.</div>'
    }
  })

  siteList.appendChild(item)
}

console.log('Popup loaded!')