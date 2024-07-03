import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";


import UserTable from "../components/User/UserTable";
// import { fetchUserStart, fetchUsers } from "../redux/userSlice";
import { useParams } from "react-router-dom";
import { Box, Button, Grid, useTheme } from "@mui/material";
import UserPerformance from "../components/Dashboard/USerPerformance";
import api from "../services/api";
import AddUserDialog from "../components/User/CreateUser";
import { useGetUserPerformanceQuery } from "../redux/Api/User";
// fetchUsers
const UserPage = () => {

  const [filterUserPerformanceTable, setFilterUserPerformance] = useState('perMonth');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const theme=useTheme()
  const dispatch = useDispatch();
  const handleFilterUserPerformanceTable = (newFilter) => {
    setFilterUserPerformance(newFilter);

  };
  const [isOpen, setIsOpen] = useState(false);
  const { path } = useParams();
  const performanceSectionRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const { data: userperformance, isLoading: loadingUserPerformance, error, refetch } = useGetUserPerformanceQuery({
    page: 1,
    pageSize: 2,
    search: '',
    interval:filterUserPerformanceTable

  });
  const debounce = (func, delay) => {
    return (...args) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = debounce((e) => {
    setPage(1);
    refetch({ page: 1, search: e.target.value });
  }, 500);

  const handelPage = (_e:unknown, number: any) => {
    console.log("page ch log......",number)
    refetch({ page: number });

  };
  const handelLimit = (number: any) => {
    refetch({ page: 1, pageSize: number.target.value });

  };
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (path === 'performance') {
      scrollToSection(performanceSectionRef);
    }
  }, [path]);
  // useEffect(() => {
  //   dispatch(fetchUserStart())
  //   //@ts-ignore
  //   dispatch(fetchUsers());
  // }, [dispatch]);

  // useEffect(() => {
  //   setLoadingUserPerformance(true);
  //   // Fetch data from the API
  //   api.get(`/kpi/get-users-performance?interval=${filterUserPerformanceTable}&search=${search}&limit=${limit}&page=${page}`) // Replace with your actual API endpoint
  //     .then(response => {
  //       setDataUserperformance(response.data);
  //       setLoadingUserPerformance(false);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //       setLoadingUserPerformance(false);
  //     });
  // }, [filterUserPerformanceTable,search,page,limit]);


  const isFalse: boolean = path ? true : false

  return (
  <>
      <div className="max-w-full flex flex-col flex-end overflow-x-auto">
        {/* <Box width={'100%'}display={'felx'} justifyContent={'flex-end'} alignItems={'center'}>
        <Button
      size="small"
          variant="contained"
          // color={theme.palette.info.light}
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor:theme.palette.info.main, border: 'none', outline: "none",float: 'right', marginBottom: '1rem', padding:"0.5rem", width: '100px' }}
        >
          + Add User
        </Button>
        </Box>
    
        <UserTable /> */}
        <Grid item xs={12} md={8} lg={8} width="100%" textAlign="center">
        <div ref={performanceSectionRef}>

<UserPerformance data={userperformance} loading={loadingUserPerformance} filterUserPerformanceTable={filterUserPerformanceTable} handleFilterUserPerformanceTable={handleFilterUserPerformanceTable} handelSearch={handleSearch} handelLimit={handelLimit} handelPage={handelPage} isFalse={isFalse} />
</div>
          
        </Grid>
      </div>
      <AddUserDialog isOpen={isOpen} handleClose={() => setIsOpen(false)} />
      <ToastContainer />
      </>
  );
};

export default UserPage;