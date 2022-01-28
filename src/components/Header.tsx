import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

import {
  AccentColorType,
  PortalMainStore,
} from '../Types';

import usePortalStore from '../store/store';
import AccentPicker from './AccentPicker/AccentPicker';

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

const StyledHeaderText = styled.span<StyledHeaderTextProps>`
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 200ms ease-in;
  padding-right: 5px;
  color: ${(props) => props.theme.primaryTextColor};
  letter-spacing: 0.3px;

  ${({ mouseOverInPortalButton }) => mouseOverInPortalButton && `
    opacity: 0.4;
  `}

  &:hover {
    color: ${(props) => props.theme.accentColor};
  }
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
              (navigator.onLine) && (
              <StyledIframeContainer>
                <StyledOverlayDiv onClick={(e) => onHeaderClicked(e)} />
                <StyledFrame frameBorder="0" title="Sight Portal Updates" src="https://sightportal.dharamkapila.repl.co/Versions/0.1betaHeader.html" />
              </StyledIframeContainer>
              )
            }
          </StyledHeaderContainer>
          )}
    </StyledExtensionHeader>
  );
};

export default Header;
