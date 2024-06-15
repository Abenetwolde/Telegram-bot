import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Row } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format } from 'date-fns';


import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS fil
import api from '../services/api';


import { addDays } from 'date-fns'

import { ButtonGroup, CardHeader, Container, Grid, IconButton, InputAdornment, TextField, styled, useTheme } from '@mui/material';
import { Box, Card, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import LanguagePieChart from '../components/Dashboard/LanguagePieChart';
import UserSpentTime from '../components/Dashboard/SpentTime';
import UserClicks from '../components/Dashboard/userClicks';
import UsersSpentTimePerScene from '../components/Dashboard/UsersSpentTimePerScene';
import UserRegistration from '../components/Dashboard/UserRegistration';
import LanguageDistributionCard from '../components/Dashboard/LanguageDistributionCard';
import TotalCountCardGrid from '../components/Dashboard/TotalCountCardGrid';
import UserClicksChart from '../components/Dashboard/UserClicksChart';
import UserClicksSection from '../components/Dashboard/USerSpentPerScene';
import UserLottery from '../components/Dashboard/userLottery';
import UserSpentTimeTable from '../components/Dashboard/userSpentTimeTable';
import FilterButtonGroup from '../components/FilterButtonGroup';
import UserClickTable from '../components/Dashboard/UserClickTable';
import UserPerformance from '../components/Dashboard/USerPerformance';
import UserPerformanceIndicator from '../components/Dashboard/UserPerformanceIndicator';
import LoadingIndicator from '../components/LoadingIndicator';
import ReactApexChart from 'react-apexcharts';
import BaseOptionChart from '../components/chart/BaseOptionChart';
import { merge } from 'lodash';
import useSettings from '../hooks/useSettings';
import AllOrderStatus from '../components/OrderDashboard/AllOrderStatus';
import CancelANdComplatedOrder from '../components/OrderDashboard/CancelANdComplatedOrder';
const CustomTooltip = ({ label, payload }) => {
  const total = payload.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="bg-white border border-gray-300 p-2">
      <p className="font-semibold">Date: {label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
      <p className="font-semibold">Total: {total}</p>
    </div>
  );
};
const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

const CHART_DATA = [4344, 5435, 1443, 4443];
const OrderDashboard = () => {
  const theme = useTheme()
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection'
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [iscancelOrderLoading, setIsCancelOrderLoading] = useState(true);

  const [totalUserCount, setTotalUserCount] = useState<number | undefined>(0);
  const [totalOrderCount, setTotalOrderCount] = useState<number | undefined>(undefined);
  const [totalCancelOrderCount, setTotalCancelOrderCount] = useState<number | undefined>(undefined);
  const [newOrderData, setNewOrderData] = useState([]);
  const [newCancelOrderData, setNewCancelOrderData] = useState([]);
  const [userCounts, setUserCounts] = useState([]);
  const [opacity, setOpacity] = useState({ frombotcount: 1, fromchannelcount: 1, frominvitation: 1 });
  const [languageData, setLanguageData] = useState(null);
  const [filter, setFilter] = useState('perYear');
  const [filterClick, setfilterClick] = useState("perMonth"); // Initialize the state with the default value
  const [filterScene, setfilterScene] = useState("perMonth");
  const [userRegisteringWay, setuserRegisteringWay] = useState([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [datauserspentperscene, setDataTimeSpentPerScene] = useState<any[]>([]);
  const [loadingdataspenttimescene, setLoadingsetDataTimeSpentPerScene] = useState(true);
  const [filterUserTimeTable, setFilterUserTimeTable] = useState('perMonth');

  const [datauserclcik, setDataUserClick] = useState<any[]>([]);
  const [loadingdatauserClick, setLoadinguserClick] = useState(true);
  const [filterUserClickTable, setFilterUserClickTable] = useState('perMonth');

  const [userperformance, setDataUserperformance] = useState<any[]>([]);
  const [loadingUserPerformance, setLoadingUserPerformance] = useState(true);
  const [filterUserPerformanceTable, setFilterUserPerformance] = useState('perMonth');

  const handlefilterClickChange = (newFilter) => {
    setfilterClick(newFilter);

  };
  const handlefilterTimePerScenceClickChange = (newFilter) => {
    setfilterScene(newFilter);

  };
  const handleFilterUserClickTable = (newFilter) => {
    setFilterUserClickTable(newFilter);

  };
  const handleFilterUserPerformanceTable = (newFilter) => {
    setFilterUserPerformance(newFilter);

  };

  const refOne = useRef(null)
  const handleMouseEnter = (o) => {
    const { dataKey } = o;
    setOpacity(prevOpacity => ({ ...prevOpacity, [dataKey]: 0.5 }));
  };
  useEffect(() => {

    document.addEventListener("keydown", hideOnEscape, true)
    document.addEventListener("click", hideOnClickOutside, true)
  }, [])

  // hide dropdown on ESC press
  const hideOnEscape = (e) => {
    // console.log(e.key)
    if (e.key === "Escape") {
      setOpen(false)
    }
  }

  // Hide dropdown on outside click
  const hideOnClickOutside = (e) => {
    if (refOne.current && !refOne.current.contains(e.target)) {
      setOpen(false)
    }
  }

  const handleMouseLeave = (o) => {
    const { dataKey } = o;
    setOpacity(prevOpacity => ({ ...prevOpacity, [dataKey]: 1 }));
  };






  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    //  setRange([]);
  };

  const handlefilterScene = (string) => {
    setfilterScene(string);
    //  setRange([]);
  };
  const handleFilterUserTimeTable = (string) => {
    setFilterUserTimeTable(string);
    //  setRange([]);
  };



  const { themeStretch } = useSettings();
  const [OrderStatus, setOrderStatus] = useState([]);
  const [cancelAndComplated, setcancelAndComplated] = useState([]);
  const [filterOfStatus, setFilterOFStatus] = useState("perYear");
  const handleFilterOFStatusChange = (filter) => {
    setFilterOFStatus(filter);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/order/getorderby-cancel-and-complated?interval=${filterOfStatus}`); // Replace with your actual API endpoint
        const data = response.data.result;
        const aggregatedData = aggregateData(data);
        const transformedData = transformData(data);
        setcancelAndComplated(transformedData)
        setOrderStatus(aggregatedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [filterOfStatus]);
  const aggregateData = (data) => {
    const statusCounts = data.reduce((acc, day) => {
      day.orders.forEach((order) => {
        acc[order.status] = (acc[order.status] || 0) + order.count;
      });
      return acc;
    }, {});

    const totalCount:any = Object.values(statusCounts).reduce((acc, count) => acc + count, 0);

    return Object.entries(statusCounts).map(([status, count]:any) => ({
      label: `Total ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      amount: count,
      value: ((count / totalCount) * 100).toFixed(2) // Calculate percentage
    }));
  };

  const transformData = (data) => {
    const transformedData = data.map((item) => {
      const cancelledOrders = item.orders.find(order => order.status === 'cancelled')?.count || 0;
      const completedOrders = item.orders.find(order => order.status === 'delivered')?.count || 0;
      console.log("cancelledOrders data",cancelledOrders)
      return {
        date: item.createdAt,
        cancelled: cancelledOrders,
        completed: completedOrders,
      };
    });
console.log("transform data",transformedData)
    return [
      {
        name: 'Cancelled Orders',
        data: transformedData.map(item => ({
          x: item.date,
          y: item.cancelled,
        })),
      },
      {
        name: 'Completed Orders',
        data: transformedData.map(item => ({
          x: new Date(item.date).getTime(),
          y: item.completed,
        })),
      },
    ];
  };
  return (
    <Container maxWidth={themeStretch ? false : 'xl'}>
      <TotalCountCardGrid
        // renderTotalCountCard={renderTotalCountCard}
        isLoading={isLoading}
        totalUserCount={totalUserCount}
        userCounts={userCounts}
        isOrderLoading={isOrderLoading}
        totalOrderCount={totalOrderCount}
        newOrderData={newOrderData}
        isCancelOrderLoading={iscancelOrderLoading}
        totalCancelOrderCount={totalCancelOrderCount}
        newCancelOrderData={newCancelOrderData}
      />
      <Grid container spacing={3} mt={5}>
        <Grid item xs={12} md={6} lg={6} width="100%" textAlign="center">
         <AllOrderStatus OrderStatus={OrderStatus} handleFilterOFStatusChange={handleFilterOFStatusChange} filterOfStatus={filterOfStatus}/>
            {/* <UserPerformance data={userperformance} loading={loadingUserPerformance} filterUserPerformanceTable={filterUserPerformanceTable} handleFilterUserPerformanceTable={handleFilterUserPerformanceTable} isFalse={false}  /> */}
          

        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <CancelANdComplatedOrder OrderStatus={cancelAndComplated} />
            {/* <EcommerceYearlySales /> */}
          </Grid>
        <Grid item xs={12} md={4} lg={4} width="100%" textAlign="center">

          {/* <Card>
            <CardHeader title="User Join From" />
            <ChartWrapperStyle dir="ltr">
              <ReactApexChart type="pie" series={valueforJoinUser} options={chartOptions} height={280} />
            </ChartWrapperStyle>
          </Card> */}
        </Grid>
      </Grid>


      <Grid container display="flex" spacing={4} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" minWidth="100%" mt={5}>
        <Grid item xs={12} md={6} lg={12} width="100%" textAlign="center">

          <Card
            sx={{
              width: '100%',
              mb: { xs: 5, lg: 2 },
              mt: { xs: 5, lg: 2 },
              height: 'auto',
              borderRadius: '16px',
              boxShadow: 3,
              p: 2,
              textAlign: 'center'
            }}
          >

            {/* <Grid container display={'flex'} spacing={2} alignItems={'center'} justifyContent={'space-between'} width={'auto'}>
              <Grid item xs={12} md={5}>
                <Typography sx={{ color: 'text.primary', fontSize: 'subtitle1.fontSize', textAlign: { xs: 'center', md: 'left' } }}>
                  User Spent Time Per Scene
                </Typography>
              </Grid>
              <Grid item xs={12} md={7}>
                <FilterButtonGroup handlefilter={handleFilterUserTimeTable} filter={filterUserTimeTable} />
              </Grid>
            </Grid> */}

     
          </Card>

        </Grid>

        <Grid item xs={12} md={12} lg={12} width="100%" textAlign="center">

          <Card
            sx={{
              width: '100%',
              mb: { xs: 5, lg: 2 },
              mt: { xs: 5, lg: 2 },
              height: 'auto',
              borderRadius: '16px',
              boxShadow: 3,
              p: 2,
              textAlign: 'center'
            }}
          >
      
          </Card>

        </Grid>
      </Grid>




    </Container >
  );
};

export default OrderDashboard;
