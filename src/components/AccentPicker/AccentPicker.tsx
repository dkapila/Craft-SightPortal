import React from 'react';
import styled from 'styled-components';

import {
  DarkBlueTheme, DarkGreenTheme, DarkGreyTheme,
  DarkPinkTheme, DarkPurpleTheme, DarkYellowTheme,
  LightBlueTheme, LightGreyTheme, LightPinkTheme,
  LightPurpleTheme, LightYellowTheme, LightGreenTheme,
} from '../../theme/theme';

import { AccentColorMap, AccentColorType } from '../../Types';

type AccentPickerProps = {
  onAccentColorClicked: (
    e: React.MouseEvent<HTMLDivElement,
    MouseEvent>, key: AccentColorType) => void
};

const StyledPortalThemePicker = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
`;

type StyledPortalThemeButtonProps = {
  accentColor: AccentColorType,
};

const getBackgroundColor = (accentColor: AccentColorType, isLightTheme: boolean) => {
  switch (accentColor) {
    case 'Blue': {
      return (isLightTheme) ? LightBlueTheme.accentColor : DarkBlueTheme.accentColor;
    }
    case 'Yellow': {
      return (isLightTheme) ? LightYellowTheme.accentColor : DarkYellowTheme.accentColor;
    }
    case 'Green': {
      return (isLightTheme) ? LightGreenTheme.accentColor : DarkGreenTheme.accentColor;
    }
    case 'Pink': {
      return (isLightTheme) ? LightPinkTheme.accentColor : DarkPinkTheme.accentColor;
    }
    case 'Grey': {
      return (isLightTheme) ? LightGreyTheme.accentColor : DarkGreyTheme.accentColor;
    }
    case 'Purple': {
      return (isLightTheme) ? LightPurpleTheme.accentColor : DarkPurpleTheme.accentColor;
    }
    default: {
      return '';
    }
  }
};

const StyledPortalThemeButton = styled.div<StyledPortalThemeButtonProps>`
  min-width: 15px;
  min-height: 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: border .4s ease-in;
  box-sizing: border-box;
  margin-left: 10px;
  transition: all 200ms ease-in;
  background: ${(props) => getBackgroundColor(props.accentColor, props.theme.isLight)};

  &:hover {
    filter: brightness(1.2);
    transform: scale(1.2);
  }
`;

const AccentPicker = ({ onAccentColorClicked } : AccentPickerProps) => (
  <StyledPortalThemePicker>
    {
      Object.keys(AccentColorMap).map((key) => (
        <StyledPortalThemeButton
          key={key}
          accentColor={key as AccentColorType}
          title={key}
          onClick={(e) => onAccentColorClicked(e, key as AccentColorType)}
        />
      ))
    }
  </StyledPortalThemePicker>
);

export default AccentPicker;
