import { Environment } from '@craftdocs/craft-extension-api';
import { useState, useLayoutEffect, useEffect } from 'react';
import { PortalMainStore, Theme } from '../Types';
import usePortalStore from '../store/store';
import CraftAPIHelper from '../api/craftAPIHelper';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

const LightTheme: Theme = {
  isLight: true,
  primaryBackground: 'white',
  seperatorColor: '#f2f2f2',
  primaryTextColor: '#222222',
  disabledTextColor: '#86868A',
  blockHoverBackground: '#e9e9e9',
  accentColor: 'white',
  secondaryBackground: '#FAFAFA',
  taskCanceledBackground: '#F3F4F4',
  taskCheckedBackground: '#ECF7F4',
  taskUnCheckedBackground: '#FEECEF',
  iconColor: '#807F80',
  inputTextBorderColor: '#DEDEDF',
  placeholderTextColor: '#BDBDBD',
  linkTextColor: '#0F5392',
  toggleSwitchDisabledBackground: '#D9D8DA',
  invertedPrimaryBackground: '#57585C',
  invertedPrimaryTextColor: '#FFFFFF',
};

const DarkTheme: Theme = {
  ...LightTheme,
  isLight: false,
  primaryBackground: '#222222',
  seperatorColor: '#333333',
  primaryTextColor: 'white',
  disabledTextColor: '#8F8E90',
  blockHoverBackground: '#3a3a3a',
  accentColor: 'black',
  secondaryBackground: '#262626',
  taskCanceledBackground: '#2E2E2F',
  taskCheckedBackground: '#1F3326',
  taskUnCheckedBackground: '#322427',
  iconColor: '#D5D5D5',
  inputTextBorderColor: '#404140',
  placeholderTextColor: '#585959',
  linkTextColor: '#8FDEF9',
  toggleSwitchDisabledBackground: '#3F3F42',
  invertedPrimaryBackground: '#C9C9C9',
  invertedPrimaryTextColor: '#262727',
};

export const LightYellowTheme: Theme = {
  ...LightTheme,
  accentColor: '#E4C010',
  linkTextColor: '#82701A',
};

export const LightPurpleTheme: Theme = {
  ...LightTheme,
  accentColor: '#5E02D2',
  linkTextColor: '#3E127B',
};

export const LightGreenTheme: Theme = {
  ...LightTheme,
  accentColor: '#00C2A6',
  linkTextColor: '#0F7165',
};

export const LightPinkTheme: Theme = {
  ...LightTheme,
  accentColor: '#D6179B',
  linkTextColor: '#7A1C5F',
};

export const LightBlueTheme: Theme = {
  ...LightTheme,
  accentColor: '#0086FF',
  linkTextColor: '#0E5493',
};

export const LightGreyTheme: Theme = {
  ...LightTheme,
  accentColor: '#8D8E93',
  linkTextColor: '#383F46',
};

export const DarkBlueTheme: Theme = {
  ...DarkTheme,
  accentColor: '#2EC8FF',
  linkTextColor: '#91DEFA',
};

export const DarkPurpleTheme: Theme = {
  ...DarkTheme,
  accentColor: '#BF8BFF',
  linkTextColor: '#D8BEF9',
};

export const DarkGreenTheme: Theme = {
  ...DarkTheme,
  accentColor: '#4CFFDD',
  linkTextColor: '#A0F9E9',
};

export const DarkPinkTheme: Theme = {
  ...DarkTheme,
  accentColor: '#FF6AD1',
  linkTextColor: '#F9AEE2',
};

export const DarkGreyTheme: Theme = {
  ...DarkTheme,
  accentColor: '#8D8E93',
  linkTextColor: '#D7DBDE',
};

export const DarkYellowTheme: Theme = {
  ...DarkTheme,
  accentColor: '#FFE97C',
  linkTextColor: '#FAEEB7',
};

export const useTheme = () => {
  const [theme, setTheme] = useState(LightBlueTheme);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const accentColor = usePortalStore((state: PortalMainStore) => state.accentColor);
  const setPlatform = usePortalStore((state: PortalMainStore) => state.setPlatform);

  useLayoutEffect(() => {
    const matched = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (matched) {
      document.body.style.background = DarkTheme.primaryBackground;
    } else {
      document.body.style.background = LightTheme.primaryBackground;
    }

    window.setTimeout(() => {
      setThemeLoaded(true);
    }, 200);

    CraftAPIHelper.onEnvironmentUpdated((env: Environment) => {
      setPlatform(env.platform);

      document.body.style.removeProperty('background');
      if (env.colorScheme === 'dark') {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }

      setThemeLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      switch (accentColor) {
        case 'Blue':
          setTheme(DarkBlueTheme);
          break;
        case 'Green':
          setTheme(DarkGreenTheme);
          break;
        case 'Grey':
          setTheme(DarkGreyTheme);
          break;
        case 'Pink':
          setTheme(DarkPinkTheme);
          break;
        case 'Purple':
          setTheme(DarkPurpleTheme);
          break;
        case 'Yellow':
          setTheme(DarkYellowTheme);
          break;
        default:
      }
    } else {
      switch (accentColor) {
        case 'Blue':
          setTheme(LightBlueTheme);
          break;
        case 'Green':
          setTheme(LightGreenTheme);
          break;
        case 'Grey':
          setTheme(LightGreyTheme);
          break;
        case 'Pink':
          setTheme(LightPinkTheme);
          break;
        case 'Purple':
          setTheme(LightPurpleTheme);
          break;
        case 'Yellow':
          setTheme(LightYellowTheme);
          break;
        default:
      }
    }
  }, [accentColor, isDarkMode]);

  return { theme, themeLoaded };
};
