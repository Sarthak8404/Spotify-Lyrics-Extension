export interface SongInfo {
  title: string | null;
  artist: string | null;
}

export interface LyricsData {
  lyrics: string;
  backstory: string;
  mood: string;
  error?: string;
}

export async function getSongInfo(): Promise<SongInfo> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        resolve({ title: null, artist: null });
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            try {
              const titleEl = document.querySelector('[data-testid="context-item-info-title"] a');
              const artistEls = document.querySelectorAll('[data-testid="context-item-info-artist"]');
              const title = titleEl?.textContent?.trim() || null;
              const artist = [...artistEls]
                .map(el => el.textContent?.trim())
                .filter(Boolean)
                .join(", ") || null;
              return { title, artist };
            } catch {
              return { title: null, artist: null };
            }
          }
        },
        (results) => {
          resolve(results?.[0]?.result || { title: null, artist: null });
        }
      );
    });
  });
}

export async function tryGetLyricsFromPage(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        resolve(null);
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            try {
              const lines = [...document.querySelectorAll('[data-testid="lyrics-line"]')]
                .map(el => el.textContent?.trim())
                .filter(Boolean);
              return lines.length > 0 ? lines.join("\n") : null;
            } catch {
              return null;
            }
          }
        },
        (results) => {
          resolve(results?.[0]?.result || null);
        }
      );
    });
  });
}

export async function fetchLyricsFromAPI(title: string, artist: string): Promise<LyricsData> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch lyrics from API');
  }
}