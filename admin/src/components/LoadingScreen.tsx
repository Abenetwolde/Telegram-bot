import PropTypes from 'prop-types';
import { m } from 'framer-motion';
// @mui
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import Logo from './Logo';
import ProgressBar from './ProgressBar';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

LoadingScreen.propTypes = {
  isDashboard: PropTypes.bool,
};

export default function LoadingScreen({ isDashboard, ...other }) {
  return (
    <>
      <ProgressBar />

      {!isDashboard && (
        <RootStyle {...other}>
          <Box
            component={m.div}
            initial={{ scale: 1.5 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <Logo disabledLink sx={{ width: 64, height: 64 }} isDisplay={false} />
          </Box>
        </RootStyle>
      )}
    </>
  );
}
