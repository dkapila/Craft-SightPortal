import React, { useCallback } from 'react';
import { PortalBlockType } from 'src/Types';
import styled from 'styled-components';
import usePortalStore from '../../../store/store';

const StyledStarContainer = styled.div`
  unicode-bidi: bidi-override;
  direction: rtl;
  right: 5px;
  flex-basis: 16px;
  min-width: 16px;
`;

const StyledStarSpan = styled.span`
  font-size: 15px;
  transition: visibility 200ms, opacity 200ms ease-in 150ms;
  color: ${(props) => props.theme.accentColor};
  
  &:hover {
    content: "\2605";
    position: absolute;
  }
`;

type ToggleStarProps = {
  block: PortalBlockType,
  isInStarredList: boolean,
};

const ToggleStar = ({
  block,
  isInStarredList,
}: ToggleStarProps) => {
  const addStarredBlock = usePortalStore((state) => state.addStarredBlock);
  const starredBlocks = usePortalStore((state) => state.starredBlocks);
  const removeStarredBlock = usePortalStore((state) => state.removeStarredBlock);

  const removeStar = useCallback((e) => {
    e.stopPropagation();
    const blocks = starredBlocks.filter((item) => item.craftBlockId === block.craftBlockId);
    blocks.forEach((item) => {
      removeStarredBlock(item.id);
    });
  }, [starredBlocks]);

  const starBlock = useCallback((e) => {
    e.stopPropagation();
    addStarredBlock(block);
  }, [starredBlocks]);

  return (
    <>
      {
      (isInStarredList) && (
        <StyledStarContainer className="starred">
          <StyledStarSpan onClick={(e) => removeStar(e)}>☆</StyledStarSpan>
        </StyledStarContainer>
      )
    }
      {
        (!isInStarredList) && (
        <StyledStarContainer className="unstarred">
          <StyledStarSpan onClick={(e) => starBlock(e)}>☆</StyledStarSpan>
        </StyledStarContainer>
        )
    }
    </>
  );
};

export default ToggleStar;
