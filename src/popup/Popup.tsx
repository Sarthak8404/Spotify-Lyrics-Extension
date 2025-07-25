import React, { useState, useEffect } from 'react';
import { Music, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getSongInfo, tryGetLyricsFromPage, fetchLyricsFromAPI, SongInfo, LyricsData } from '../utils/spotify';
import './Popup.css';

const Popup: React.FC = () => {
  const [songInfo, setSongInfo] = useState<SongInfo>({ title: null, artist: null });
  const [lyrics, setLyrics] = useState<string>('');
  const [backstory, setBackstory] = useState<string>('');
  const [mood, setMood] = useState<string>('neutral');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showBackstory, setShowBackstory] = useState<boolean>(false);

  useEffect(() => {
    loadSongData();
  }, []);

  const loadSongData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current song info
      const info = await getSongInfo();
      setSongInfo(info);

      if (!info.title || !info.artist) {
        setError('No song detected. Please make sure Spotify is open and playing.');
        setLoading(false);
        return;
      }

      // Try to get lyrics directly from Spotify page
      const scrapedLyrics = await tryGetLyricsFromPage();
      if (scrapedLyrics) {
        setLyrics(scrapedLyrics);
        setBackstory('Loaded directly from Spotify page.');
        setMood('neutral');
        setLoading(false);
        return;
      }

      // Fallback to API
      const data = await fetchLyricsFromAPI(info.title, info.artist);
      if (data.error) {
        setError(data.error);
      } else {
        setLyrics(data.lyrics || 'Lyrics not available.');
        setBackstory(data.backstory || 'No backstory available.');
        setMood(data.mood || 'neutral');
      }
    } catch (err) {
      setError('Failed to load song data. Please try again.');
      console.error('Error loading song data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodClassName = (mood: string) => {
    return `mood-tag mood-${mood.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading-state">
          <Loader2 className="loading-icon" />
          <p>Loading song info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-container">
        <div className="error-state">
          <AlertCircle className="error-icon" />
          <p>{error}</p>
          <button onClick={loadSongData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="header">
        <Music className="header-icon" />
        <h1>Spotify Lyrics</h1>
      </div>

      <div className="song-info">
        <h2 className="song-title">{songInfo.title}</h2>
        <p className="song-artist">{songInfo.artist}</p>
        <span className={getMoodClassName(mood)}>{mood}</span>
      </div>

      <div className="lyrics-section">
        <h3>Lyrics</h3>
        <div className="lyrics-content">
          {lyrics}
        </div>
      </div>

      {backstory && (
        <div className="backstory-section">
          <div className="backstory-header">
            <h3>Backstory</h3>
            <button 
              onClick={() => setShowBackstory(!showBackstory)}
              className="toggle-button"
            >
              {showBackstory ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showBackstory && (
            <div className="backstory-content">
              {backstory}
            </div>
          )}
        </div>
      )}

      <button onClick={loadSongData} className="refresh-button">
        Refresh
      </button>
    </div>
  );
};

export default Popup;