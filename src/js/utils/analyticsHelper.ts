const autoSaveStarted = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave',
      eventLabel: query,
    },
  });
};

const autoSaveSaved = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Saved',
      eventLabel: query,
    },
  });
};

const autoSaveNotSaved = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Not Saved',
      eventLabel: query,
    },
  });
};

const autoSavePlaylistConfirmation = (playlistName: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Multi',
      eventLabel: playlistName, //playlist name
    },
  });
};

const autoSavePlaylistSaved = (eventLabel: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Multi - Saved',
      eventLabel,
    },
  });
};

const autoSavePlaylistNotSaved = (eventLabel: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Multi - Not Saved',
      eventLabel,
    },
  });
};

const autoSavePlaylistError = (eventLabel: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Multi - Error',
      eventLabel,
    },
  });
};

const autoSaveError = (q: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - AutoSave - Error',
      eventLabel: q,
    },
  });
};

const searchStarted = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - Search',
      eventLabel: query,
    },
  });
};

const searchError = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - Search - Error',
      eventLabel: query,
    },
  });
};

const reSearchStarted = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - ReSearch',
      eventLabel: query,
    },
  });
};

const reSearchError = (label: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - ReSearch - Error',
      eventLabel: label,
    },
  });
};

const openAndSearchInSpotify = (query: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Spotify Icon Clicked - Open&Search',
      eventLabel: query,
    },
  });
};

const errorOnRefreshToken = (): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'Spotify Token',
      eventAction: 'Error On Refreshing Token',
    },
  });
};

export const failedOnRefreshToken = (): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'Spotify Token',
      eventAction: 'Failed On Refreshing Token',
    },
  });
};

const errorOnInterceptAPI = (err: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'Spotify API Intercept',
      eventAction: 'Error On Intercept Spotify API',
      eventLabel: err,
    },
  });
};

const addTracksSuccess = (q: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Add Tracks/Playlist - Success',
      eventLabel: q,
    },
  });
};

const addTracksFailed = (q: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Add Tracks/Playlist - Failed',
      eventLabel: q,
    },
  });
};

const addTracksError = (q: string): void => {
  chrome.runtime.sendMessage({
    type: 'gaSendEvent',
    data: {
      pageName: 'YouTube',
      eventCategory: 'YouTube Video',
      eventAction: 'Add Tracks/Playlist - Error',
      eventLabel: q,
    },
  });
};

const analyticsHelper = {
  autoSaveStarted,
  autoSaveSaved,
  autoSaveNotSaved,
  autoSavePlaylistConfirmation,
  autoSavePlaylistSaved,
  autoSavePlaylistNotSaved,
  autoSavePlaylistError,
  autoSaveError,
  searchStarted,
  reSearchStarted,
  searchError,
  reSearchError,
  openAndSearchInSpotify,
  errorOnRefreshToken,
  failedOnRefreshToken,
  errorOnInterceptAPI,
  addTracksSuccess,
  addTracksFailed,
  addTracksError,
};
export default analyticsHelper;
