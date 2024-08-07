import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';
import { Box, Card, CardHeader, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const UserRates = () => {
  const { t } = useTranslation();
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [options, setOptions] = useState({
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await api.get('kpi/get-users-rating');
        const data = response.data;

        const seriesData = [];
        const labelsData = [];
        
        for (const [key, value] of Object.entries(data)) {
          seriesData.push(value);
          if (key === "6") {
            labelsData.push("No thanks");
          } else if (key === "7") {
            labelsData.push("Later");
          } else {
            labelsData.push(`${'⭐'.repeat(Number(key))}`);
          }
        }

        setSeries(seriesData);
        setLabels(labelsData);
        setOptions(prevOptions => ({
          ...prevOptions,
          labels: labelsData
        }));
      } catch (error) {
        console.error('Error fetching rating data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return (
    <Card className='p-3 mt-5'>
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <CardHeader title={t('user_rates')} sx={{ mb: 3 }} />
      </Box>
      {loading ? (
        <Box sx={{ width: 380, height: 380 }}>
          <Skeleton variant="rectangular" width={380} height={40} />
          <Skeleton variant="circular" width={40} height={40} sx={{ my: 2 }} />
          <Skeleton variant="rectangular" width={380} height={300} />
        </Box>
      ) : (
        <ReactApexChart options={options} series={series} type="pie" width={"100%"} />
      )}
    </Card>
  );
};

export default UserRates;
