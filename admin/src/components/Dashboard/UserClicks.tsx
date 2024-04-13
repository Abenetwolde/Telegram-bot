import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';

const UserClicks = ({filterClick}:any) => {
  const [chartData, setChartData] = useState({
    totalClicks: 0,
    clicksByDate: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`kpi/get-user-clicks?interval=${filterClick}`);
        setChartData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
console.log(chartData)
  return (
    <div>
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
          height={350}
        />
      </div>
 
   
  );
};

export default UserClicks;
