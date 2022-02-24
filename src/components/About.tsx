import React, { useState } from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

import CraftAPIHelper from '../api/craftAPIHelper';
import { VERSION } from '../config/config';
import LabView from '../labs/components/LabView';

const StyledTextDiv = styled.div`
    color: ${(props) => props.theme.primaryTextColor};
    padding-top: 10px;
    font-size: 13px;
    line-height: 1.5;
    overflow-x: auto;
`;

const StyledContainer = styled(animated.div)`
  overflow-x: hidden;
`;

const StyledFrame = styled.iframe`
  height: 25px;
  cursor: pointer;
  z-index: 1;
`;

const StyledFrameContainerDiv = styled.div`
  position: relative;
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

const StyledLinkDiv = styled.a`
  color: ${(props) => props.theme.accentColor};
  transition: filter 200ms ease-in;
  overflow-x: auto;
  cursor: pointer;
  &:hover: {
    filter: brightness(1.3);
  }
`;

const StyledHeader = styled.div`
    padding-top: 15px;
    font-size: 15px;
    color: ${(props) => props.theme.accentColor};
`;

const About = () => {
  const [iFrameLoaded, setIframeLoaded] = useState(false);
  const [props] = useSpring(() => ({
    from: { opacity: 0 },
    opacity: 1,
    config: { duration: 200 },
  }));

  return (
    <StyledContainer style={props}>
      <StyledTextDiv>
        Version:
        {' '}
        { VERSION }
        {' '}
        (beta)
      </StyledTextDiv>
      <StyledFrameContainerDiv>
        <StyledOverlayDiv onClick={() => CraftAPIHelper.openUrl('https://dharam.is/Sight-Portal-Download')}>
          {
            (!iFrameLoaded) && <StyledTextDiv>Checking for updates...</StyledTextDiv>
          }
        </StyledOverlayDiv>
        <StyledFrame frameBorder="0" onLoad={() => setIframeLoaded(true)} title="Sight Portal Updates" src="https://sightportal.dharamkapila.repl.co/Versions/0.3/0.3beta.html" />
      </StyledFrameContainerDiv>
      <StyledHeader>
        Feedback 👋
      </StyledHeader>
      <StyledTextDiv>
        Hi, I&apos;m
        {' '}
        <StyledLinkDiv onClick={() => CraftAPIHelper.openUrl('https://dharam.is')}>Dharam</StyledLinkDiv>
        .
        {' '}
        Thank you for trying this extension :)
      </StyledTextDiv>
      <StyledTextDiv>
        If you face any problems, or have suggestions, please contact me by
        {' '}
        <StyledLinkDiv onClick={() => CraftAPIHelper.openUrl('mailto:dharam@hey.com')}>email</StyledLinkDiv>
        {' '}
        or on
        {' '}
        <StyledLinkDiv onClick={() => CraftAPIHelper.openUrl('https://www.twitter.com/dharamkapila')}>Twitter</StyledLinkDiv>
        .
      </StyledTextDiv>
      <StyledHeader>
        Tips 🪄
      </StyledHeader>
      <StyledTextDiv>
        1. Click on the accent color icon to switch to a new search.
      </StyledTextDiv>
      <StyledTextDiv>
        2. You can use common markdown syntax while searching for blocks.
        For example, searching for **serentipity** will search for the word serendipity in bold.
        Similarly, you can use :: to search for highlights, or # for all headings.
      </StyledTextDiv>
      <StyledTextDiv>
        3. Shift + Click on a result to navigate inside the block and make it the current page.
      </StyledTextDiv>
      <LabView />
    </StyledContainer>
  );
};

export default About;
