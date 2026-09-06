// Application State
const state = {
  bookmarks: [],
  notes: ''
};

// LocalStorage Handlers
function loadState() {
  state.notes = localStorage.getItem('devdeck_notes') || '';
  try {
    state.bookmarks = JSON.parse(localStorage.getItem('devdeck_bm') || '[]');
  } catch {
    state.bookmarks = [];
  }
}

function saveBookmarks() {
  localStorage.setItem('devdeck_bm', JSON.stringify(state.bookmarks));
}

// Clock Updater
function updateClocks() {
  const now = new Date();
  document.getElementById('clockLocal').textContent = now.toLocaleTimeString();
  document.getElementById('clockUtc').textContent = `${now.toISOString().slice(11, 16)} UTC`;
}

// Search Handler
function handleSearch() {
  const queryInput = document.getElementById('queryInput');
  const engineSelect = document.getElementById('searchEngine');

  let query = queryInput.value.trim();
  let engine = engineSelect.value;
  if (!query) return;

  const prefixes = { 'gh:': 'gh', 'so:': 'so', 'mdn:': 'mdn', 'fg:': 'fg' };
  for (const prefix in prefixes) {
    if (query.startsWith(prefix)) {
      engine = prefixes[prefix];
      query = query.slice(prefix.length).trim();
      break;
    }
  }

  const encoded = encodeURIComponent(query);
  const targets = {
    google: `https://www.google.com/search?q=${encoded}`,
    so: `https://stackoverflow.com/search?q=${encoded}`,
    mdn: `https://developer.mozilla.org/en-US/search?q=${encoded}`,
    gh: `https://github.com/search?q=${encoded}`,
    fg: `https://www.figma.com/search?q=${encoded}`
  };

  window.open(targets[engine] || targets.google, '_blank');
}

// Render Bookmarks List
function renderBookmarks() {
  const listEl = document.getElementById('bookmarkList');
  listEl.innerHTML = '';

  state.bookmarks.forEach((bm, index) => {
    let hostname = 'link';
    try { 
      hostname = new URL(bm.url).hostname; 
    } catch {}

    const li = document.createElement('li');
    li.className = 'bm-item';
    li.innerHTML = `
      <a href="${bm.url}" target="_blank" class="bm-link">
        <img src="https://www.google.com/s2/favicons?domain=${hostname}&sz=32" alt="">
        <span>${bm.name}</span>
      </a>
      <button class="remove-bm" title="Delete bookmark">&times;</button>
    `;

    li.querySelector('.remove-bm').addEventListener('click', () => {
      state.bookmarks.splice(index, 1);
      saveBookmarks();
      renderBookmarks();
    });

    listEl.appendChild(li);
  });
}

// Export / Import Data
function exportData() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'devdeck-backup.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed.notes === 'string') {
          state.notes = parsed.notes;
          localStorage.setItem('devdeck_notes', state.notes);
          document.getElementById('notesArea').value = state.notes;
        }
        if (Array.isArray(parsed.bookmarks)) {
          state.bookmarks = parsed.bookmarks;
          saveBookmarks();
          renderBookmarks();
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  fileInput.click();
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Notes setup
  const notesArea = document.getElementById('notesArea');
  notesArea.value = state.notes;
  notesArea.addEventListener('input', () => {
    state.notes = notesArea.value;
    localStorage.setItem('devdeck_notes', state.notes);
  });

  // Bookmark Form setup
  document.getElementById('addBookmarkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('bmName');
    const urlInput = document.getElementById('bmUrl');

    let url = urlInput.value.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    state.bookmarks.push({ name: nameInput.value.trim(), url });
    saveBookmarks();
    renderBookmarks();

    nameInput.value = '';
    urlInput.value = '';
  });

  // Search Listeners
  document.getElementById('btnSearch').addEventListener('click', handleSearch);
  document.getElementById('queryInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Keyboard Shortcut: Cmd/Ctrl + K focus
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('queryInput').focus();
    }
  });

  // Export / Import Listeners
  document.getElementById('btnExport').addEventListener('click', exportData);
  document.getElementById('btnImport').addEventListener('click', importData);

  // Initial Runs
  renderBookmarks();
  updateClocks();
  setInterval(updateClocks, 1000);
});
