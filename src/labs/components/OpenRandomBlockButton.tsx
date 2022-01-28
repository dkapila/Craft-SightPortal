import React, { useCallback } from 'react';
import styled from 'styled-components';
import CraftAPIHelper from '../../api/craftAPIHelper';
import withOpacity from '../../utils/colors';
import { getRandomBlock } from '../../utils/block';
import usePortalStore from '../../store/store';

type IProps = {
  isWeb: boolean;
};

const StyledFilterButton = styled.div<IProps>`
  width: 100%;
  display: flex;
  padding-left: 0px;
  padding: 4px;
  border-radius: 3px;
  color: ${(props) => props.theme.primaryTextColor};
  cursor: ${(props) => (props.isWeb ? 'pointer' : 'default')};
  background: ${(props) => props.theme.secondaryBackground};
  transition: background 100ms ease-in;
  border: 1px solid ${(props) => props.theme.secondaryBackground};

  &:hover {
    background: ${(props) => withOpacity(props.theme.accentColor, 20)}
  }
`;

const StyledLabelFilter = styled.div`
  font-size: 14px;
  padding: 2px 0px 2px 0px;
`;

const OpenRandomBlockButton = () => {
  const platformType = usePortalStore((state) => state.platformType);

  const onButtonClicked = useCallback(async () => {
    const randomBlock = await getRandomBlock();
    if (randomBlock) {
      const navigateResult = await CraftAPIHelper.navigateToBlockId(randomBlock.craftBlockId);
      if (navigateResult.status !== 'success') {
        throw new Error(navigateResult.message);
      }
    }
  }, []);

  return (
    <StyledFilterButton isWeb={platformType === 'Web'} onClick={() => { onButtonClicked(); }}>
      <StyledLabelFilter>
        Open Random Block from page
      </StyledLabelFilter>
    </StyledFilterButton>
  );
};

export default OpenRandomBlockButton;
