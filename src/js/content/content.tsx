import {
  consoleLog,
  contentUtil,
  isYouTubeMusic,
  isYouTubeVideo,
  paradify,
} from '../utils';

import App from './App';
import ModalDialogInYouTube from './dialog/ModalDialogInYouTube';
import React from 'react';
import { render } from 'react-dom';

let countTryOfSpotifyIconInject = 1;
const injectTryCount = 10;
const injectTryTimeout = 1000;

const loadSearchResult = () => {
  try {
    setTimeout(() => {
      document.body.appendChild(
        document.querySelector('#paradify-search-result-container'),
      );
    }, 2000);
  } catch (error) {
    searchResultCannotLoaded('searchResultCannotLoaded', error.toString());
    consoleLog({
      message: 'paradify search result container cannot be loaded in body',
      error,
    });
  }
};

const loadButtonInAbsolute = (spotifyButton: Element) => {
  if (
    !window.document.getElementById('paradify-container-in-youtube-absolute')
  ) {
    const paradifyButtonAbsolute = window.document.createElement('div');
    paradifyButtonAbsolute.id = 'paradify-container-in-youtube-absolute';
    paradifyButtonAbsolute.className = 'paradify-container-in-youtube-absolute';

    document.body.appendChild(paradifyButtonAbsolute);
    paradifyButtonAbsolute.appendChild(spotifyButton);
  }
};

const loadButtonInOwner = (spotifyButton: Element) => {
  if (
    window.document.querySelector('ytd-video-owner-renderer > #paradify') ||
    !spotifyButton
  ) {
    return;
  }

  (spotifyButton as HTMLButtonElement).classList.add('spotify-button-in-owner');

  const videoOwnerDivs = document.querySelectorAll('ytd-video-owner-renderer');

  //add it next to owner
  if (videoOwnerDivs && videoOwnerDivs.length > 0) {
    videoOwnerDivs.forEach((video) => {
      video.appendChild(spotifyButton);
    });
  } else {
    throw new Error('spotifyIconCannotloaded-InOwner');
  }
};

const createParadifyContainerIfNotExist = (containerName: string) => {
  if (!window.document.getElementById(containerName)) {
    const paradifyMainContainer = window.document.createElement('div');
    paradifyMainContainer.id = containerName;
    paradifyMainContainer.className = containerName;

    window.document.body.appendChild(paradifyMainContainer);
  }
};

const injectParadifyAddContainer = () => {
  const containerName = 'paradify-container-in-youtube';
  if (window.document.getElementById(containerName)) {
    return;
  }

  if (isYouTubeVideo()) {
    createParadifyContainerIfNotExist(containerName);
    render(
      <App />,
      window.document.getElementById(containerName),
      // eslint-disable-next-line func-names
      () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const spotifyButton = window.document.querySelector(
          `.${containerName} > button#paradify`,
        );

        try {
          if (
            window.document.querySelector('.ytp-right-controls > #paradify') ||
            !spotifyButton
          ) {
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const ytPlayerMenuDiv = window.document.querySelector(
            '.ytp-right-controls',
          );

          if (!ytPlayerMenuDiv) {
            iconCannotBeLoaded(
              `spotifyIconCannotloaded-YTBarNotExist-${countTryOfSpotifyIconInject}-try`,
              null,
            );

            if (countTryOfSpotifyIconInject <= injectTryCount) {
              countTryOfSpotifyIconInject++;
              setTimeout(() => {
                injectParadifyAddContainer();
              }, injectTryTimeout);
              return;
            } else {
              throw new Error('spotifyIconCannotloaded-YTBarNotExist');
            }
          }

          ytPlayerMenuDiv.insertBefore(
            spotifyButton as Node,
            ytPlayerMenuDiv.firstChild,
          );
        } catch (error) {
          consoleLog({
            message: 'paradify icon cannot be loaded in TY Player.',
            error,
          });

          iconCannotBeLoaded(
            'spotifyIconCannotloadedInYTPlayer',
            error.toString(),
          );

          //try loading in another side.
          try {
            loadButtonInOwner(spotifyButton);
          } catch (error) {
            iconCannotBeLoaded(
              'spotifyIconCannotloadedInOwner',
              error.toString(),
            );

            try {
              loadButtonInAbsolute(spotifyButton);
            } catch {
              iconCannotBeLoaded(
                'spotifyIconCannotloadedInAbsolute',
                error.toString(),
              );
            }
          }
        }

        loadSearchResult();
      },
    );
  } else if (isYouTubeMusic()) {
    createParadifyContainerIfNotExist(containerName);
    render(
      <App />,
      window.document.getElementById(containerName),
      // eslint-disable-next-line func-names
      () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const spotifyButton = window.document.querySelector(
          `.${containerName} > button#paradify`,
        );
        try {
          if (
            window.document.querySelector(
              '.right-controls-buttons > #paradify',
            ) ||
            !spotifyButton
          ) {
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const ytPlayerMenuDiv = window.document.querySelector(
            '.right-controls-buttons',
          );

          if (!ytPlayerMenuDiv) {
            iconCannotBeLoaded(
              `spotifyIconCannotloaded-Music-YTBarNotExist-${countTryOfSpotifyIconInject}-try`,
              null,
            );

            if (countTryOfSpotifyIconInject <= injectTryCount) {
              countTryOfSpotifyIconInject++;
              setTimeout(() => {
                injectParadifyAddContainer();
              }, injectTryTimeout);
              return;
            } else {
              throw new Error('spotifyIconCannotloaded-YTBarNotExist');
            }
          }

          // spotifyButton.setAttribute('style', 'width: 40px;height: 40px;');
          ytPlayerMenuDiv.insertBefore(
            spotifyButton as Node,
            ytPlayerMenuDiv.firstChild,
          );
        } catch (error) {
          consoleLog({
            message: 'paradify icon cannot be loaded in TY Music Player.',
            error,
          });
          iconCannotBeLoaded(
            'spotifyIconCannotloadedInYTMusicPlayer',
            error.toString(),
          );

          //try loading in another side.
          try {
            loadButtonInAbsolute(spotifyButton);
          } catch (error) {
            consoleLog({
              message: 'paradify icon cannot be loaded in absolute- Music',
              error,
            });
            iconCannotBeLoaded(
              'spotifyIconCannotloadedInBodyInMusic',
              error.toString(),
            );
          }
        }

        loadSearchResult();
      },
    );
  }
};

