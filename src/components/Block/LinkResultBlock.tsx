import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import usePortalStore from '../../store/store';
import { PortalLinkResult, PortalResultBlock, PortalMainStore } from '../../Types';
import CraftAPIHelper from '../../api/craftAPIHelper';
import ToggleStar from './Actions/ToggleStar';
import { getYoutubeLink, navigateToBlock, parseBlocks } from '../../utils/block';

const StyledTextContainer = styled.div`
  flex-grow: 1.1;
`;

const StyledResultsContainer = styled.div`
  display: flex;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  box-shadow: 0 0 rgba(0,0,0,0), 0 0 rgba(0,0,0,0), var(--tw-shadow);
  padding: 7px;
  margin-bottom: 8px;
  border-radius: 5px;
  cursor: pointer;
  background: transparent;

  > .unstarred > span {
    opacity: 0;
    visibility: hidden;
  }

  &:hover {
    > .unstarred > span {
      opacity: 1;
      visibility: visible;
    }

    background: ${(props) => props.theme.blockHoverBackground};
  }
`;

const StyledLinkTextSpan = styled.span`
  line-height: 1.7;
  border-bottom: 2px solid;
  padding-bottom: 2px;
  font-size: 13px;
  transition: color 600ms ease-in;
  text-overflow: ellipsis;
  overflow-x: auto;
  color: ${(props) => props.theme.linkTextColor};
  transition: filter 200ms ease-in;

  &:hover: {
    filter: brightness(1.2);
  }
`;

const StyledTextSpan = styled.span`
  transition: color 600ms ease-in;
  color: ${(props) => props.theme.primaryTextColor};
  font-size: 13px;
  text-overflow: ellipsis;
  line-height: 1.7;
`;

type LinkResultBlockProps = {
  blockResult: PortalLinkResult
};

const LinkResultBlock = ({
  blockResult,
}: LinkResultBlockProps) => {
  const setRefreshResultsPending = usePortalStore((state) => state.setRefreshResultsPending);
  const setStarredBlock = usePortalStore((state) => state.setStarredBlock);
  const [isInStarredBlockList, setIsInStarredBlockList] = useState(false);
  const starredBlocks = usePortalStore((state) => state.starredBlocks);
  const platformType = usePortalStore((state) => state.platformType);
  const setMedia = usePortalStore((state: PortalMainStore) => state.setMedia);

  useEffect(() => {
    const inStarredBlocks = starredBlocks.some((item) => item.craftBlockId === blockResult.blockId);
    setIsInStarredBlockList(inStarredBlocks);
  }, []);

  const openBlock = useCallback(async (blockId) => {
    const navigateResult = await CraftAPIHelper.navigateToBlockId(blockId);
    if (navigateResult.status !== 'success') {
      throw new Error(navigateResult.message);
    } else if (isInStarredBlockList) {
      const response = await new CraftAPIHelper().getCurrentPageBlocks();
      if (response.status === 'success') {
        const block = parseBlocks(response.data, '', 0, []).filter((item) => item.craftBlockId === blockId)[0];
        setStarredBlock(block);
      }
    }
  }, [isInStarredBlockList, starredBlocks]);

  const onBlockLinkClicked = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    resultBlock: PortalResultBlock,
  ) => {
    if ((e.shiftKey && resultBlock.spaceId) || platformType === 'Web') {
      openBlock(resultBlock.blockId);
    } else {
      navigateToBlock(resultBlock.blockId, resultBlock.spaceId);
    }
    setRefreshResultsPending(true);
  };

  const openExternalLink = async (url: string) => {
    const youtubeLink = getYoutubeLink([url]);
    if (youtubeLink) {
      setMedia({
        isActive: true,
        onlyAudio: false,
        activeMediaUrl: (youtubeLink),
      });

      return;
    }
    const result = await CraftAPIHelper.openURL(url);
    if (result.status !== 'success') {
      throw new Error(result.message);
    }
  };

  const onLinkClicked = async (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    resultBlock: PortalLinkResult,
  ) => {
    e.stopPropagation();

    if (resultBlock.link && resultBlock.link.type === 'blockLink') {
      openBlock(resultBlock.link.blockId);
      setRefreshResultsPending(true);
      return;
    }

    if (resultBlock.link && resultBlock.link.type === 'url') {
      const { link } = resultBlock;

      if (link.url.startsWith('craftdocs://')) {
        const blockId = new URL(resultBlock.link.url).searchParams.get('blockId');
        if (blockId) {
          openBlock(blockId);
          setRefreshResultsPending(true);
        }
      } else {
        openExternalLink(resultBlock.link.url);
      }
    }
  };

  return (
    <StyledResultsContainer onClick={(e) => onBlockLinkClicked(e, blockResult)}>
      <StyledTextContainer>
        <StyledTextSpan>
          { (blockResult as PortalLinkResult).preText }
        </StyledTextSpan>
        <StyledLinkTextSpan onClick={(e) => onLinkClicked(e, blockResult as PortalLinkResult)}>
          { (blockResult as PortalLinkResult).linkText }
        </StyledLinkTextSpan>
        <StyledTextSpan>
          { (blockResult as PortalLinkResult).postText }
        </StyledTextSpan>
      </StyledTextContainer>
      <ToggleStar block={blockResult.portalBlock} isInStarredList={isInStarredBlockList} />
    </StyledResultsContainer>
  );
};

export default LinkResultBlock;
