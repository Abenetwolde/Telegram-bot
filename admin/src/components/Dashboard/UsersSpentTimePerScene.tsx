import { useState, useEffect } from 'react';
import axios from 'axios';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';
import { Box, Typography } from '@mui/material';
import { BaseOptionChart } from '../chart';

const UsersSpentTimePerScene = ({filter}:any) => {
  const [chartData, setChartData] = useState([]);
console.log("....................", filter);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`kpi/get-user-spent-per-scene-name?interval=${filter}`);
        console.log("ajsdddd..........................." ,response.data);
        setChartData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [filter]);
// console.log(chartData)
const label:any=chartData?.map((name):any=>name?.sceneName)
const value:any=chartData?.map((name)=>name?.totalDurationInMinutes)
const CHART_DATA = [{ data: value }];
console.log(value,label)
const options =merge(BaseOptionChart(), {
  tooltip: {
    marker: { show: false },
    y: {
      formatter: (value) => `${Number(value).toFixed(2)} minute`,
      title: {
        formatter: () => '',
      },
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    style: {
      colors: ['#fff']
    },
    formatter: function (val, opt) {
      return  opt.w.globals.labels[opt.dataPointIndex] + ":  " + `${Number(val).toFixed(2)} minute`
    },
    offsetX: 0,
    dropShadow: {
      enabled: true
    }
  },
  stroke: {
    width: 1,
    colors: ['#fff']
  },
  plotOptions: {
    bar: {
      barHeight: '100%',
      borderRadius:0,
      distributed: true,
      horizontal: true,
      dataLabels: {
        position: 'bottom'
      },
    }
  },
  xaxis: {
    categories: label,
  },
});

  return (
    <div>
        <Box sx={{ mt: 3, mb: 3, flex: 1, width: "100%", height:"400px" ,justifyContent: 'flex-end', alignItems: 'center' }}>
             {/* {chartData?.totalDurationInMinutes!==0?<Typography  > Total Minute: {chartData?.totalDurationInMinutes&&chartData?.totalDurationInMinutes.toFixed(2)} Clicks {filter}</Typography>:<Typography>There isnt any Click {filter}</Typography>}  */}
              </Box>
      {/* <div id="chart"> */}
        {/* <ReactApexChart
        options={options} 
        series={value} type="pie"    width="100%" // Set the width to 100% of the container
        height="400px"
  
        /> */}
                <ReactApexChart type="bar" series={CHART_DATA} options={options} height={"100%"} />
      </div>
 
   
  );
};

export default UsersSpentTimePerScene;
