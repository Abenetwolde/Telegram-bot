// LanguageDistributionCard.js

import { Card, Typography } from '@mui/material';
import LanguagePieChart from './LanguagePieChart';

const LanguageDistributionCard = ({ languageData }) => (
  <Card
    sx={{
      width: { xs: '100%', lg: '100%' },
     mb: { xs: 5, lg: 2 },
      mt: { xs: 5, lg: 2 },
      height: '100%',
      borderRadius: '16px',
      boxShadow: 3,
      p: 2,
      textAlign: 'center'
    }}
  >
    <Typography sx={{ color: 'text.primary', fontSize: 'subtitle1.fontSize', textAlign: 'left' }}>
      Language Distribution
    </Typography>
    {languageData ? (
      <LanguagePieChart data={languageData} />
    ) : (
      <Typography>Loading...</Typography>
    )}
  </Card>
);

export default LanguageDistributionCard;