const injectDialogWindow = () => {
  const dialogName = 'p-d-paradify-dialog-in-youtube';
  if (!window.document.getElementById(dialogName)) {
    //Create dialog
    const dialog = window.document.createElement('div');
    dialog.className = dialogName;
    dialog.id = dialogName;

    window.document.body.appendChild(dialog);
    render(
      <ModalDialogInYouTube />,
      window.document.getElementById(dialogName),
    );
  }
};

const loadInjection = () => {
  injectParadifyAddContainer();
  injectDialogWindow();
};

function recommendedVideosMutationStart(targetNode: any) {
  // Your code here...

  if (!targetNode) {
    consoleLog({ message: 'no target node found' });
    return;
  }

  let globalObserver = null;
  const config = { attributes: false, subtree: false, childList: true };
  const callback = (mutationList: any) => {
    for (const mutation of mutationList) {
      mutation.addedNodes.forEach((node: any) => {
        const title = node.querySelector('#video-title');

        const thumbnail = node.querySelector('ytd-thumbnail');
        if (thumbnail) {
          const div = document.createElement('div');
          // const img = document.createElement('img');
          // img.src =
          //   'chrome-extension://khpifnkcammomhfjcpomgmgamgpkepdo/media/spotify.png';
          // img.style.width = '20px';
          // img.style.height = '20px';
          div.className = 'paradify-small-icon-container';
          // div.appendChild(img);
          thumbnail.appendChild(div);
          render(<App />, div);

          // node.addEventListener(
          //   'mouseover',
          //   function (event) {
          //     div.style.display = 'block';
          //   },
          //   false,
          // );
          // node.addEventListener(
          //   'mouseleave',
          //   function (event) {
          //     div.style.display = 'none';
          //   },
          //   false,
          // );
        } else {
          consoleLog({ message: 'no thumbnail found => ', title });
        }
      });

      // globalObserver.disconnect();
      // break;
    }
  };

  globalObserver = new MutationObserver(callback);
  globalObserver.observe(targetNode, config);
}

const onLoad = () => {
  paradify.pageLoad();

  setTimeout(() => {
    //when the page is loaded
    loadInjection();
    //when the title is changed
    contentUtil.youTubeTitle(() => {
      loadInjection();
      chrome.runtime.sendMessage({
        type: 'youtubeVideoChanged',
      });
    });
  }, 1000);
};

const iconCannotBeLoaded = (type: string, detailedError?: string) => {
  try {
    //GA
    chrome.runtime.sendMessage({
      type: 'spotifyIconCannotLoaded',
      data: {
        pageName: 'YouTube',
        eventCategory: 'YouTube Video',
        eventAction: type,
        eventLabel: detailedError,
      },
    });
  } catch {}
};

const searchResultCannotLoaded = (type: string, detailedError?: string) => {
  try {
    //GA
    chrome.runtime.sendMessage({
      type: 'searchResultCannotLoaded',
      data: {
        pageName: 'YouTube',
        eventCategory: 'YouTube Video',
        eventAction: type,
        eventLabel: detailedError,
      },
    });
  } catch {}
};

window.addEventListener('load', onLoad, false);
