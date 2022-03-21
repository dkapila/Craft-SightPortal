import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faBookReader } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

import {
  AccentColorType,
  PortalMainStore,
} from '../Types';

import usePortalStore from '../store/store';
import AccentPicker from './AccentPicker/AccentPicker';
import { getUrlsFromSelectedBlocks, getYoutubeLink } from '../utils/block';
import Constants from '../utils/constants';

type PortalThemeButtonProps = {
  mouseOverInPortalHeader: boolean;
};

type StyledHeaderTextProps = {
  mouseOverInPortalButton: boolean;
};

type FilterIconProps = {
  $isActive: boolean,
};

const PortalThemeButton = styled.div<PortalThemeButtonProps>`
    min-width: 10px;
    min-height: 10px;
    filter: contrast(0.8);
    border-radius: 50%;
    cursor: pointer;
    transition: border .4s ease-in;
    box-sizing: border-box;
    margin-left: 10px;
    transition: all 200ms ease-in;
    background: ${(props) => props.theme.accentColor};

    ${({ mouseOverInPortalHeader }) => mouseOverInPortalHeader && `
      transform: scale(1.4);
    `}

    &:hover {
      filter: brightness(1.3);
    }
`;

const StyledFrame = styled.iframe`
  height: 16px;
  z-index: 1;
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const StyledExtensionHeader = styled.div`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
`;

const StyledOverlayDiv = styled.div`
  background: transparent;
  position: absolute;
  z-index: 10;
  height: 25px;
  width: 100%;
  overflow-x: auto;
`;

const StyledIframeContainer = styled.div`
    width: 100px;
`;

const StyledFilterIconContainer = styled.div<FilterIconProps>`
  align-items: center;
  display: flex;
  width: 30px;
  height: 28px;
  justify-content: center;
  border-bottom: 2px solid transparent;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }

  ${({ $isActive, theme }) => $isActive && `
    border-bottom: 2px solid ${theme.accentColor};
    border-radius: 0px;

    &:hover {
      background: ${theme.blockHoverBackground};
    }
  `}
`;

const StyledHeaderText = styled.span<StyledHeaderTextProps>`
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 200ms ease-in;
  width: 80px;
  color: ${(props) => props.theme.primaryTextColor};
  letter-spacing: 0.3px;

  ${({ mouseOverInPortalButton }) => mouseOverInPortalButton && `
    opacity: 0.4;
  `}

  &:hover {
    color: ${(props) => props.theme.accentColor};
  }
`;

const StyledFilterIcon = styled(FontAwesomeIcon)<FilterIconProps>`
  color: ${(props) => props.theme.iconColor};
  height: 14px;
  transition: color 200ms ease-in;
