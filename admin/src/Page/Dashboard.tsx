import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Row } from "antd";
import { ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';



import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS fil
import api from '../services/api';


import { ButtonGroup, CardHeader, Container, Grid, IconButton, InputAdornment, TextField, styled, useTheme } from '@mui/material';
import { Box, Card, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import LanguagePieChart from '../components/Dashboard/LanguagePieChart';
import UserSpentTime from '../components/Dashboard/SpentTime';
import LanguageDistributionCard from '../components/Dashboard/LanguageDistributionCard';

import UserClicksChart from '../components/Dashboard/UserClicksChart';
import UserClicksSection from '../components/Dashboard/USerSpentPerScene';
import UserLottery from '../components/Dashboard/userLottery';

import UserPerformance from '../components/Dashboard/USerPerformance';
import useSettings from '../hooks/useSettings';
import UserRegister from '../components/Cards/User/UserRegister';
// import UsersClick from '../components/Cards/User/UserClick';
import UsersSpentTime from '../components/Cards/User/UserSpentTime';
import UsersClickperMonth from '../components/Cards/User/UsersClick';
import UserRegistration from '../components/Dashboard/UserRegistration';
import UserJoinFromCard from '../components/Dashboard/UserJoinFromCard';

import TopUsersClick from '../components/Dashboard/TopUsersClick';
import TopUsersTime from '../components/Dashboard/TopUsersTime';
import { useTranslation } from 'react-i18next';
import UserRates from '../components/Dashboard/Rate';


const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

const Dashboard = () => {


  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    // Fetch data from the API
    api.get('/kpi/get-users-with-lottery-numbers') // Replace with your actual API endpoint
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const { t } = useTranslation();
  const { themeStretch } = useSettings();

  const userregister = useRef(null);
  const userrefTime = useRef(null);
  const userCLick = useRef(null);
  return (
    <Container maxWidth={themeStretch ? false : 'xl'}>
    
        <Grid container spacing={2}>
          <Grid lg={4} md={4} xl={4} xs={12} item  justifyContent="center">
            <UserRegister anotherComponentRef={userregister}  />
          </Grid>
          <Grid lg={4}md={4} xl={4} xs={12} item  justifyContent="center">
            <UsersSpentTime anotherComponentRef={userrefTime} />
          </Grid>
          <Grid lg={4} md={4} xl={4} xs={12} item  justifyContent="center">
           <UsersClickperMonth anotherComponentRef={userCLick}/>
          </Grid>
        </Grid>





        <Grid container ref={userregister}spacing={3} direction={{ xs: 'column', lg: 'row' }} width="100%">
        <Grid item xs={12} md={8} lg={8}>
          <UserRegistration/>
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          <LanguageDistributionCard
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={5} ref={userrefTime}>
        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
        <UserSpentTime /> 
        </Grid>
     
        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
        <UserClicksChart
            />
            
        </Grid>
     
      </Grid>

      <Grid container spacing={3} mt={5}  ref={userCLick}>

<Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
        <UserRates
            />
            
        </Grid>
        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
          {/* <UserPerformance isFalse={false} /> */}
          <UserClicksSection
        />
        </Grid>
        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">

<UserJoinFromCard />
</Grid>
<Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
        <TopUsersClick
        />
        </Grid>
      </Grid>
      

      
      <Grid container spacing={3} mt={5}>
   

        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
        <TopUsersTime
            />
            
        </Grid>

        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
          <UserPerformance isFalse={false} />
        </Grid>

    

   
      </Grid>

      
      <Grid container spacing={3} mt={5}>
       
        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
        <Card className="p-4">      
          <Box sx={{ mb: 3, textAlign: 'left' }}>
               <CardHeader title={t('user_lottery_numbers') }/>
               </Box>
            <ResponsiveContainer width="100%" height={300}>
              <UserLottery data={data} loading={loading} />
            </ResponsiveContainer>
          </Card>
        </Grid>
        {/* <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
          <UserRates />
        </Grid> */}
      </Grid>
   
    </Container >
  );
};

export default Dashboard;
