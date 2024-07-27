import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';


// ----------------------------------------------------------------------

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,

};

export default function Logo({ disabledLink = false, sx ,isDisplay=true}) {
  const theme = useTheme();
  const PRIMARY_LIGHT = theme.palette.primary.light;
  const PRIMARY_MAIN = theme.palette.primary.main;
  const PRIMARY_DARK = theme.palette.primary.dark;

  const logo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ...sx }}>
      <Box sx={{ width: 40, height: 40 }}>
        <img
          src='https://th.bing.com/th/id/OIP.fyCCXwkRz9vrY_TsNRq5rgHaHa?rs=1&pid=ImgDetMain'
          height="100%"
          width="100%"
          alt="Logo"
        />
      </Box>
     {isDisplay&& <Typography variant="h6" sx={{ color: PRIMARY_LIGHT }}>
        Logo
      </Typography>}
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}
