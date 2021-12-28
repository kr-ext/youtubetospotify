import { DOMAINS, ENVIRONMENTS, WEB_SITE_URL } from '../../../utils';

const URLS = {
  EXTENSION_NAME: 'Paradify - YouTube To Spotify',
  UNINSTALL_URL:
    process.env.NODE_ENV === 'production'
      ? `${WEB_SITE_URL.PRODUCTION}/home/UnInstalled`
      : `${WEB_SITE_URL.DEVELOPMENT}/home/UnInstalled`,
  BASE_URL:
    // eslint-disable-next-line no-undef
    process.env.NODE_ENV === 'production'
      ? `${WEB_SITE_URL.PRODUCTION}/api/v2`
      : `${WEB_SITE_URL.DEVELOPMENT}/api/v2`,
  REDIRECT_AUTH_PATH: '/redirect_auth',
  ME_PATH: '/me',
  SEARCH_PATH: '/search',
  AUTO_SEARCH_SAVE_PATH: '/auto-search-save',
  ADD_TRACKS_FROM_PLAYLIST: '/addTracksFromPlaylist',
  ADD_TRACKS_PATH: '/tracks',
  REFRESH_PATH: '/refresh-token',
  DONATION_PAYPAL: 'https://www.patreon.com/volkanakin',
  DONATION_BUY_ME_A_COFFEE: 'https://www.buymeacoffee.com/volkanakin',
  RATE_US:
    'https://chrome.google.com/webstore/detail/paradify-youtube-to-spoti/bocdilfmhiggklhdifohjfghbdncgele',
};

const getRedirectAuthUrl = (): string =>
  `${URLS.BASE_URL}${URLS.REDIRECT_AUTH_PATH}`;

const getSearchUrl = (): string => `${URLS.BASE_URL}${URLS.SEARCH_PATH}`;

const getMeUrl = (): string => `${URLS.BASE_URL}${URLS.ME_PATH}`;

const getAutoSearchAndSaveUrl = (): string =>
  `${URLS.BASE_URL}${URLS.AUTO_SEARCH_SAVE_PATH}`;

const addTracksFromPlaylist = (): string =>
  `${URLS.BASE_URL}${URLS.ADD_TRACKS_FROM_PLAYLIST}`;

const getAddTracksUrl = (): string => `${URLS.BASE_URL}${URLS.ADD_TRACKS_PATH}`;

const getRefreshUrl = (): string => `${URLS.BASE_URL}${URLS.REFRESH_PATH}`;

const supportedWebsite = {
  href: 'https://www.youtube.com/',
  name: 'YouTube',
};

const TIMEOUT_MS = 6000;

const SAVED_COUNT = 'SAVED_COUNT';
const DONATION_SHOW_SAVED_COUNTS = [5, 15, 30, 60, 100, 150, 200];
const SPOTIFY_ICON_CLICK_ACTION_OPTION = 'SPOTIFY_ICON_CLICK_ACTION_OPTION';
const SPOTIFY_TOKEN = 'SPOTIFY_TOKEN';
const DEPLOYMENT = 'DEPLOYMENT';
const DEPLOYMENT_VERSION = 20210501;
const EXTENSION_INSTALLED = 'EXTENSION_INSTALLED';
const OPTION_HIGHLIGHTED = 'OPTION_HIGHLIGHTED';
const IS_GIF_DISABLED = 'IS_GIF_DISABLED';

export {
  getRedirectAuthUrl,
  getSearchUrl,
  getMeUrl,
  getAutoSearchAndSaveUrl,
  addTracksFromPlaylist,
  getAddTracksUrl,
  getRefreshUrl,
  supportedWebsite,
  TIMEOUT_MS,
  SAVED_COUNT,
  SPOTIFY_ICON_CLICK_ACTION_OPTION,
  SPOTIFY_TOKEN,
  DEPLOYMENT,
  DEPLOYMENT_VERSION,
  EXTENSION_INSTALLED,
  OPTION_HIGHLIGHTED,
  URLS,
  ENVIRONMENTS,
  DOMAINS,
  DONATION_SHOW_SAVED_COUNTS,
  IS_GIF_DISABLED,
};