`;

type HeaderProps = {
  onHeaderClicked: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
};

const Header = ({ onHeaderClicked }: HeaderProps) => {
  const [accentPickerShown, setAccentPickerShown] = useState(false);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const setAccentColor = usePortalStore((state: PortalMainStore) => state.setAccentColor);
  const [mouseOverInPortalHeader, setMouseOverInPortalHeader] = useState(false);
  const [mouseOverInPortalButton, setMouseOverInPortalButton] = useState(false);
  const mediaPlayer = usePortalStore((state: PortalMainStore) => state.mediaPlayer);
  const article = usePortalStore((state: PortalMainStore) => state.article);
  const setArticle = usePortalStore((state: PortalMainStore) => state.setArticle);
  const setMedia = usePortalStore((state: PortalMainStore) => state.setMedia);
  const setNotification = usePortalStore((state: PortalMainStore) => state.setNotification);
  const clearNotification = usePortalStore((state: PortalMainStore) => state.clearNotification);
  const platformType = usePortalStore((state: PortalMainStore) => state.platformType);

  const onPortalHeaderMouseEnter = useCallback(() => {
    setMouseOverInPortalHeader(true);
  }, []);

  const onPortalHeaderMouseLeave = useCallback(() => {
    setMouseOverInPortalHeader(false);
  }, []);

  const onAccentColorClicked = useCallback((e, key: AccentColorType) => {
    setAccentColor(key);
    setAccentPickerShown(false);
    e.stopPropagation();
  }, [accentColor]);

  const hideArticle = useCallback(() => {
    setArticle({
      ...article,
      activeUrl: undefined,
      isActive: false,
    });
  }, [article]);

  const hideMedia = useCallback(() => {
    setMedia({
      ...mediaPlayer,
      activeMediaUrl: undefined,
      isActive: false,
    });
  }, [mediaPlayer]);

  const onReaderButtonClicked = useCallback(async (e) => {
    setAccentPickerShown(false);
    e.stopPropagation();

    const urls = await getUrlsFromSelectedBlocks();
    if (urls.length > 0) {
      clearNotification();
      if (urls[0].endsWith('.mp3')) {
        if (mediaPlayer.activeMediaUrl === urls[0]) {
          hideMedia();
          return;
        }

        setMedia({
          isActive: true,
          onlyAudio: true,
          activeMediaUrl: (urls[0]),
        });
      } else if (article.activeUrl === urls[0]) {
        hideArticle();

        return;
      }

      setArticle({
        isActive: true,
        activeUrl: (urls[0]),
      });
    } else {
      if (article.isActive) {
        hideArticle();

        return;
      }
      setNotification({
        text: 'Select block with an Article link',
        isShown: true,
      });
    }
  }, [article]);

  const onYoutubeButtonClicked = useCallback(async (e) => {
    setAccentPickerShown(false);
    e.stopPropagation();

    const urls = await getUrlsFromSelectedBlocks();
    const youtubeLink = getYoutubeLink(urls);

    if (youtubeLink) {
      clearNotification();
      if (mediaPlayer.activeMediaUrl === youtubeLink) {
        hideMedia();
        return;
      }

      setMedia({
        isActive: true,
        onlyAudio: false,
        activeMediaUrl: (youtubeLink),
      });
    } else {
      if (mediaPlayer.isActive) {
        setMedia({
          ...mediaPlayer,
          isActive: false,
        });

        return;
      }
      setNotification({
        text: 'Select block with a YouTube link',
        isShown: true,
      });
    }
  }, [mediaPlayer]);

  return (
    <StyledExtensionHeader
      onClick={(e) => onHeaderClicked(e)}
      onMouseEnter={() => onPortalHeaderMouseEnter()}
      onMouseLeave={() => onPortalHeaderMouseLeave()}
    >
      <PortalThemeButton
        onMouseLeave={() => setMouseOverInPortalButton(false)}
        onMouseEnter={() => setMouseOverInPortalButton(true)}
        mouseOverInPortalHeader={mouseOverInPortalHeader}
        onClick={(e) => {
          e.stopPropagation();
          setAccentPickerShown((prevState) => !prevState);
        }}
      />
      {
        accentPickerShown
        && <AccentPicker onAccentColorClicked={(e, key) => onAccentColorClicked(e, key)} />
      }
      { !accentPickerShown
          && (
          <StyledHeaderContainer>
            <StyledHeaderText
              mouseOverInPortalButton={mouseOverInPortalButton}
            >
              Sight Portal
            </StyledHeaderText>
            {
              (platformType === 'Mac') && (
                <StyledFilterIconContainer $isActive={mediaPlayer.isActive} title="YouTube Preview" onClick={(e) => onYoutubeButtonClicked(e)}>
                  <StyledFilterIcon
                    $isActive={mediaPlayer.isActive}
                    icon={faYoutube}
                  />
                </StyledFilterIconContainer>
              )
            }
            {
              (platformType === 'Mac') && (
                <StyledFilterIconContainer $isActive={article.isActive} title="Read Article" onClick={(e) => onReaderButtonClicked(e)}>
                  <StyledFilterIcon
                    $isActive={article.isActive}
                    icon={faBookReader}
                  />
                </StyledFilterIconContainer>
              )
            }
            {
              (navigator.onLine) && (
              <StyledIframeContainer>
                <StyledOverlayDiv onClick={(e) => onHeaderClicked(e)} />
                <StyledFrame frameBorder="0" title="Sight Portal Updates" src={Constants.SIGHT_PORTAL_UPDATE_HEADER_STATUS_LINK} />
              </StyledIframeContainer>
              )
            }
          </StyledHeaderContainer>
          )}
    </StyledExtensionHeader>
  );
};

export default Header;
