import React, { useState, useEffect, FC, useRef } from 'react';
import playIcon from '../../../img/play_m.png';
import pauseIcon from '../../../img/pause_m.png';

interface Props {
  url: string;
}

const AudioPlayer: FC<Props> = (props: Props) => {
  const { url } = props;
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef(null);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (audioRef) {
      playing ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [playing]);

  const imgStyle = {
    height: '30px',
    width: '30px',
    opacity: '0.6',
  };
  return (
    <>
      <button onClick={toggle} className="mr-2 outline-none focus:outline-none">
        {playing ? (
          <>
            <img src={chrome.runtime.getURL(pauseIcon)} style={imgStyle} />
          </>
        ) : (
          <>
            <img src={chrome.runtime.getURL(playIcon)} style={imgStyle} />
          </>
        )}
      </button>
      <audio style={{ display: 'none' }} src={url} ref={audioRef}></audio>
    </>
  );
};

export default AudioPlayer;
