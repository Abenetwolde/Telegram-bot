import PropTypes from 'prop-types';
// @mui
import { Card, CardHeader, Typography, Stack, LinearProgress, Skeleton, Box, useTheme } from '@mui/material';
import { fPercent } from '../../utils/formatNumber';
import FilterButtonGroup from '../FilterButtonGroup';
import { useGetOrderByStatusQuery } from '../../redux/Api/Order';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// utils
;


export default function AllOrderStatus({handleFilterOFStatusChange,filterOfStatus}:any) {
  const { data, error, isLoading } = useGetOrderByStatusQuery(filterOfStatus);
  const [orderStatus, setOrderStatus] = useState([]);

  useEffect(() => {
    if (data) {
      const aggregatedData = aggregateData(data?.result);
      setOrderStatus(aggregatedData);
    }
  }, [data]);

  const aggregateData = (data) => {
    const statusCounts = data.reduce((acc, day) => {
      day.orders.forEach((order) => {
        acc[order.status] = (acc[order.status] || 0) + order.count;
      });
      return acc;
    }, {});
    const totalCount: any = Object.values(statusCounts).reduce((acc, count) => acc + count, 0);

    return Object.entries(statusCounts).map(([status, count]: any) => ({
      label: `Total ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      amount: count,
      value: ((count / totalCount) * 100).toFixed(2) // Calculate percentage
    }));
  };
  function LoadingIndicator() {
    return(
      <Box className="p-3">
        
        <Stack direction="row" spacing={2} sx={{ p: 2 }}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </Stack>
        <Stack spacing={4} sx={{ p: 3 }}>
          {Array.from(new Array(4)).map((_, index) => (
            <SkeletonProgressItem key={index} />
          ))}
        </Stack>
      </Box>
    );
  }
  const theme=useTheme()
function SkeletonProgressItem() {
    return (
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center">
          <Skeleton variant="text" width={150} height={30} />
          <Skeleton variant="text" width={50} height={30} />
          <Skeleton variant="text" width={50} height={30} />
        </Stack>
        <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 5 }} />
      </Stack>
    );
  }
  const { t } = useTranslation();
  if (error) return <p>Error fetching data: {error.message}</p>
  return (
    <Card className='p-3'>
      <CardHeader sx={{ mb: 3, textAlign: 'left' }}  title={t('all_order_status')} />
      <FilterButtonGroup handlefilter={handleFilterOFStatusChange} filter={filterOfStatus}/>
      <Stack spacing={4} sx={{ p: 3 }}>
        { isLoading?LoadingIndicator():
        orderStatus?.length?orderStatus?.map((progress) => (
          <ProgressItem key={progress.label} progress={progress} />
        )):  <div style={{ textAlign: 'center', color: theme.palette.text.secondary, fontSize: '14px', marginTop: '20px' }}>
        No data found
      </div>}
      </Stack>
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
