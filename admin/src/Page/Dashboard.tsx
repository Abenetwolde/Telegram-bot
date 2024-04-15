import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Row } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import Chart from 'react-apexcharts';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS fil
import api from '../services/api';
import { DashboardTotalCountCard } from '../components/Dashboard/total-count-card';
import { PieChart, Pie } from 'recharts';

import { addDays } from 'date-fns'
import DateRangeIcon from '@mui/icons-material/DateRange';
import { ButtonGroup, IconButton, InputAdornment, TextField, useTheme } from '@mui/material';
import { Box, Card, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import LanguagePieChart from '../components/Dashboard/LanguagePieChart';
import UserSpentTime from '../components/Dashboard/SpentTime';
import UserClicks from '../components/Dashboard/userClicks';
import UsersSpentTimePerScene from '../components/Dashboard/UsersSpentTimePerScene';
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

  const [newUsersData, setNewUsersData] = useState([]);
  const [newOrderData, setNewOrderData] = useState([]);
  const [newCancelOrderData, setNewCancelOrderData] = useState([]);

  const [topOrderFood, settopOrderFood] = useState([]);
  const [userCounts, setUserCounts] = useState([]);
  const [opacity, setOpacity] = useState({ frombotcount: 1, fromchannelcount: 1, frominvitation: 1 });
  const [languageData, setLanguageData] = useState(null);
  const [filter, setFilter] = useState('perYear');
  const [filterClick, setfilterClick] = useState("perMonth"); // Initialize the state with the default value
  const [filterScene, setfilterScene] = useState("perMonth");
  const handlefilterClickChange = (newFilter) => {
    setfilterClick(newFilter);
    console.log("newFilter.........", filterClick)
    // Update the state with the selected filter value
  };
  // get the target element to toggle 
  const refOne = useRef(null)
  const handleMouseEnter = (o) => {
    const { dataKey } = o;
    setOpacity(prevOpacity => ({ ...prevOpacity, [dataKey]: 0.5 }));
  };
  useEffect(() => {
    // event listeners
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
    // console.log(refOne.current)
    // console.log(e.target)
    if (refOne.current && !refOne.current.contains(e.target)) {
      setOpen(false)
    }
  }

  const handleMouseLeave = (o) => {
    const { dataKey } = o;
    setOpacity(prevOpacity => ({ ...prevOpacity, [dataKey]: 1 }));
  };
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await api.get("order/high-order-food");
  //     // console.log(response.data)
  //     const data = response.data.map((entry, index) => ({
  //       index: String(index + 1),
  //       name: entry._id,// Assuming index starts from 1
  //       value: entry.count, // Assuming userCount property in each entry represents the number of new users
  //     }));
  //     settopOrderFood(data);

  //     // settopOrderFood(response.data)
  //   }
  //   fetchData()
  // }, []);

  useEffect(() => {
    console.log("start" + range[0].startDate, "end" + range[0].endDate)
    const fetchData = async () => {
      try {
        const response = await api.post<any, any>('user/getuserrange', {

          startDate: range[0].startDate,
          endDate: range[0].endDate

        });

        // setUserCounts(data);
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

  const handleDateRangeChange = (item) => {
    setRange([item.selection]);
    setOpen(false); // Close the DateRangePicker
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    //  setRange([]);
  };
  
  const handlefilterScene = (string) => {
    setfilterScene(string);
    //  setRange([]);
  };

  // useEffect(() => {
  //   const fetchData = async (endpoint, setData, setLoading, setTotalCount, setLoadingState) => {
  //     try {
  //       let totalCount = 0
  //       const response = await api.get(endpoint);
  //       setData(response.data);
  //       if (endpoint === 'user/getnewuser') {
  //         totalCount = response.data?.newUserCounts?.reduce((acc, curr) => acc + curr.total, 0);
  //       } else {
  //         totalCount = response.data?.reduce((acc, curr) => acc + curr.count, 0);
  //       }

  //       // setTotalCount(totalCount);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // fetchData('user/getnewuser', setNewUsersData, setIsLoading, setTotalUserCount, setIsLoading);
  //   fetchData('order/getordersperday', setNewOrderData, setIsOrderLoading, setTotalOrderCount, setIsOrderLoading);
  //   fetchData('order/cancelled-orders-per-day', setNewCancelOrderData, setIsCancelOrderLoading, setTotalCancelOrderCount, setIsCancelOrderLoading);
  // }, []);

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
  const datad: any = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 900 },
    { name: 'Group D', value: 200 },
  ];
  const COLORSd: any = ['#0088FE', '#00C49F', '#FFBB28', '#FFFFFF'];
  const renderTotalCountCard = (resource, isLoading, totalCount, data) => (

    <Col xs={24} sm={24} xl={7} className='  rounded-xl shadow-lg  text-center '>

      <DashboardTotalCountCard
        resource={resource}
        isLoading={isLoading}
        totalCount={totalCount}
        data={data.map((entry, index) => ({
          index: String(index + 1), // Assuming index starts from 1
          value: resource == "User" ? entry.total : entry.count, // Assuming userCount property in each entry represents the number of new users
        }))}
      />
    </Col>


  );

  const [activeIndex, setActiveIndex] = useState(null); // Track the active index

  const handleClick = (data, index) => {
    setActiveIndex(index === activeIndex ? null : index); // Set the active index or null if clicked again
  };


  const COLORS = ['#8884d8', 'rgba(53, 162, 235, 0.5)', '#FFBB28', '#FF8042'];
  return (
    <div className="pb-6 mb-6   ">
      <div className="flex flex-wrap ">
        <div className="w-full my-2 rounded-xl space-y-5  ">
          <Row gutter={[32, 32]} className="space-x-2 item-center justify-center">
            {renderTotalCountCard("User", isLoading, totalUserCount, userCounts)}
            {renderTotalCountCard("Order", isOrderLoading, totalOrderCount, newOrderData)}
            {renderTotalCountCard("Cancel", iscancelOrderLoading, totalCancelOrderCount, newCancelOrderData)}

          </Row>
        </div>
      </div>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, width: "full", }}>
        <Card sx={{ width: { xs: 'full', lg: '800px' }, mb: { xs: 5, lg: 2 }, mt: { xs: 5, lg: 2 }, mr: { lg: 5 }, borderRadius: 'xl', boxShadow: 'lg', p: 5, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 'subtitle1.fontSize', textAlign: "left" }}>User analysis per day</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>

            <Box sx={{ width: '260px', marginRight: '2px', gap: 5 }} >
              <Box ref={refOne} sx={{ position: 'relative' }}>
                <TextField fullWidth
                  value={`${format(range[0].startDate, "MM/dd/yyyy")} to ${format(range[0].endDate, "MM/dd/yyyy")}`}
                  readOnly
                  onClick={() => setOpen((prevOpen) => !prevOpen)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setOpen((prevOpen) => !prevOpen)}>
                          <DateRangeIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {open && (
                  <Box
                    sx={{
                      position: 'absolute',
                      zIndex: 9999,
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      //  maxWidth: '260px', // Adjust the width here
                      textAlign: 'center',
                    }}
                  >
                    <DateRangePicker
                      onChange={(item) => setRange([item.selection])}
                      editableDateInputs={true}
                      moveRangeOnFirstSelection={false}
                      ranges={range}
                      // color={"#00000"}
                      // fixedHeight=true
                      months={1}
                      direction="horizontal"
                      className="calendarElement"
                    // calendarWidth={200}
                    />
                  </Box>
                )}
              </Box>
            </Box>
            <FormControl >
              {/* <InputLabel id="filter-label">Filter</InputLabel> */}
              <Select
                labelId="filter-label"
                id="filter"
                value={filter}
                onChange={handleFilterChange}
              >
                <MenuItem value="perDay">Per Day</MenuItem>
                <MenuItem value="perWeek">Per Week</MenuItem>
                <MenuItem value="perMonth">Per Month</MenuItem>
                <MenuItem value="perYear">Per Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 3, mb: 3, flex: 1, width: "100%", justifyContent: 'flex-end', alignItems: 'center' }}>
            <Typography  > Total Register: {totalUserCount} Users</Typography>
          </Box>


          <ResponsiveContainer height={300}>
            <BarChart
              data={userCounts}
              margin={{ right: 30, left: 20, }}

            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="_id"
                tickFormatter={(date) => {
                  if (filter === "perYear") {
                    return date;
                  } else {
                    return date;
                  }
                }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip label={undefined} payload={undefined} />} />
              <Legend onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
              <Bar dataKey="frombotcount" strokeOpacity={opacity.frombotcount} stackId="a" fill="#00E7FF" name="From Bot" fillOpacity={opacity.frombotcount} />
              <Bar dataKey="fromchannelcount" strokeOpacity={opacity.fromchannelcount} stackId="a" fill="#7091F5" name="From Channel" fillOpacity={opacity.fromchannelcount} />
              <Bar dataKey="frominvitation" strokeOpacity={opacity.frominvitation} stackId="a" fill="#FA541C" name="From Invitation" fillOpacity={opacity.frominvitation} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card sx={{ width: { xs: 'full', lg: '300px' }, mb: { xs: 5, lg: 2 }, mt: { xs: 5, lg: 2 }, height: "full", borderRadius: 'xl', boxShadow: 'lg', p: 2, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 'subtitle1.fontSize', textAlign: "left" }}>Language Distribution</Typography>
          {languageData ? ( // Render the LanguagePieChart component if data is available
            <LanguagePieChart data={languageData} />
          ) : (
            <p>Loading...</p> // Show a loading message while data is being fetched
          )}


        </Card>
      </Box>

      <div className="flex flex-col  sm:flex-row justify-between gap-3 sm:gap-8 min-w-full lg:h-800  lg:mt-10">
        <Box sx={{ width: '100%', textAlign: 'center', }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 'subtitle1.fontSize', textAlign: "left" }}>Users Total Time Spent</Typography>
          {/* <Typography variant="h5" sx={{ mb: 2 }}>Users Time Spent</Typography> */}
          <ResponsiveContainer height={"100%"}>
            <UserSpentTime />
          </ResponsiveContainer>
        </Box>


      </div>

      <div className="flex flex-col  sm:flex-row justify-between gap-3 sm:gap-8 min-w-full   lg:mt-50">

        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 'subtitle1.fontSize', textAlign: "left" }}>Users Clicks</Typography>
          <ButtonGroup variant="outlined" aria-label="Basic button group"   >
            <Button value={filterClick} onClick={() => handlefilterClickChange("perWeek")}>Per Week</Button> {/* Provide the value prop */}
            <Button value={filterClick} onClick={() => handlefilterClickChange("perMonth")}>Per Month</Button> {/* Provide the value prop */}
            <Button value={filterClick} onClick={() => handlefilterClickChange("perYear")}>Per Year</Button> {/* Provide the value prop */}
          </ButtonGroup>

          <ResponsiveContainer height={300}>
            <UserClicks filter={filterClick} />
          </ResponsiveContainer>
        </Box>

      </div>

      <div className="flex flex-col  sm:flex-row justify-between gap-3 sm:gap-8 min-w-full   lg:mt-50">

        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 'subtitle1.fontSize', textAlign: "left" }}>Users Clicks</Typography>
          <ButtonGroup variant="outlined" aria-label="Basic button group"   >
            <Button value={filterClick} onClick={() => handlefilterScene("perWeek")}>Per Week</Button> {/* Provide the value prop */}
            <Button value={filterClick} onClick={() => handlefilterScene("perMonth")}>Per Month</Button> {/* Provide the value prop */}
            <Button value={filterClick} onClick={() => handlefilterScene("perYear")}>Per Year</Button> {/* Provide the value prop */}
          </ButtonGroup>

          <ResponsiveContainer height={300} width={"100%"}>
            <UsersSpentTimePerScene filter={filterScene} />
          </ResponsiveContainer>
        </Box>

      </div>

    </div>
  );
};

export default Dashboard;
