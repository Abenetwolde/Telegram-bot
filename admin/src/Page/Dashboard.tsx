import React, { useState, useEffect, useRef } from 'react';
import { Col, Row } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS fil
import api from '../services/api';
import { DashboardTotalCountCard } from '../components/Dashboard/total-count-card';
import { PieChart, Pie } from 'recharts';
import { addDays } from 'date-fns'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
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
  const [open, setOpen] = useState(true);
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

  const [totalUserCount, setTotalUserCount] = useState<number | undefined>(undefined);
  const [totalOrderCount, setTotalOrderCount] = useState<number | undefined>(undefined);
  const [totalCancelOrderCount, setTotalCancelOrderCount] = useState<number | undefined>(undefined);

  const [newUsersData, setNewUsersData] = useState([]);
  const [newOrderData, setNewOrderData] = useState([]);
  const [newCancelOrderData, setNewCancelOrderData] = useState([]);

  const [topOrderFood, settopOrderFood] = useState([]);
  const [userCounts, setUserCounts] = useState([]);
  const [opacity, setOpacity] = useState({ frombotcount: 1, fromchannelcount: 1 ,frominvitation:1});

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
    if( e.key === "Escape" ) {
      setOpen(false)
    }
  }

  // Hide dropdown on outside click
  const hideOnClickOutside = (e) => {
    // console.log(refOne.current)
    // console.log(e.target)
    if( refOne.current && !refOne.current.contains(e.target) ) {
      setOpen(false)
    }
  }

  const handleMouseLeave = (o) => {
    const { dataKey } = o;
    setOpacity(prevOpacity => ({ ...prevOpacity, [dataKey]: 1 }));
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get("order/high-order-food");
      // console.log(response.data)
      const data = response.data.map((entry, index) => ({
        index: String(index + 1),
        name: entry._id,// Assuming index starts from 1
        value: entry.count, // Assuming userCount property in each entry represents the number of new users
      }));
      settopOrderFood(data);

      // settopOrderFood(response.data)
    }
    fetchData()
  }, []);
  const [filter, setFilter] = useState('perMonth');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`user/getnewuser?interval=${filter}`);
        const data = response.data.newUserCounts;
        setUserCounts(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();
  }, [filter])

  useEffect(() => {
    console.log("start"+range[0].startDate, "end"+range[0].endDate)
    const fetchData = async () => {
        try {
            const response = await api.post<any,any>('user/getuserrange',   {
           
                  startDate: range[0].startDate,
                  endDate: range[0].endDate
              
          });
            setUserCounts(response.data.newUserCounts);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchData();
}, [range]);
const handleDateRangeChange = (item) => {
  setRange([item.selection]);
  setOpen(false); // Close the DateRangePicker
};
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  console.log("userCounts", userCounts)
  console.log(topOrderFood)
  useEffect(() => {
    const fetchData = async (endpoint, setData, setLoading, setTotalCount, setLoadingState) => {
      try {
        let totalCount=0
        const response = await api.get(endpoint);
        setData(response.data);
        if(endpoint==='user/getnewuser')
        {
          totalCount = response.data?.newUserCounts?.reduce((acc, curr) => acc + curr.total, 0);
        }else{
          totalCount = response.data?.reduce((acc, curr) => acc + curr.count, 0);
        }
        
        setTotalCount(totalCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // fetchData('user/getnewuser', setNewUsersData, setIsLoading, setTotalUserCount, setIsLoading);
    fetchData('order/getordersperday', setNewOrderData, setIsOrderLoading, setTotalOrderCount, setIsOrderLoading);
    fetchData('order/cancelled-orders-per-day', setNewCancelOrderData, setIsCancelOrderLoading, setTotalCancelOrderCount, setIsCancelOrderLoading);
  }, []);

  const renderTotalCountCard = (resource, isLoading, totalCount, data) => (

    <Col xs={24} sm={24} xl={7} className=' bg-white rounded-xl shadow-lg p-4 text-center '>
  
      <DashboardTotalCountCard
        resource={resource}
        isLoading={isLoading}
        totalCount={totalCount}
        data={data.map((entry, index) => ({
          index: String(index + 1), // Assuming index starts from 1
          value: resource=="User"?entry.total:entry.count, // Assuming userCount property in each entry represents the number of new users
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
    <div className="p-6 mb-6 bg-slate-50 min-h-screen ">
      <div className="flex  flex-wrap ">
        <div className="w-full my-2 rounded-xl space-y-5  ">
          <Row gutter={[32, 32]} className="space-x-2 item-center justify-center">
            {renderTotalCountCard("User", isLoading, totalUserCount, userCounts)}
            {renderTotalCountCard("Order", isOrderLoading, totalOrderCount, newOrderData)}
            {renderTotalCountCard("Cancel", iscancelOrderLoading, totalCancelOrderCount, newCancelOrderData)}
          </Row>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full space-y-5 my-5">
        <div className="lg:w-5/6 w-full h-96 mb-5 lg:mb-0 lg:mr-5  bg-white rounded-xl shadow-lg p-10 text-center">
          <p className="text-xl font-semibold mb-4 text-left">User analysis per day</p>
        
          <div ref={refOne}>
            <input
                value={`${format(range[0].startDate, "MM/dd/yyyy")} to ${format(range[0].endDate, "MM/dd/yyyy")}`}
                readOnly
                className="inputBox"
                onClick={() => setOpen((prevOpen) => !prevOpen)}
            />

            <div>
                {open && (
                    <DateRangePicker
                    onChange={(item) => setRange([item.selection])}
                        editableDateInputs={true}
                        // minDate={new Date()}
                        moveRangeOnFirstSelection={false}
                        ranges={range}
                        months={2}
                        direction="horizontal"
                        className="calendarElement"
                    />
                )}
            </div>
         </div>
          <FormControl fullWidth>
          <InputLabel id="filter-label">Filter</InputLabel>
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
          <ResponsiveContainer>
          <BarChart
              data={userCounts}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="_id" 
                 tickFormatter={(date) =>{
               if (filter === "perYear") {
                    return date/*  format(new Date(date), "MMMM"); */ // Format as month/year for perYear
                  } else {
                    return date /* format(new Date(date), "dd"); */ // Default format as day for others
                  }
                }
              }
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip label={undefined} payload={undefined} />} />
              <Legend onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
              <Bar dataKey="frombotcount" strokeOpacity={opacity.frombotcount} stackId="a" fill="#8884d8" name="From Bot"  fillOpacity={opacity.frombotcount}  />
              <Bar dataKey="fromchannelcount" strokeOpacity={opacity.fromchannelcount} stackId="a" fill="#82ca9d" name="From Channel" fillOpacity={opacity.fromchannelcount} />
              <Bar dataKey="frominvitation" strokeOpacity={opacity.frominvitation} stackId="a" fill="#000000" name="From Invitation" fillOpacity={opacity.frominvitation} />
              {/* <Bar dataKey="total" stackId="a" fill="#00000" name="Total" /> */}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:w-1/3 w-full h-96 mb-5 lg:mb-0  bg-white rounded-xl shadow-lg p-10 text-center">
          <p className="text-xl font-semibold my:5">User analysis per day</p>
          <ResponsiveContainer >
            <PieChart >
              <Pie
                dataKey="value"
                isAnimationActive={false}
                data={topOrderFood}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
                onClick={handleClick}
                stroke={activeIndex !== null ? 'blue' : 'none'}
              // strokeWidth={activeIndex !== null ? 1 : 0}
              >
                {topOrderFood.map((entry, index) => (
                  <Cell key={`cell-${index}`}
                    style={{ outline: 'none' }}
                    // strokeWidth={activeIndex !== null ? 5 : 0}
                    fill={COLORS[index % COLORS.length]}
                    stroke={activeIndex === index ? 'white' : 'none'} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
                iconSize={15}
                iconType="square"
                layout="horizontal"
                formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
                onClick={(e) => {
                  const { index }: any = e.payload;
                  console.log("strokeDasharray", index)
                  const indexd = topOrderFood.findIndex((entry) => entry.index === index);
                  if (indexd !== -1) {
                    setActiveIndex(indexd);
                  }
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
      
        </div>

      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-8 min-w-full">
        <div className="bg-white rounded-xl h-auto w-full shadow-lg p-2">
          {/* <Line data={lineState} /> */}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <span className="font-medium uppercase text-gray-800">Order Status</span>
          {/* <ResponsiveContainer > */}
          <PieChart >
            <Pie
              dataKey="value"
              isAnimationActive={false}
              data={topOrderFood}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
              onClick={handleClick}
              stroke={activeIndex !== null ? 'blue' : 'none'}
            // strokeWidth={activeIndex !== null ? 1 : 0}
            >
              {topOrderFood.map((entry, index) => (
                <Cell key={`cell-${index}`}
                  style={{ outline: 'none' }}
                  // strokeWidth={activeIndex !== null ? 5 : 0}
                  fill={COLORS[index % COLORS.length]}
                  stroke={activeIndex === index ? 'white' : 'none'} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
              iconSize={15}
              iconType="square"
              layout="horizontal"
              formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
              onClick={(e) => {
                const { index }: any = e.payload;
                console.log("strokeDasharray", index)
                const indexd = topOrderFood.findIndex((entry) => entry.index === index);
                if (indexd !== -1) {
                  setActiveIndex(indexd);
                }
              }}
            />
            <Tooltip />
          </PieChart>
          {/* </ResponsiveContainer> */}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
