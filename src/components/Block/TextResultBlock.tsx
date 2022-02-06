import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { TextStyle } from '@craftdocs/craft-extension-api';
import usePortalStore from '../../store/store';
import { PortalTextResult, PortalResultBlock } from '../../Types';
import CraftAPIHelper from '../../api/craftAPIHelper';
import { navigateToBlock, parseBlocks } from '../../utils/block';
import ToggleStar from './Actions/ToggleStar';

type TextSpanProps = {
  textStyle: TextStyle,
  enableDynamicTextSize: boolean,
};

const getFontWeight = (textStyle: TextStyle) => {
  switch (textStyle) {
    case 'title':
      return '400';
    case 'subtitle':
      return '400';
    case 'heading':
      return '400';
    case 'strong':
      return '300';
    case 'card':
      return '400';
    case 'page':
      return '400';
    default:
      return '13px';
  }
};

const getFontSize = (textStyle: TextStyle) => {
  switch (textStyle) {
    case 'title':
      return '16px';
    case 'subtitle':
      return '15px';
    case 'heading':
      return '14px';
    case 'strong':
      return '13px';
    case 'card':
      return '14px';
    case 'page':
      return '14px';
    default:
      return '13px';
  }
};

const StyledTextSpan = styled.span<TextSpanProps>`
  font-size: 13px;
  transition: color 600ms ease-in;
  text-overflow: ellipsis;
  overflow-x: auto;
  line-height: 1.5;
  flex-grow: 1.1;
  color: ${(props) => props.theme.primaryTextColor};

  ${({ enableDynamicTextSize, textStyle }) => enableDynamicTextSize && `
    font-size: ${getFontSize(textStyle)};
    font-weight: ${getFontWeight(textStyle)};
  `}
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

type TextResultBlockProps = {
  blockResult: PortalTextResult,
  enableDynamicTextSize: boolean
};

const TextResultBlock = ({
  blockResult,
  enableDynamicTextSize,
}: TextResultBlockProps) => {
  const setRefreshResultsPending = usePortalStore((state) => state.setRefreshResultsPending);
  const starredBlocks = usePortalStore((state) => state.starredBlocks);
  const setStarredBlock = usePortalStore((state) => state.setStarredBlock);
  const [isInStarredBlockList, setIsInStarredBlockList] = useState(false);

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
  }, [isInStarredBlockList]);

  const onBlockLinkClicked = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    resultBlock: PortalResultBlock,
  ) => {
    if (e.shiftKey && resultBlock.spaceId) {
      openBlock(resultBlock.blockId);
    } else {
      navigateToBlock(resultBlock.blockId, resultBlock.spaceId);
    }
    setRefreshResultsPending(true);
  };

  return (
    <StyledResultsContainer
      onClick={(e) => onBlockLinkClicked(e, blockResult)}
    >
      <StyledTextSpan
        enableDynamicTextSize={enableDynamicTextSize}
        textStyle={blockResult.textStyleType}
      >
        { (blockResult as PortalTextResult).resultText }
      </StyledTextSpan>
      <ToggleStar block={blockResult.portalBlock} isInStarredList={isInStarredBlockList} />
    </StyledResultsContainer>
  );
};

export default TextResultBlock;
