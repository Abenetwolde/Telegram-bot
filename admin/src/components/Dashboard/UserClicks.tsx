import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';
import { Box, Typography } from '@mui/material';

const UserClicks = ({filter}:any) => {
  const [chartData, setChartData] = useState({
    totalClicks: 0,
    clicksByDate: []
  });
console.log("....................", filter);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`kpi/get-user-clicks?interval=${filter}`);
        setChartData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [filter]);
console.log(chartData)
  return (
    <div>
        <Box sx={{ mt: 3, mb: 3, flex: 1, width: "100%", justifyContent: 'flex-end', alignItems: 'center' }}>
             {chartData?.totalClicks!==0?<Typography  > Total Clicks: {chartData?.totalClicks&&chartData?.totalClicks.toFixed(2)} Clicks {filter}</Typography>:<Typography>There isnt any Click {filter}</Typography>} 
              </Box>
      {/* <div id="chart"> */}
        <ReactApexChart
          options={{
            chart: {
              height: '100%',
              type: 'line',
              zoom: {
                enabled: false
              }
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'straight'
            },
            // title: {
            //   text: 'Product Trends by Month',
            //   align: 'left'
            // },
            grid: {
              row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
              },
            },
            xaxis: {
              categories: chartData?.clicksByDate?.map(data => data.date),
            }
          }}
          series={[{
            name: 'Total Clicks',
            data: chartData?.clicksByDate?.map(data => data.totalClicks)
          }]}
          type="line"
          height={"100%"}
        />
      </div>
 
   
  );
};

export default UserClicks;
