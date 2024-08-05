// UserClicksChart.js
import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button, Card, CardHeader } from '@mui/material';
import { ResponsiveContainer } from 'recharts';
// import UserClicks from './UserClicks';
// import UserClicks from './UserClicks';

import FilterButtonGroup from '../FilterButtonGroup';
import { useTranslation } from 'react-i18next';
import UserClicks from './UserClicks';

const UserClicksChart = () => {
    const [filterClick, setfilterClick] = useState("perMonth"); 
    const { t } = useTranslation();
    const handlefilterClickChange = (newFilter) => {
        setfilterClick(newFilter);
    
      };
    return(<Card className='p-3 mt-5' >
        <Box sx={{ mb: 3, textAlign: 'left' }}>
            <CardHeader sx={{ mb: 3, textAlign: 'left' }} title={t('users_clicks')} sx={{ mb: 3 }} />
        </Box>
        <Box width="100%" textAlign="center">
            <FilterButtonGroup handlefilter={handlefilterClickChange} filter={filterClick} />
            <ResponsiveContainer height={400}>
                <UserClicks filter={filterClick} />
            </ResponsiveContainer>
        </Box>
    </Card>
    )

}

export default UserClicksChart;
