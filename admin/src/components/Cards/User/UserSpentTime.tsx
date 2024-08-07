
import ReactApexChart from 'react-apexcharts';
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack, useTheme, Skeleton } from '@mui/material';
import { fNumber, fPercent } from "../../../utils/formatNumber";
import Iconify from "../../Iconify";
import { useGetUserTimeSpentCardQuery } from '../../../redux/Api/userKpiSlice';
import { useTranslation } from 'react-i18next';

const IconWrapperStyle = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  color: theme.palette.success.main,
  backgroundColor: alpha(theme.palette.success.main, 0.16),
}));

const UsersSpentTime = ({ anotherComponentRef,  }: any) => {
  const { t } = useTranslation();
  const {data, isLoading,error}=useGetUserTimeSpentCardQuery()
  const percent = 90
  const theme = useTheme()
  const options = {
    chart: {
      type: 'line',
      width: 50,

      animations: { enabled: true }, sparkline: { enabled: true },
    },
    stroke: {
      width: 2
    },
    xaxis: {
      categories: data?.thisMonth?.map(point => point._id),
    },
    tooltip: {
      enabled: false, // Disable tooltip
    },
    colors: [theme.palette.secondary.main]
  };
  const series = [
    {
      name: 'Total',
      data: data?.thisMonth?.map(point => point?.totalDurationInMinutes),
    },
  ];
  const handleViewMore = () => {
    if (anotherComponentRef.current) {
      anotherComponentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <Box sx={{ flexGrow: 1, }}>
        <Box sx={{ display: 'flex', }}>
          <IconWrapperStyle
            sx={{
                color: 'secondary.main',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.16),
  
            }}
          >
            <Iconify width={30} height={30} icon={'fluent:phone-screen-time-20-regular'} sx={undefined} />
          </IconWrapperStyle>
          <Typography color={"text.secondary"} variant="subtitle2" paragraph>
       {   t('users_spend_time_per_month')}
          </Typography>
        </Box>

        <Typography variant="h3" gutterBottom>
        {isLoading? <Skeleton/>:fNumber(data?.totalTimeSpentThisMonth)}min
        </Typography>

        <Stack direction="row" alignItems="center">
        {isLoading?<Skeleton variant="circular" width={30} height={30} />:   <IconWrapperStyle
            sx={{
              ...(data?.percentageChange < 0 && {
                color: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
              }),
            }}
          >
            <Iconify width={16} height={16} icon={data?.percentageChange >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'} sx={undefined} />
          </IconWrapperStyle>
}
          <Typography variant="subtitle2" component="span">
            {isLoading?<Skeleton variant="rectangular"/>:data?.percentageChange > 0 && '+'}
            {isLoading?<Skeleton variant="rectangular"/>:fPercent(data?.percentageChange)}
          </Typography>
          <Typography variant="body2" component="span" noWrap sx={{ color: 'text.secondary' }}>
            &nbsp;{t('than_last_month')}
          </Typography>

        </Stack>
        <Typography variant="body2" component="span" noWrap sx={{ color: theme.palette.info.main, pt: 10, cursor: 'pointer' }} onClick={handleViewMore} >
        {t('more')}
        </Typography>
      </Box>
      <Box sx={{ width: '100%', pl: 3 }} >
      {isLoading?<Skeleton variant="rectangular" width={"100%"} height={100} />:
        <ReactApexChart options={options} series={series} type="line" width={"95%"} height={"80%"} />}
      </Box>

    </Card>
  );
};

export default UsersSpentTime;
