
const STORAGE_KEYS = {
  NOTES: 'devdeck_notes',
  BOOKMARKS: 'devdeck_bm'
};

const SEARCH_PROVIDERS = {
  google: query => `https://www.google.com/search?q=${query}`,
  so: query => `https://stackoverflow.com/search?q=${query}`,
  mdn: query => `https://developer.mozilla.org/en-US/search?q=${query}`,
  gh: query => `https://github.com/search?q=${query}`,
  fg: query => `https://www.figma.com/search?q=${query}`
};

const PREFIX_MAP = {
  'gh:': 'gh',
  'so:': 'so',
  'mdn:': 'mdn',
  'fg:': 'fg'
};

const appState = {
  bookmarks: [],
  notes: ''
};

function hydrateState() {
  appState.notes = localStorage.getItem(STORAGE_KEYS.NOTES) || '';
  try {
    const cachedBm = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    appState.bookmarks = cachedBm ? JSON.parse(cachedBm) : [];
  } catch (err) {
    console.error('Failed to parse cached bookmarks:', err);
    appState.bookmarks = [];
  }
}

function persistBookmarks() {
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(appState.bookmarks));
}

function refreshClockDisplays() {
  const localEl = document.getElementById('localClock');
  const utcEl = document.getElementById('utcClock');
  const currentDate = new Date();

  localEl.textContent = currentDate.toLocaleTimeString();
  utcEl.textContent = `${currentDate.toISOString().slice(11, 16)} UTC`;
}

function executeSearch() {
  const inputEl = document.getElementById('searchInput');
  const providerSelect = document.getElementById('engineSelect');

  let rawQuery = inputEl.value.trim();
  let selectedEngine = providerSelect.value;

  if (!rawQuery) return;
  
  for (const [prefix, engineKey] of Object.entries(PREFIX_MAP)) {
    if (rawQuery.startsWith(prefix)) {
      selectedEngine = engineKey;
      rawQuery = rawQuery.slice(prefix.length).trim();
      break;
    }
  }

  const encodedQuery = encodeURIComponent(rawQuery);
  const targetResolver = SEARCH_PROVIDERS[selectedEngine] || SEARCH_PROVIDERS.google;

  window.open(targetResolver(encodedQuery), '_blank');
}


function renderBookmarkList() {
  const container = document.getElementById('bookmarkList');
  container.replaceChildren();

  appState.bookmarks.forEach((item, idx) => {
    let hostname = 'link';
    try {
      hostname = new URL(item.url).hostname;
    } catch {}

    const listRow = document.createElement('li');
    listRow.className = 'bookmark-item';

    const anchor = document.createElement('a');
    anchor.href = item.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.className = 'bookmark-anchor';

    const favicon = document.createElement('img');
    favicon.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    favicon.alt = '';
    favicon.width = 16;
    favicon.height = 16;

    const label = document.createElement('span');
    label.textContent = item.name;

    anchor.appendChild(favicon);
    anchor.appendChild(label);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'delete-bm-btn';
    removeBtn.title = 'Delete bookmark';
    removeBtn.innerHTML = '&times;';
    removeBtn.dataset.index = idx;

    listRow.appendChild(anchor);
    listRow.appendChild(removeBtn);
    container.appendChild(listRow);
  });
}

function handleDataExport() {
  const jsonStr = JSON.stringify(appState, null, 2);
  const dataBlob = new Blob([jsonStr], { type: 'application/json' });
  const objectUrl = URL.createObjectURL(dataBlob);

  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = objectUrl;
  downloadAnchor.download = `devdeck-config-${Date.now()}.json`;
  downloadAnchor.click();

  URL.revokeObjectURL(objectUrl);
}

function handleDataImport() {
  const filePicker = document.createElement('input');
  filePicker.type = 'file';
  filePicker.accept = 'application/json';

  filePicker.addEventListener('change', (e) => {
    const targetFile = e.target.files[0];
    if (!targetFile) return;

    const fileReader = new FileReader();
    fileReader.onload = (evt) => {
      try {
        const importedData = JSON.parse(evt.target.result);
        
        if (typeof importedData.notes === 'string') {
          appState.notes = importedData.notes;
          localStorage.setItem(STORAGE_KEYS.NOTES, appState.notes);
          document.getElementById('scratchPad').value = appState.notes;
        }

        if (Array.isArray(importedData.bookmarks)) {
          appState.bookmarks = importedData.bookmarks;
          persistBookmarks();
          renderBookmarkList();
        }
      } catch (err) {
        console.error('Import Error:', err);
      }
    };
    fileReader.readAsText(targetFile);
  });

  filePicker.click();
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateState();
  
  const notesField = document.getElementById('scratchPad');
  notesField.value = appState.notes;
  notesField.addEventListener('input', (e) => {
    appState.notes = e.target.value;
    localStorage.setItem(STORAGE_KEYS.NOTES, appState.notes);
  });
  
  document.getElementById('newBookmarkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('bmTitle');
    const urlInput = document.getElementById('bmTargetUrl');

    let validUrl = urlInput.value.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = `https://${validUrl}`;
    }

    appState.bookmarks.push({ name: titleInput.value.trim(), url: validUrl });
    persistBookmarks();
    renderBookmarkList();

    titleInput.value = '';
    urlInput.value = '';
  });
  
  document.getElementById('bookmarkList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-bm-btn');
    if (!deleteBtn) return;

    const deleteIndex = parseInt(deleteBtn.dataset.index, 10);
    if (!isNaN(deleteIndex)) {
      appState.bookmarks.splice(deleteIndex, 1);
      persistBookmarks();
      renderBookmarkList();
    }
  });
  
  document.getElementById('searchTriggerBtn').addEventListener('click', executeSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });
  
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
  });
  
  document.getElementById('exportConfigBtn').addEventListener('click', handleDataExport);
  document.getElementById('importConfigBtn').addEventListener('click', handleDataImport);
  
  renderBookmarkList();
  refreshClockDisplays();
  setInterval(refreshClockDisplays, 1000);
});
