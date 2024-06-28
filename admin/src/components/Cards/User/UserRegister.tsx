import { Link } from "react-router-dom";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';

// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack, useTheme } from '@mui/material';
import { fNumber, fPercent } from "../../../utils/formatNumber";
import Iconify from "../../Iconify";
import BaseOptionChart from "../../chart/BaseOptionChart";
type Props = {
  color: string;
  icon: string;
  title: string;
  dataKey: string;
  number: number | string;
  percentage: number;
  chartData: object[];
};

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


// ----------------------------------------------------------------------


const PRODUCT_NAME = [
  'Small Granite Computer',
  'Small Rubber Mouse',
  'Awesome Rubber Hat',
  'Sleek Cotton Sausages',
  'Rustic Wooden Chicken',
];
  export const data = [...Array(5)].map((_, index) => ({
    id: 1,
    name: PRODUCT_NAME[index],
    image: "",
    price: 12,
    priceSale: index === 0 || index === 3 ? 0 :12,
    colors: (index === 0 && ['#2EC4B6', '#E71D36', '#FF9F1C', '#011627']) ||
      (index === 1 && ['#92140C', '#FFCF99']) ||
      (index === 2 && ['#0CECDD', '#FFF338', '#FF67E7', '#C400FF', '#52006A', '#046582']) ||
      (index === 3 && ['#845EC2', '#E4007C', '#2A1A5E']) || ['#090088'],
  }));
const UserRegister = ({data}:any) => {
    const percent=90
    const theme=useTheme()

    
      const options = {
        chart: {
          type: 'bar',
          width:50,
          animations: { enabled: true }, sparkline: { enabled: true } ,
        },
        xaxis: {
          categories: data?.newUserCounts?.map(point => point._id),
        },
        
     
      };
    // const chartOptions = merge(BaseOptionChart(), {
    //     colors: ["#00000"],
    //     chart: {      type: 'line',
    //         height: 350,animations: { enabled: true }, sparkline: { enabled: true } },
    //     stroke: { width: 2 },
    //     xaxis: {
    //         categories: data?.newUserCounts?.map(point => point._id),
    //       },
    //     // xaxis: {
    //     //     categories: data?.newUserCounts.map(point => point._id),
    //     //   },
    //     // tooltip: {
    //     //   x: { show: false },
    //     //   y: {
    //     //     formatter: (seriesName) => fNumber(seriesName),
    //     //     title: {
    //     //       formatter: () => '',
    //     //     },
    //     //   },
    //     //   marker: { show: false },
    //     // },
    //   });
      const series = [
        {
          name: 'Total',
          data: data?.newUserCounts?.map(point => point.total),
        },
      ];
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle2" paragraph>
        {"title"}
      </Typography>
      {/* <Typography variant="h3" gutterBottom>
        {fNumber(total)}
      </Typography> */}

      <Stack direction="row" alignItems="center">
        <IconWrapperStyle
          sx={{
            ...(data?.percentageChange < 0 && {
              color: 'error.main',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
            }),
          }}
        >
          <Iconify width={16} height={16} icon={percent >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'} sx={undefined} />
        </IconWrapperStyle>

        <Typography variant="subtitle2" component="span">
          {data?.percentageChange > 0 && '+'}
          {fPercent(data?.percentageChange)}
        </Typography>
        <Typography variant="body2" component="span" noWrap sx={{ color: 'text.secondary' }}>
          &nbsp;than month
        </Typography>
      </Stack>
    </Box>

    <ReactApexChart options={options} series={series} type="bar" width={50} height={80} />
  </Card>
  );
};

export default UserRegister;
