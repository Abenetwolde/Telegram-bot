import { useState, useEffect } from 'react';
import axios from 'axios';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';

import { Box, Typography, useTheme } from '@mui/material';
import { BaseOptionChart } from '../chart';
import { color } from 'framer-motion';

const UsersSpentTimePerScene = ({filter, filterData}:any) => {
// console.log(chartData)
const label:any=filterData?.map((name):any=>name?.sceneName)
const value:any=filterData?.map((name)=>name?.totalDurationInMinutes)
const CHART_DATA = [{ data: value }];
const theme=useTheme()
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
      colors: [theme.palette.info.dark]
    },
    formatter: function (val, opt) {
      return   `${Number(val).toFixed(2)} min`
    },
    // offsetX: 0,
    // dropShadow: {
    //   enabled: true
    // }
  },
  stroke: {
    width: 1,
    colors: ['#fff']
  },
  plotOptions: {
    bar: {
      barHeight: '100%',
      borderRadius:0,
      distributed: false,
      horizontal: true,
      dataLabels: {
        position: 'bottom'
      },
    }
  },
  xaxis: {
    categories: label,
  },
  colors:theme.palette.info.main
});
 
  return (
    <div style={{ height: "100%", flexGrow: 1 }}>
<ReactApexChart type="bar" series={CHART_DATA} options={options} height={"100%"} />
      </div>
 
   
  );
};

export default UsersSpentTimePerScene;
