import React, {
  useState, useRef, useCallback, useEffect,
} from 'react';
import styled from 'styled-components';
import ReactPlayer from 'react-player';
import 'react-spring-bottom-sheet/dist/style.css';

import {
  faPlayCircle, faPauseCircle, faSquareUpRight,
  faStepBackward, faStepForward, faAngleDown, faAngleUp,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ApiResponse, CraftBlock, CraftTextBlockInsert } from '@craftdocs/craft-extension-api';
import CraftAPIHelper from '../../api/craftAPIHelper';
import { PortalMainStore } from '../../Types';
import usePortalStore from '../../store/store';
import { getFormattedTime } from '../../utils/time';
import withOpacity from '../../utils/colors';
import { insertNewBlock, navigateToBlock } from '../../utils/block';

interface ISeekContainerProps {
  $videoPlayerMinimized: boolean,
}

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledMediaControlsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
  -webkit-user-select: none;

  > div {
    flex-grow: 1.1;
  }
`;

type FilterIconProps = {
  $isWeb: boolean;
};

const StyledFilterIconContainer = styled.div<FilterIconProps>`
  align-items: center;
  cursor: ${(props) => (props.$isWeb ? 'pointer' : 'default')};
  display: flex;
  width: 30px;
  height: 28px;
  justify-content: center;
  border-radius: 5px;
  -webkit-user-select: none;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }
`;

const StyledFilterIcon = styled(FontAwesomeIcon)<FilterIconProps>`
  color: ${(props) => props.theme.iconColor};
  height: 14px;
  transition: color 200ms ease-in;
`;

const StyledReactPlayer = styled(ReactPlayer)`
  padding: 10px;
  padding-bottom: 0px;
  padding-top: 0px;
`;

const StyledPlaceholderDiv = styled.div`
  padding: 10px;
  padding-bottom: 0px;
  padding-top: 0px;
  height: 150px;
`;

const StyledSeekContainer = styled.div<ISeekContainerProps>`
  width: 100%;
  padding: ${(props) => (props.$videoPlayerMinimized ? '0px' : '5px')};
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0.5;
  tranistion: all 300ms ease-in;
  height: 28px;

  &:hover {
    opacity: 0.8;
  }

  > input[type=range]:focus {
    outline: none;
  }

  > input[type='range'] {
    -webkit-appearance: none;
    background-color: #ddd;
    height: 5px;
    cursor: pointer;
    overflow: hidden;
  }
  
  > input[type='range']::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    height: 5px;
    cursor: pointer;
    left: 5px;
  }
  
  > input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    background: ${(props) => props.theme.accentColor};
    border-radius: 50%;
    box-shadow: -405px 0 0 403px ${(props) => withOpacity(props.theme.accentColor, 50)};
    cursor: pointer;
    height: 5px;
    width: 5px;
    border: 0;
  }}
`;

const StyledInputSeek = styled.input`
  width: 100%;
`;

const StyledPlaybackSpeedContainer = styled.div<FilterIconProps>`
  flex-grow: 1.1;
  padding: 5px;
  transition: color 200ms ease-in;
  font-size: 11px;
  cursor: ${(props) => (props.$isWeb ? 'pointer' : 'default')};
  color: ${(props) => withOpacity(props.theme.primaryTextColor, 75)};
`;

const StyledPlaybackTimeIndicator = styled.div<FilterIconProps>`
  text-align: center;
  cursor: pointer;
  flex-basis: 50px;
  color: ${(props) => props.theme.accentColor};
`;

const StyledTimestampLinkLabel = styled.div`
  flex-grow: 1.1;
  text-align: center;
  font-size: 12px;
  color: ${(props) => props.theme.primaryTextColor};
