
import ReactApexChart from 'react-apexcharts';
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack, useTheme } from '@mui/material';
import { fNumber, fPercent } from "../../../utils/formatNumber";
import Iconify from "../../Iconify";


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

const UsersClickperMonth = ({anotherComponentRef, data }: any) => {
  const seriesData = data?.thisMonth?.flatMap((item) => item?.clicksByDate?.map((c) => c.totalProductClicks)) || [];
  const categoriesData = data?.thisMonth?.flatMap((item) => item?.clicksByDate?.map((c) => c.date)) || [];



  const percent = 90
  const theme = useTheme()
  const options = {
    chart: {
      type: 'bar',
      width: 50,
      animations: { enabled: true }, sparkline: { enabled: true },
    },
    xaxis: {
      categories: categoriesData
    },
    tooltip: {
      enabled: true, // Disable tooltip
    },
    colors:[theme.palette.success.main]
  };
  const series = [
    {
      name: 'Total',
      data:seriesData
    },
  ];
  const handleViewMore = () => {
    if (anotherComponentRef.current) {
      anotherComponentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', }}>
          <IconWrapperStyle
            sx={{
                color: 'success.main',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.16),
  
            }}
          >
            <Iconify width={30} height={30} icon={'tdesign:gesture-click'} sx={undefined} />
          </IconWrapperStyle>
          <Typography color={"text.secondary"} variant="subtitle2" paragraph>
            Users Click per month
          </Typography>
     
        </Box>
        <Typography variant="h3" gutterBottom >
          {fNumber(data?.totalClickThisMonth)}
        </Typography>
        <Stack direction="row" alignItems="center">
          <IconWrapperStyle
            sx={{
              ...(data?.percentageChange < 0 && {
                color: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
              }),
            }}
          >
            <Iconify width={16} height={16} icon={data?.percentageChange >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'} sx={undefined} />
          </IconWrapperStyle>

          <Typography variant="subtitle2" component="span">
            {data?.percentageChange > 0 && '+'}
            {fPercent(data?.percentageChange)}
          </Typography>
          <Typography variant="body2" component="span" noWrap sx={{ color: 'text.secondary' }}>
            &nbsp;than last month
          </Typography>

        </Stack>
        <Typography variant="subtitle2" paragraph component="span" noWrap sx={{ color: theme.palette.info.main, pt:10, cursor:'pointer' }}   onClick={handleViewMore} >
          view more
        </Typography>
      </Box>

  <Box sx={{ width: '100%',pl:3 }} >
      <ReactApexChart options={options} series={series} type="bar" width={"95%"} height={"80%"} />
      </Box>
    </Card>
  );
};

export default UsersClickperMonth;