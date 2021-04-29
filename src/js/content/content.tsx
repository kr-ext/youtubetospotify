import React from 'react';
import { render } from 'react-dom';
import App from './App';
import ModalDialogInYouTube from './dialog/ModalDialogInYouTube';
import { paradify, contentUtil } from '../utils';

const injectParadifyAddContainer = () => {
  if (
    window.location.href.indexOf('youtube.com/watch') > -1 &&
    window.location.href.indexOf('music.youtube.com') === -1
  ) {
    const containerName = 'paradify-container-in-youtube';
    if (window.document.getElementById(containerName)) {
      return;
    }
    const paradifyMainContainer = window.document.createElement('div');
    paradifyMainContainer.id = containerName;
    paradifyMainContainer.className = containerName;

    window.document.body.appendChild(paradifyMainContainer);

    render(
      <App />,
      window.document.getElementById(containerName),
      // eslint-disable-next-line func-names
      function () {
        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const spotifyButton = window.document.getElementById(containerName)
            .firstChild;

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const ytPlayerMenuDiv = window.document.querySelector(
            '.ytp-chrome-controls .ytp-right-controls',
          );

          if (!ytPlayerMenuDiv) {
            iconCannotBeLoaded('spotifyIconCannotloaded-YTBarNotExist', null);
            throw new Error('spotifyIconCannotloaded-YTBarNotExist');
          }

          ytPlayerMenuDiv.insertBefore(
            spotifyButton as Node,
            ytPlayerMenuDiv.firstChild,
          );
        } catch (err) {
          console.log('paradify icon cannot be loaded', err);
          iconCannotBeLoaded(
            'spotifyIconCannotloadedInYTPlayer',
            err.toString(),
          );
          //try loading in another side.
          try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const spotifyButton = window.document.getElementById(containerName)
              .firstChild;

            (spotifyButton as HTMLButtonElement).classList.add(
              'spotify-button-in-owner',
            );

            const videoOwnerDiv = document.querySelector(
              'ytd-video-owner-renderer',
            );
            //add it next to owner
            if (videoOwnerDiv) {
              videoOwnerDiv.appendChild(spotifyButton);
            }
            //otherwise make it absolute
            else {
              const paradifyButtonAbsolute = window.document.createElement(
                'div',
              );
              paradifyButtonAbsolute.id =
                'paradify-container-in-youtube-absolute';
              paradifyButtonAbsolute.className =
                'paradify-container-in-youtube-absolute';

              document.body.appendChild(paradifyButtonAbsolute);
              paradifyButtonAbsolute.appendChild(spotifyButton);
            }
          } catch (err) {
            console.log(
              'paradify icon cannot be loaded in owner or absolute',
              err,
            );
            iconCannotBeLoaded('spotifyIconCannotloadedInBody', err.toString());
          }
        }
        // injectSpotifyIconOnThumbnails();
      },
    );
  } else {
    // injectSpotifyIconOnThumbnails();
  }
};

const injectDialogWindow = () => {
  const dialogName = 'p-d-paradify-dialog-in-youtube';

  //Create dialog
  const dialog = window.document.createElement('div');
  dialog.className = dialogName;
  dialog.id = dialogName;

  window.document.body.appendChild(dialog);
  render(<ModalDialogInYouTube />, window.document.getElementById(dialogName));
};

const loadInjection = () => {
  injectParadifyAddContainer();
  injectDialogWindow();
};

function recommendedVideosMutationStart(targetNode: any) {
  // Your code here...

  if (!targetNode) {
    console.log('no target node found');
    return;
  }

  let globalObserver = null;
  const config = { attributes: false, subtree: false, childList: true };
  const callback = (mutationList: any) => {
    for (const mutation of mutationList) {
      mutation.addedNodes.forEach((node: any) => {
        console.log({ node });
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
          console.log('no thumbnail found => ', title);
        }
      });

      // globalObserver.disconnect();
      // break;
    }
  };

  globalObserver = new MutationObserver(callback);
  globalObserver.observe(targetNode, config);
}

function addIconOnRecommendedVideos() {
  let tried = 0;
  const contents = setInterval(function () {
    const targetNode = document.querySelector(
      'ytd-watch-next-secondary-results-renderer > #items > ytd-item-section-renderer > #contents',
    );

    if (targetNode !== null || tried >= 15) {
      clearInterval(contents);
      recommendedVideosMutationStart(targetNode);
    }
    tried++;
    console.log(tried);
  }, 100);
}

const onLoad = () => {
  paradify.pageLoad();

  setTimeout(() => {
    //when the page is loaded
    loadInjection();
    //when the title is changed
    contentUtil.youTubeTitle(() => {
      loadInjection();
    });
    // addIconOnRecommendedVideos();
  }, 1000);
};

const iconCannotBeLoaded = (type: string, detailedError?: string) => {
  try {
    //GA
    chrome.runtime.sendMessage({
      type,
      data: {
        pageName: 'YouTube',
        eventCategory: 'YouTube Video',
        eventAction: 'Spotify Icon Cannot be Loaded in YT Player',
        eventLabel: detailedError,
      },
    });
  } catch {}
};

window.addEventListener('load', onLoad, false);
