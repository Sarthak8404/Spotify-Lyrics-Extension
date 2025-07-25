// Content script for additional Spotify page interactions
console.log('Spotify Lyrics Extension content script loaded');

// You can add listeners for page changes or song switches here
let currentSong = '';

const checkForSongChange = () => {
  const titleEl = document.querySelector('[data-testid="context-item-info-title"] a');
  const newSong = titleEl?.textContent?.trim() || '';
  
  if (newSong && newSong !== currentSong) {
    currentSong = newSong;
    // Notify background script or popup about song change
    chrome.runtime.sendMessage({ action: 'songChanged', song: newSong });
  }
};

// Check for song changes every 5 seconds
setInterval(checkForSongChange, 5000);