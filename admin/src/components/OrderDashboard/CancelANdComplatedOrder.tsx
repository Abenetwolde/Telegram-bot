import PropTypes from 'prop-types';
// @mui
import { Card, CardHeader, Typography, Stack, LinearProgress, Box } from '@mui/material';
import { fPercent } from '../../utils/formatNumber';
import FilterButtonGroup from '../FilterButtonGroup';
import ReactApexChart from 'react-apexcharts';
// utils
;


export default function CancelANdComplatedOrder({OrderStatus,handleFilterOFStatusChange,filterOfStatus}:any) {
  const chartOptions = {
    chart: {
      type: 'area',
    },
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      curve: 'smooth',
    },
  };
  console.log("@order Status......", OrderStatus)
  return (
    <Card className='p-3'>
         <CardHeader title="Sales Overview" />
      {OrderStatus?.map((item) => (
        <Box  sx={{ mt: 3, mx: 3 }} dir="ltr">

            <ReactApexChart type="area" series={item} options={chartOptions} height={364} />
      
        </Box>
      ))}
    </Card>
  
  );
}

// ----------------------------------------------------------------------

ProgressItem.propTypes = {
  progress: PropTypes.shape({
    amount: PropTypes.number,
    label: PropTypes.string,
    value: PropTypes.number,
  }),
};

function ProgressItem({ progress }) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {progress.label}
        </Typography>
        <Typography variant="subtitle2">{progress.amount}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
               &nbsp;({fPercent(progress.value)})
        </Typography>
      </Stack>

      <LinearProgress
      valueBuffer={progress.value}
      sx={{ height: 8,
        borderRadius: 5,}}
        variant="determinate"
        value={progress.value}
        color={
          (progress.label === 'Total Delivered' && 'info') ||
          (progress.label === 'Total Pending' && 'warning') || (progress.label === 'Total Cancelled' && 'error') ||(progress.label === 'Total Complated' && 'success') ||
          'primary'
        }
      />
    </Stack>
  );
}
