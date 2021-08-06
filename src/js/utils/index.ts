import contentUtil from './contentUtil';
import storageUtil from './storageUtil';
import dialogUtils from './dialogUtils';
import analyticsHelper from './analyticsHelper';
import { ENVIRONMENTS } from './constants';
import { TrackObject, TrackResponseObject } from '../interfaces';

const initializeReactGA = (ReactGA: any, pageName: string) => {
  if (process.env.NODE_ENV !== ENVIRONMENTS.PRODUCTION) return;

  ReactGA.initialize('UA-3218083-16');
  ReactGA.set({ anonymizeIp: true });
  ReactGA.set({ checkProtocolTask: () => {} });
  ReactGA.pageview('/' + pageName);

  ReactGA.event({
    category: 'On Site',
    action: `${pageName} page load`,
  });
};

const isYouTubeVideo = (): boolean =>
  window.location.href.indexOf('youtube.com/watch') > -1 &&
  window.location.href.indexOf('music.youtube.com') === -1;

const isYouTubeMusic = (): boolean =>
  window.location.href.indexOf('music.youtube.com/watch') > -1;

const consoleLog = (data: any): void => {
  console.log('%c----------------Paradify----------------', 'color:green');
  console.log(data);
  console.log('%c----------------Paradify----------------', 'color:green');
};

function getPageName(): string {
  let pageName = '';
  if (isYouTubeVideo()) {
    pageName = 'youtube';
  } else if (isYouTubeMusic()) {
    pageName = 'youtubemusic';
  }
  return pageName;
}

function readNowPlayingText(pageName: string): TrackObject {
  if (pageName === 'youtube') {
    return readYoutube();
  } else if (pageName === 'youtubemusic') {
    return readYoutubeMusic();
  } else {
    return null;
  }
}

function readYoutube(): TrackObject {
  const track = document.title.trim().replace(' - YouTube', '');
  return { track, artist: null };
}

function readYoutubeMusic(): TrackObject {
  const track =
    (document.querySelector(
      '#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > yt-formatted-string',
    ) as HTMLElement)?.innerText || '';

  const artist =
    (document.querySelector(
      '#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > span > span.subtitle.style-scope.ytmusic-player-bar > yt-formatted-string > a',
    ) as HTMLElement)?.innerText || '';
  return { track, artist };
}

const paradify = {
  pageLoad: (): void => {
    chrome.runtime.sendMessage({ type: 'clearBadge' });

    const trackInfo = paradify.getTrackInfo();

    if (trackInfo && trackInfo.success) {
      chrome.runtime.sendMessage({ type: 'setBadgeText', data: ' 1 ' });
    }
  },

  getTrackInfo: (): TrackResponseObject => {
    const pageName: string = getPageName();
    const track = readNowPlayingText(pageName);
    const success = track ? true : false;
    const errMessage = track && 'No track info';
    return { track, pageName, success, errMessage };
  },
};

const getSearchTextFromTrackInfo = (
  trackObject: Partial<TrackObject>,
): string => {
  let q = '';
  if (trackObject) {
    q =
      trackObject.track + ' ' + (trackObject.artist ? trackObject.artist : '');
  }

  return q.trim();
};

const getSpotifySearchUrl = (query: string): string => {
  return `https://open.spotify.com/search/${encodeURIComponent(
    query,
  )}?si=bt6xSMatSdSTXt9oCF_O9Q&dl_branch=1`;
};

const getRandomSuccessGif = (): string => {
  const images = [
    'https://media.giphy.com/media/2U0MJobOh2sta/giphy.gif',
    'https://media.giphy.com/media/fxsqOYnIMEefC/giphy.gif',
    'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
  ];
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};

const getRandomFailedGif = (): string => {
  const images = [
    'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif',
    'https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif',
    'https://media.giphy.com/media/3ohs7KViF6rA4aan5u/giphy.gif',
  ];
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};

const getRandomInstalledGif = (): string => {
  const images = [
    'https://media.giphy.com/media/lMameLIF8voLu8HxWV/giphy.gif',
    'https://media.giphy.com/media/l0IygWpszunxnkMAo/giphy.gif',
  ];
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};

const getRandomErrorGif = (): string => {
  const images = [
    'https://media.giphy.com/media/TqiwHbFBaZ4ti/giphy.gif',
    'https://media.giphy.com/media/GoHD0xCYwjM5y/giphy.gif',
  ];
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};

const getRandomDonationGif = (): string => {
  const images = [
    'https://media.giphy.com/media/iFyQMfqxYFhO2b4o3T/giphy.gif',
    'https://media.giphy.com/media/l1KdaNvn6cDYMX3PO/giphy.gif',
  ];
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};

export {
  initializeReactGA,
  getSearchTextFromTrackInfo,
  paradify,
  getSpotifySearchUrl,
  contentUtil,
  storageUtil,
  dialogUtils,
  getRandomSuccessGif,
  getRandomFailedGif,
  getRandomInstalledGif,
  getRandomErrorGif,
  getRandomDonationGif,
  analyticsHelper,
  consoleLog,
  isYouTubeVideo,
  isYouTubeMusic,
};
