import { ReactNode, useMemo } from 'react';
import PropTypes from 'prop-types';
// @mui
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider as MUIThemeProvider, StyledEngineProvider, Theme } from '@mui/material/styles';
// hooks
import useSettings from '../hooks/useSettings';
//
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';

// ----------------------------------------------------------------------

interface ThemeProviderProps {
  children: ReactNode;
  themeDirection: any;
}
interface ThemeOptions extends Theme {
  palette: any;
  typography: any;
  breakpoints: any;
  shape: {
    borderRadius: number;
  };
  direction: any;
  shadows: any;
  customShadows: any;
}
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { themeMode, themeDirection }:any = useSettings();
  const isLight = themeMode === 'light';

  const themeOptions:any = useMemo(() => ({
    palette: isLight ? palette.light : palette.dark,
    typography,
    breakpoints,
    shape: { borderRadius: 8 },
    direction: themeDirection,
    shadows: isLight ? shadows.light : shadows.dark,
    customShadows: isLight ? customShadows.light : customShadows.dark,
  }), [isLight, themeDirection]);

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
