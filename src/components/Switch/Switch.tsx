import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import styled from 'styled-components';

type IProps = {
  isEnabled: boolean
};

const StyledLabel = styled.label<IProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 40px;
  height: 24px;
  background: grey;
  border-radius: 100px;
  position: relative;
  transition: background-color .2s;
  background: ${(props) => ((props.isEnabled) ? props.theme.accentColor : props.theme.toggleSwitchDisabledBackground)};
`;

const StyledSwitchContainer = styled.div`
  user-select: none;
  position: relative;
  display: flex;
  padding-top: 5px;
  padding-bottom: 5px;
  align-items: center;
  background: ${(props) => props.theme.secondaryBackground};
  border-radius: 6px;
  padding-left: 5px;
  padding-right: 5px;
`;

const StyledCheckboxInput = styled.input`
  height: 0;
  width: 0;
  visibility: hidden;
`;

const StyledSwitchInputContainer = styled.div`
  &:hover {
    .react-switch-off { 
      width: 23px;
    }

    .react-switch-on {
      position: relative;
      left: 15px; 
      width: 23px;
    }
  }
`;

const StyledSwitchLabel = styled.div`
  flex-grow: 1.1;
  font-size: 13px;
  padding-left: 3px;
  transition: color 300ms ease-in;
  color: ${(props) => props.theme.primaryTextColor};
`;

const StyledSwitchSpan = styled.div<IProps>`
  content: '';
  position: absolute;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 45px;
  transition: all 200ms ease-in;
  background: #fff;
  box-shadow: 0 0 2px 0 rgba(10, 10, 10, 0.29);

  ${({ isEnabled }) => isEnabled && `
    left: 18px;
  `}
`;

type SwitchProps = {
  enabled: boolean,
  label: string,
  onToggled: (state: boolean) => void;
};

const Switch = ({ enabled, onToggled, label }: SwitchProps) => {
  const id = uuidv4();
  return (
    <StyledSwitchContainer>
      <StyledSwitchLabel>{label}</StyledSwitchLabel>
      <StyledSwitchInputContainer>
        <StyledCheckboxInput
          checked={enabled}
          onChange={(e) => onToggled(e.target.checked)}
          id={id}
          type="checkbox"
        />
        <StyledLabel
          isEnabled={enabled}
          htmlFor={id}
        >
          <StyledSwitchSpan isEnabled={enabled} className={enabled ? 'react-switch-on' : 'react-switch-off'} />
        </StyledLabel>
      </StyledSwitchInputContainer>
    </StyledSwitchContainer>
  );
};

export default Switch;
