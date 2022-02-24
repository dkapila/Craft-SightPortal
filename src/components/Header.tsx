import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import styled from 'styled-components';

import {
  AccentColorType,
  PortalMainStore,
} from '../Types';

import usePortalStore from '../store/store';
import AccentPicker from './AccentPicker/AccentPicker';
import { getUrlsFromSelectedBlocks, getYoutubeLink } from '../utils/block';

type PortalThemeButtonProps = {
  mouseOverInPortalHeader: boolean;
};

type StyledHeaderTextProps = {
  mouseOverInPortalButton: boolean;
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
  cursor: pointer;
  z-index: 1;
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledExtensionHeader = styled.div`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: start;
  display: flex;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid ${(props) => props.theme.seperatorColor};
`;

const StyledOverlayDiv = styled.div`
  background: transparent;
  position: absolute;
  z-index: 10;
  height: 25px;
  width: 100%;
  cursor: pointer;
  overflow-x: auto;
`;

const StyledIframeContainer = styled.div`
    width: 100px;
`;

const StyledFilterIconContainer = styled.div`
  align-items: center;
  display: flex;
  width: 30px;
  height: 28px;
  justify-content: center;
  border-radius: 5px;

  &:hover {
    background: ${(props) => props.theme.blockHoverBackground};
  }
`;

const StyledHeaderText = styled.span<StyledHeaderTextProps>`
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 200ms ease-in;
  padding-right: 5px;
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

const StyledFilterIcon = styled(FontAwesomeIcon)`
  color: ${(props) => props.theme.iconColor};
  height: 14px;
  transition: color 200ms ease-in;
`;

type HeaderProps = {
  onHeaderClicked: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
};

const Header = ({ onHeaderClicked }: HeaderProps) => {
  const [extensionPreferencesViewShown, setExtensionPreferencesViewShown] = useState(false);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const setAccentColor = usePortalStore((state: PortalMainStore) => state.setAccentColor);
  const [mouseOverInPortalHeader, setMouseOverInPortalHeader] = useState(false);
  const [mouseOverInPortalButton, setMouseOverInPortalButton] = useState(false);
  const videoPlayer = usePortalStore((state: PortalMainStore) => state.videoPlayer);
  const setVideo = usePortalStore((state: PortalMainStore) => state.setVideo);
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
    setExtensionPreferencesViewShown(false);
    e.stopPropagation();
  }, [accentColor]);

  const onVideoIconClicked = useCallback(async (e) => {
    setExtensionPreferencesViewShown(false);
    e.stopPropagation();

    const urls = await getUrlsFromSelectedBlocks();
    const youtubeLink = getYoutubeLink(urls);

    if (youtubeLink) {
      clearNotification();
      setVideo({
        isActive: true,
        activeVideoUrl: (youtubeLink),
      });
    } else {
      setNotification({
        text: 'Select block with a YouTube link',
        isShown: true,
      });
    }
  }, [videoPlayer]);

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
          setExtensionPreferencesViewShown((prevState) => !prevState);
        }}
      />
      {
        extensionPreferencesViewShown
        && <AccentPicker onAccentColorClicked={(e, key) => onAccentColorClicked(e, key)} />
      }
      { !extensionPreferencesViewShown
          && (
          <StyledHeaderContainer>
            <StyledHeaderText
              mouseOverInPortalButton={mouseOverInPortalButton}
            >
              Sight Portal
            </StyledHeaderText>
            {
              (platformType === 'Mac') && (
                <StyledFilterIconContainer title="YouTube Preview" onClick={(e) => onVideoIconClicked(e)}>
                  <StyledFilterIcon
                    icon={faYoutube}
                  />
                </StyledFilterIconContainer>
              )
            }
            {
              (navigator.onLine) && (
              <StyledIframeContainer>
                <StyledOverlayDiv onClick={(e) => onHeaderClicked(e)} />
                <StyledFrame frameBorder="0" title="Sight Portal Updates" src="https://sightportal.dharamkapila.repl.co/Versions/0.3/0.3betaHeader.html" />
              </StyledIframeContainer>
              )
            }
          </StyledHeaderContainer>
          )}
    </StyledExtensionHeader>
  );
};

export default Header;
