import React from 'react';
import { PortalTextResult, StyledListType, Theme } from 'src/Types';
import styled from 'styled-components';
import TextResultBlock from './TextResultBlock';

const getBlockBackground = (listStyle: StyledListType, theme: Theme) => {
  if (listStyle === 'done') {
    return theme.taskCheckedBackground;
  }
  if (listStyle === 'todo') {
    return theme.taskUnCheckedBackground;
  }
  if (listStyle === 'cancelled') {
    return theme.taskCanceledBackground;
  }

  return 'transparent';
};

type IProps = {
  listStyle: StyledListType;
};

const StyledResultsContainer = styled.div<IProps>`
  background: ${(props) => getBlockBackground(props.listStyle, props.theme)}
`;

type TextResultBlockProps = {
  blockResult: PortalTextResult
};

const TaskResultsBlock = ({
  blockResult,
}: TextResultBlockProps) => (
  <StyledResultsContainer listStyle={blockResult.listStyleType}>
    <TextResultBlock enableDynamicTextSize={false} blockResult={blockResult} />
  </StyledResultsContainer>
);

export default TaskResultsBlock;
