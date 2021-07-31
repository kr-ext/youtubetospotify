import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import { Service } from 'axios-middleware';
import spotifyImageUrl from '../../img/spotify.png';
import loading from '../../img/loading_animated.gif';
import {
  paradify,
  getSearchTextFromTrackInfo,
  getSpotifySearchUrl,
  storageUtil,
  dialogUtils,
  analyticsHelper,
  consoleLog,
  getRandomSuccessGif,
} from '../utils';

import {
  addTracksFromPlaylist,
  getAddTracksUrl,
  getAutoSearchAndSaveUrl,
  getRefreshUrl,
  getSearchUrl,
} from '../utils/constants';
import { Dialog, Token } from '../interfaces';
import { AudioType, SpotifyOption } from '../enums';
import SearchResult from './dialog/SearchResult';
import './content.css';
import audioDoneUrl from '../../audio/done.mp3';
import audioFailUrl from '../../audio/fail.mp3';

const { getSpotifyToken, getSpotifyOption } = storageUtil;

const SpotifyIconInYouTube: FC = () => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [filteredQuery, setFilteredQuery] = useState<string>(null);
  const [query, setQuery] = useState<string>(null);
  const [showResultDialog, setShowResultDialog] = useState<boolean>(null);

  const resetStates = (): void => {
    dialogUtils.hideDialog();
    setShowResultDialog(false);
    setSearchResult(null);
    setFilteredQuery(null);
    setQuery(null);
  };

  const playAudio = (audioType: AudioType) => {
    let audioUrl: string;

    switch (audioType) {
      case AudioType.SAVED:
        audioUrl = chrome.runtime.getURL(audioDoneUrl);
        break;
      default:
        audioUrl = chrome.runtime.getURL(audioFailUrl);
        break;
    }
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const refreshToken = async (response: any) => {
    const token: Token = await getSpotifyToken();

    return axios
      .get(getRefreshUrl(), {
        headers: {
          refresh_token: token?.refresh_token,
        },
      })
      .then((responseGet: any) => {
        if (
          responseGet &&
          responseGet.data &&
          responseGet.data.body &&
          responseGet.data.body.access_token
        ) {
          const { access_token } = responseGet.data.body;
          const { ...tempToken } = token;
          tempToken.access_token = access_token;
          response.config.headers['access_token'] = tempToken.access_token;
          storageUtil.setSpotifyToken(tempToken);
          return axios.request(response.config);
        } else {
          storageUtil.removeSpotifyToken();
          analyticsHelper.failedOnRefreshToken();
          return Promise.reject();
        }
      })
      .catch((error: any) => {
        analyticsHelper.errorOnRefreshToken();
        return Promise.reject(error);
      });
  };

  const openAuth = async () => {
    chrome.runtime.sendMessage({
      type: 'openAuthRedirectUrl',
    });

    const token = await storageUtil.waitAndGetFirstLoginResponse();
    if (token) {
      const dialog: Dialog = {
        behavior: { autoHide: true },
        message: {
          title: 'Login Successful',
          text: 'You have logged in successfully',
          image: { url: getRandomSuccessGif() },
        },
      };

      const data = {
        data: dialog,
        type: 'showDialog',
      };
      chrome.runtime.sendMessage(data);
    }
  };

  const interceptAxios = () => {
    axios.interceptors.request.use(
      async function (config) {
        const token: Token = await getSpotifyToken();
        config.headers['access_token'] = token?.access_token;
        config.headers['refresh_token'] = token?.refresh_token;
        config.headers['token_type'] = token?.token_type;
        return config;
      },
      function (error) {
        analyticsHelper.errorOnInterceptAPI(error.toString());
        return Promise.reject(error);
      },
    );

    // Add a response interceptor
    axios.interceptors.response.use(
      async function (response) {
        const { data } = response;
        let d = null;
        if (typeof data === 'string') d = JSON.parse(data);
        else d = data;
        if (d.error && d.error.status === 401) {
          if (
            d.error.message.indexOf('Invalid access token') > -1 ||
            d.error.message.indexOf('access token expired') > -1 ||
            d.error.message.indexOf('No token provided') > -1
          ) {
            try {
              return refreshToken(response).catch((error) => {
                openAuth();
                return null;
              });
            } catch (error) {
              openAuth();
              return null;
            }
          } else {
            return response;
          }
        } else return response;
      },
      function (error) {
        analyticsHelper.errorOnInterceptAPI(error.toString());
        return Promise.reject(error);
      },
    );
    // try {
    //   const service = new Service(axios);
    //   service.register({
    //     async onRequest(config: any) {
    //       const token: Token = await getSpotifyToken();
    //       config.headers['access_token'] = token?.access_token;
    //       config.headers['refresh_token'] = token?.refresh_token;
    //       config.headers['token_type'] = token?.token_type;
    //       return config;
    //     },
    //     onResponse(response: any) {
    //       const { data } = response;
    //       let d = null;
    //       if (typeof data === 'string') d = JSON.parse(data);
    //       else d = data;
    //       if (d.error && d.error.status === 401) {
    //         if (d.error.message.indexOf('Invalid access token') > -1) {
    //           return openAuth();
    //         } else if (d.error.message.indexOf('access token expired') > -1) {
    //           return refreshToken(response);
    //         }
    //       } else return response;
    //     },
    //   });
    // } catch (error) {
    //   analyticsHelper.errorOnInterceptAPI(error.toString());
    //   consoleLog({ error });
    // }
  };

  const saved = async (trackIds: string[] = [], playlistUrl: string) => {
    setSearchResult(null);
    let title = '';
    let text = '';

    if (trackIds.length > 0) {
      const s = trackIds.length > 1 ? 's' : '';
      title = `${trackIds.length} track${s} added`;
      text = `${trackIds.length} track${s} added into your Spotify playlist`;
    }

    dialogUtils.saved(title, text, playlistUrl);
    playAudio(AudioType.SAVED);
  };

  const notSaved = (q: string = null) => {
    setSearchResult(null);

    dialogUtils.notSaved(q);
    playAudio(AudioType.NOTSAVED);
  };

  const combineTrackNames = (
    list: Array<{ track: { name: string } }> = [],
    itemLimit = 5,
  ): string => {
    try {
      return list
        .slice(0, itemLimit)
        .map((item) => {
          return `"${item.track.name}"`;
        })
        .join(', ');
    } catch {
      return '';
    }
  };

  const addTracks = async (ids: string[], type: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const url = getAddTracksUrl();
        const response = await axios.post(url, {
          ids,
          type,
        });

        if (response.data?.message === 'OK') {
          const { data: dataResponse } = response;
          const { ids, playlistUrl } = dataResponse;
          resolve(ids);
          resetStates();
          saved(ids, playlistUrl);
          analyticsHelper.addTracksSuccess(query);
        } else {
          reject();
          resetStates();
          notSaved();
          analyticsHelper.addTracksFailed(query);
        }
      } catch (error) {
        setSearchResult(null);
        resetStates();
        dialogUtils.errorInGeneral();
        analyticsHelper.addTracksError(`${query} - ${error.toString()}`);
        consoleLog({ error });
        reject();
      }
    });
  };

  const search = async (q: string) => {
    try {
      setIsSaving(true);
      const url = getSearchUrl();
      const response = await axios.get(url, {
        params: { q },
      });
      const { data } = response;
      setSearchResult(data);
      setFilteredQuery(data.filteredQuery);
      setQuery(q);
      setShowResultDialog(true);
      analyticsHelper.searchStarted(q);

      if (data.message === 'NOTOK') {
        analyticsHelper.searchNotFound(q);
      }
    } catch (error) {
      setIsSaving(false);
      dialogUtils.errorInGeneral();
      analyticsHelper.searchError(`${q} - ${error.toString()}`);
      consoleLog({ error });
    } finally {
      setIsSaving(false);
    }
  };

  const reSearch = async (q: string) => {
    try {
      const url = getSearchUrl();
      const response = await axios.get(url, {
        params: { q },
      });

      const { data } = response;
      setSearchResult(data);
      analyticsHelper.reSearchStarted(q);
      if (data.message === 'NOTOK') {
        analyticsHelper.searchNotFound(q);
      }
    } catch (error) {
      analyticsHelper.reSearchError(`${q} - ${error.toString()}`);
      consoleLog({ error });
    }
  };

  const searchAndSave = async (q: string) => {
    try {
      analyticsHelper.autoSaveStarted(query);
      const url = getAutoSearchAndSaveUrl();
      setIsSaving(true);
      const response = await axios.post(url, null, {
        params: { q },
      });

      if (response.data?.data?.message === 'OK') {
        const { data } = response.data;
        const { trackIds, playlistUrl } = data;
        saved(trackIds, playlistUrl);
        analyticsHelper.autoSaveSaved(q);
      } else if (response.data?.data?.message === 'CONFIRMATION') {
        const { data } = response.data;
        const { type } = data;
        switch (type) {
          case 'playlist':
            const { playlist, playlistTracks } = data;
            const { name: playlistName } = playlist;

            const trackNameString = combineTrackNames(playlistTracks);

            const confirmationText = `A playlist has been found "${playlistName}" and has ${
              playlist.tracks.total
            } tracks in it. Do you want to add ${
              playlist.tracks.total
            } tracks? ${
              trackNameString
                ? 'Some of the track names: ' + trackNameString
                : ''
            }`;

            dialogUtils.confirmationDialog(confirmationText, playlist);

            analyticsHelper.autoSavePlaylistConfirmation(data.name);
            break;
          default:
            notSaved(q);
            break;
        }
      } else {
        notSaved(q);
        analyticsHelper.autoSaveNotSaved(q);
      }
    } catch (error) {
      setIsSaving(false);
      dialogUtils.errorInGeneral();
      analyticsHelper.autoSaveError(`${q} - ${error.toString()}`);
      consoleLog({ error });
    } finally {
      setIsSaving(false);
    }
  };

  const searchStarted = async (query: string) => {
    const token = await getSpotifyToken();
    if (token) {
      await search(query);
    } else {
      await openAuth();
    }
  };

  const autoSaveStarted = async (query: string) => {
    const token = await getSpotifyToken();
    if (token) {
      searchAndSave(query);
    } else {
      openAuth();
    }
  };

  const onClickSpotifyIcon = async (query: string) => {
    const spotifyOption: string = await getSpotifyOption();

    switch (spotifyOption) {
      case SpotifyOption.AutoSave:
        await autoSaveStarted(query);
        break;
      case SpotifyOption.Search:
        await searchStarted(query);
        break;
      default:
        await openAndSearchInSpotify(query);
        break;
    }
  };

  const openAndSearchInSpotify = (query: string): void => {
    window.open(getSpotifySearchUrl(query), '_blank');
    analyticsHelper.openAndSearchInSpotify(query);
  };

  const showNoTitle = () => {
    dialogUtils.showNoTitle();
  };

  const addAll = async (data: any) => {
    try {
      const url = addTracksFromPlaylist();
      setIsSaving(true);
      const response = await axios.post(url, {
        id: data.id,
        type: data.type,
      });
      if (response.data?.data?.message === 'OK') {
        const { data: dataResponse } = response.data;
        const { trackIds, playlistUrl } = dataResponse;
        saved(trackIds, playlistUrl);
        analyticsHelper.autoSavePlaylistSaved(data.name); //playlist name
      } else {
        notSaved();
        analyticsHelper.autoSavePlaylistNotSaved(data.name); //playlist name
      }
    } catch (error) {
      dialogUtils.errorInGeneral();
      analyticsHelper.autoSavePlaylistError(
        `${data.name} - ${error.toString()}`,
      ); //playlist name
      consoleLog({ error });
    } finally {
      setIsSaving(false);
    }
  };

  const onClick = () => {
    resetStates();
    const trackInfo = paradify.getTrackInfo();
    const query = getSearchTextFromTrackInfo(trackInfo.track);
    if (query.length === 0) {
      showNoTitle();
      return;
    } else {
      onClickSpotifyIcon(query);
    }
  };

  useEffect(() => {
    interceptAxios();
    chrome.runtime.onMessage.addListener(function (event) {
      if (event.type === 'dialogAddAll') {
        addAll(event.data);
      } else if (event.type === 'SpotifyIconClickAction') {
        onClick();
      }
    });
  }, []);

  return (
    <>
      <button
        id="paradify"
        className="spotify-button-in-yt-player playerButton ytp-button"
        onClick={() => {
          onClick();
        }}
        disabled={isSaving}
        draggable="false"
        title="Add to Spotify"
      >
        <div className="div-spotify-icon">
          {isSaving ? (
            <img
              src={chrome.runtime.getURL(loading)}
              width="100%"
              height="100%"
              title="Saving"
              className="img-spotify-icon"
            />
          ) : (
            <img
              src={chrome.runtime.getURL(spotifyImageUrl)}
              width="100%"
              height="100%"
              title="Add to Spotify"
              className="img-spotify-icon"
            />
          )}
        </div>
      </button>
      <div id="paradify-search-result-container">
        {showResultDialog && (
          <SearchResult
            result={searchResult}
            addTrack={addTracks}
            close={() => {
              setSearchResult(null);
              setShowResultDialog(false);
            }}
            reSearch={reSearch}
            filteredQuery={filteredQuery}
            showResultDialog={showResultDialog}
          />
        )}
      </div>
    </>
  );
};

export default SpotifyIconInYouTube;
