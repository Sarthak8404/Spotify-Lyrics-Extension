chrome.runtime.onInstalled.addListener(() => {
  console.log('Spotify Lyrics Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSongInfo') {
    sendResponse({ success: true });
  }
});