`;

const MediaPlayer = () => {
  const [loadMedia, setLoadMedia] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [totalPlayedSeconds, setTotalPlayedSeconds] = useState(0);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const platformType = usePortalStore((state) => state.platformType);
  const mediaPlayer = usePortalStore((state: PortalMainStore) => state.mediaPlayer);
  const [mouseOverOnPlaybackTime, setMouseOverOnPlaybackTime] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [activeUrl, setActiveUrl] = useState('');
  const [videoPlayerMinimized, setVideoPlayerMinimized] = useState(false);
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: any) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e: any) => {
    if (playerRef && playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(parseFloat(e.target.value));
      setSeeking(false);
    }
  };

  const onMinimizeToggle = useCallback(() => {
    if (playerReady) {
      setVideoPlayerMinimized((state) => !state);
    }
  }, [mediaPlayer, playerReady]);

  const onplay = useCallback(() => {
    setPlaying(true);
  }, [playing]);

  const onPause = useCallback(() => {
    setPlaying(false);
  }, [playing]);

  const onOpenLink = useCallback(() => {
    let url = mediaPlayer.activeMediaUrl;
    if (playerRef && url) {
      const currentTime = playerRef.current?.getCurrentTime();
      if (url && currentTime) {
        url = `${url}&t=${Math.floor(currentTime)}`;
      }
    }

    if (url) {
      CraftAPIHelper.openUrl(url);
    }
  }, [mediaPlayer]);

  const onPlaybackSpeedClicked = useCallback(() => {
    if (playbackRate === 1) {
      setPlaybackRate(1.25);
    }

    if (playbackRate === 1.25) {
      setPlaybackRate(1.5);
    }

    if (playbackRate === 1.5) {
      setPlaybackRate(2);
    }

    if (playbackRate === 2) {
      setPlaybackRate(1);
    }
  }, [playbackRate]);

  const onProgress = useCallback((state) => {
    if (!seeking) {
      setPlayed((state.played));
      setTotalPlayedSeconds(Math.floor(state.playedSeconds));
    }
  }, [seeking]);

  const onRewindClicked = useCallback(() => {
    let currentTime = playerRef.current?.getCurrentTime();
    const totalTime = playerRef.current?.getDuration();
    if (!currentTime || !totalTime || !playerRef || !playerRef.current) {
      return;
    }

    const timeToAdjustBy = (totalTime > 300) ? 30 : 15;
    currentTime -= timeToAdjustBy;
    playerRef.current.seekTo(currentTime);
  }, []);

  const onForwardClicked = useCallback(() => {
    let currentTime = playerRef.current?.getCurrentTime();
    const totalTime = playerRef.current?.getDuration();
    if (!currentTime || !totalTime || !playerRef || !playerRef.current) {
      return;
    }

    const timeToAdjustBy = (totalTime > 300) ? 30 : 15;
    currentTime += timeToAdjustBy;
    playerRef.current.seekTo(currentTime);
  }, []);

  const onPlaybackimeMouseEnter = useCallback(() => {
    if (!mediaPlayer.onlyAudio) {
      setMouseOverOnPlaybackTime(true);
    }
  }, [mediaPlayer]);

  const onPlaybackimeMouseLeave = useCallback(() => {
    if (!mediaPlayer.onlyAudio) {
      setMouseOverOnPlaybackTime(false);
    }
  }, [mediaPlayer]);

  useEffect(() => {
    setTimeout(() => {
      setLoadMedia(true);
    }, 500);
  }, []);

  useEffect(() => {
    if ((mediaPlayer.activeMediaUrl) && (mediaPlayer.activeMediaUrl) !== activeUrl) {
      setPlayerReady(false);
      setActiveUrl(mediaPlayer.activeMediaUrl);
    }
  }, [mediaPlayer, activeUrl]);

  const onBlockAdded = useCallback(async (response: ApiResponse<CraftBlock[]>) => {
    if (response.status === 'success') {
      const { id } = response.data[0];
      const { spaceId } = response.data[0];
      await CraftAPIHelper.selectedBlocks([id]);
      if (id && spaceId) {
        navigateToBlock(id, spaceId);
      }
    }
  }, []);

  const onPlaybacktimeClicked = useCallback(async () => {
    if (playerRef && playerRef.current && !mediaPlayer.onlyAudio) {
      const youtubeUrl = playerRef.current.getInternalPlayer().getVideoUrl();
      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      const formattedLink = `${youtubeUrl.split('?')[0]}?t=${currentTime}&v=${playerRef.current.getInternalPlayer().getVideoData().video_id}`;

      const block: CraftTextBlockInsert = {
        type: 'textBlock',
        content: [{
          text: getFormattedTime(currentTime),
          link: {
            type: 'url',
            url: formattedLink,
          },
        }],
      };

      const response = await insertNewBlock([block]);
      onBlockAdded(response);
    }
  }, []);

  return (
    <PlayerContainer>
      {
        (!loadMedia && !mediaPlayer.onlyAudio) && (
          <StyledPlaceholderDiv />
        )
      }
      {
        (loadMedia) && (
          <StyledReactPlayer
            ref={playerRef}
            className="react-player"
            width="95%"
            height={videoPlayerMinimized ? 0 : 150}
            url={mediaPlayer.activeMediaUrl}
            playing={playing}
            config={{
              youtube: {
                embedOptions: { modestbranding: true, playsinline: 1 },
                playerVars: { showinfo: 0, modestbranding: true, playsinline: 1 },
              },
            }}
            onReady={() => setPlayerReady(true)}
            playbackRate={playbackRate}
            onPlay={() => onplay()}
            onPause={() => onPause()}
            onProgress={(state: any) => onProgress(state)}
          />
        )
      }
      <StyledSeekContainer $videoPlayerMinimized={videoPlayerMinimized}>
        {
          (!mouseOverOnPlaybackTime) && (
            <>
              <StyledPlaybackSpeedContainer $isWeb={platformType === 'Web'} onClick={() => onPlaybackSpeedClicked()}>
                {playbackRate}
                x
              </StyledPlaybackSpeedContainer>
              <StyledInputSeek
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
              />
              <StyledFilterIconContainer $isWeb={platformType === 'Web'} onClick={() => onOpenLink()}>
                <StyledFilterIcon
                  size="xs"
                  $isWeb={platformType === 'Web'}
                  icon={faSquareUpRight}
                />
              </StyledFilterIconContainer>
            </>
          )
        }
        {
        (mouseOverOnPlaybackTime && !mediaPlayer.onlyAudio) && (
          <StyledTimestampLinkLabel>
            Click to insert timestamp link
          </StyledTimestampLinkLabel>
        )
        }
      </StyledSeekContainer>
      <StyledMediaControlsContainer unselectable="on">
        <StyledPlaybackTimeIndicator
          $isWeb={platformType === 'Web'}
          onMouseEnter={() => onPlaybackimeMouseEnter()}
          onMouseLeave={() => onPlaybackimeMouseLeave()}
          onClick={() => onPlaybacktimeClicked()}
        >
          {getFormattedTime(totalPlayedSeconds)}
        </StyledPlaybackTimeIndicator>
        <StyledFilterIconContainer $isWeb={platformType === 'Web'} onClick={() => onRewindClicked()}>
          <StyledFilterIcon
            $isWeb={platformType === 'Web'}
            icon={faStepBackward}
          />
        </StyledFilterIconContainer>
        {
          (playing)
            && (
            <StyledFilterIconContainer $isWeb={platformType === 'Web'} onClick={() => setPlaying(false)}>
              <StyledFilterIcon
                $isWeb={platformType === 'Web'}
                icon={faPauseCircle}
              />
            </StyledFilterIconContainer>
            )
          }
        {
            (!playing)
            && (
            <StyledFilterIconContainer $isWeb={platformType === 'Web'} onClick={() => setPlaying(true)}>
              <StyledFilterIcon
                $isWeb={platformType === 'Web'}
                icon={faPlayCircle}
              />
            </StyledFilterIconContainer>
            )
          }
        <StyledFilterIconContainer $isWeb={platformType === 'Web'} onClick={() => onForwardClicked()}>
          <StyledFilterIcon
            $isWeb={platformType === 'Web'}
            icon={faStepForward}
          />
        </StyledFilterIconContainer>
        {
          (!mediaPlayer.onlyAudio)
          && (
            <StyledFilterIconContainer $isWeb={platformType === 'Web'} onClick={() => onMinimizeToggle()}>
              <StyledFilterIcon
                $isWeb={platformType === 'Web'}
                icon={videoPlayerMinimized ? faAngleUp : faAngleDown}
              />
            </StyledFilterIconContainer>
          )
        }
      </StyledMediaControlsContainer>
    </PlayerContainer>
  );
};

export default MediaPlayer;
