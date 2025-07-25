chrome.runtime.onInstalled.addListener(()=>{console.log("Spotify Lyrics Extension installed")});chrome.runtime.onMessage.addListener((e,s,n)=>{e.action==="getSongInfo"&&n({success:!0})});
