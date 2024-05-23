import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Row } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format } from 'date-fns';


import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS fil
import api from '../services/api';
import { DashboardTotalCountCard } from '../components/Dashboard/total-count-card';


import { addDays } from 'date-fns'
import DateRangeIcon from '@mui/icons-material/DateRange';
import { ButtonGroup, Grid, IconButton, InputAdornment, TextField, useTheme } from '@mui/material';
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
const Dashboard = () => {
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
  const handlefilterClickChange = (newFilter) => {
    setfilterScene(newFilter);
    console.log("newFilter.........", filterClick)
    // Update the state with the selected filter value
  };
  const handlefilterTimePerScenceClickChange = (newFilter) => {
    setfilterClick(newFilter);
    console.log("newFilter.........", filterClick)
    // Update the state with the selected filter value
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


  useEffect(() => {
    console.log("start" + range[0].startDate, "end" + range[0].endDate)
    const fetchData = async () => {
      try {
        const response = await api.post<any, any>('user/getuserrange', {

          startDate: range[0].startDate,
          endDate: range[0].endDate

        });

        await setUserCounts(response.data.newUserCounts);
        setTotalUserCount(response.data.totalUsers)

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [range]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`user/getnewuser?interval=${filter}`);
        const data = response.data.newUserCounts;
        // setUserCounts([]);
        setUserCounts(data);
        // await setUserCounts(response.data.newUserCounts);

        setTotalUserCount(response.data.totalUsers)

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();
  }, [filter])



  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    //  setRange([]);
  };

  const handlefilterScene = (string) => {
    setfilterScene(string);
    //  setRange([]);
  };

  useEffect(() => {
    console.log("start" + range[0].startDate, "end" + range[0].endDate)
    const fetchData = async () => {
      try {
        const response = await api.get<any, any>('user/language-stats');
        setLanguageData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await api.get<any, any>('kpi/get-user-joined-by-method');
        setuserRegisteringWay(response?.data?.formattedResult);
        console.log("user joining ways ",response.data)
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);
  console.log(userRegisteringWay,"skdoskfopk user ")
  const userJoiningWay = Object.entries(userRegisteringWay).map(([key, value]) => {
    let name;
  
    // Convert keys to a more readable format if necessary
    switch (key) {
      case 'BOT':
        name = 'Bot';
        break;
      case 'CHANNEL':
        name = 'Channel';
        break;
      case 'INVITATION':
        name = 'Invitation';
        break;
      default:
        name = key;
    }
  
    return {
      name: name,
      value: value
    };
  });
  

  
  console.log(userJoiningWay);



  const COLORSd = ['#0088FE', '#00C49F',  '#FF8042'];
  return (
    <Box pb={6} mb={6}>
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

      <Grid container display="flex" spacing={4} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" minWidth="100%" mt={5}>
        <Grid item xs={12} md={12} lg={12} width="100%" textAlign="center">
          <Box height={300} width={"100%"}>
            <ResponsiveContainer width="100%" height="100%">

              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={userJoiningWay}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {userJoiningWay.map((entry, index) => (
                    <Cell key={`cell-${index}`} style={{ outline: 'none' }} stroke="none" strokeWidth={1} fill={COLORSd[index]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ flexGrow: 1 }}
                  iconSize={15}
                  iconType="square"
                  layout="horizontal"
                  formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={4} direction={{ xs: 'column', lg: 'row' }} width="100%">
        <Grid item xs={12} lg={9}>
          <UserRegistration
            refOne={refOne}
            range={range}
            setRange={setRange}
            open={open}
            setOpen={setOpen}
            filter={filter}
            handleFilterChange={handleFilterChange}
            totalUserCount={totalUserCount}
            userCounts={userCounts}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            opacity={opacity}
            CustomTooltip={CustomTooltip}
          />
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <LanguageDistributionCard
            languageData={languageData}
          />
        </Grid>
      </Grid>

      <Grid container display="flex" spacing={4} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" minWidth="100%" mt={5}>
        <Grid item xs={12} md={12} lg={12} width="100%" textAlign="center">
          <ResponsiveContainer>
            <UserSpentTime />
          </ResponsiveContainer>
        </Grid>
      </Grid>

      <Grid container spacing={4} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mt={5}>
        <UserClicksSection
          filterScene={filterScene}
          handlefilterScene={handlefilterClickChange}
        />
      </Grid>

      <Grid container display="flex" spacing={4} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" minWidth="100%" mt={5}>
        <Grid item xs={12} md={12} lg={12} width="100%" textAlign="center">
          <ResponsiveContainer>
            <UserClicksChart
              filterClick={filterClick}
              handlefilterClickChange={handlefilterClickChange}
            />
          </ResponsiveContainer>
        </Grid>
      </Grid>



      {/* <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={3} minWidth="100%" mt={10}>
        <Box width="100%" textAlign="center">
          <Typography sx={{ color: 'text.secondary', fontSize: 'subtitle1.fontSize', textAlign: 'left' }}>
            Users Clicks
          </Typography>
          <ButtonGroup variant="outlined" aria-label="Basic button group">
            <Button onClick={() => handlefilterScene("perWeek")}>Per Week</Button>
            <Button onClick={() => handlefilterScene("perMonth")}>Per Month</Button>
            <Button onClick={() => handlefilterScene("perYear")}>Per Year</Button>
          </ButtonGroup>
          <ResponsiveContainer height={300} width="100%">
            <UsersSpentTimePerScene filter={filterScene} />
          </ResponsiveContainer>
        </Box>
      </Box> */}
    </Box >
  );
};

export default Dashboard;
