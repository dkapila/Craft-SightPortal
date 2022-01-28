import React from 'react';
import styled from 'styled-components';
import InsertRandomBlockButton from './InsertRandomBlockButton';
import OpenRandomBlockButton from './OpenRandomBlockButton';

const StyledLabsContainer = styled.div``;

const StyledHeader = styled.div`
    padding-top: 15px;
    font-size: 15px;
    color: ${(props) => props.theme.accentColor};
`;

const StyledButonContainer = styled.div`
  padding-top: 10px;
`;

const StyledTextDiv = styled.div`
    color: ${(props) => props.theme.primaryTextColor};
    padding-top: 10px;
    font-size: 13px;
    line-height: 1.5;
    overflow-x: auto;
`;

const LabView = () => (
  <StyledLabsContainer>
    <StyledHeader>
      Labs
    </StyledHeader>
    <StyledTextDiv>
      These are experimental features, and may change.
    </StyledTextDiv>
    <StyledButonContainer>
      <OpenRandomBlockButton />
    </StyledButonContainer>
    <StyledButonContainer>
      <InsertRandomBlockButton />
    </StyledButonContainer>
  </StyledLabsContainer>
);

export default LabView;
