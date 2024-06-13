import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";


import UserTable from "../components/User/UserTable";
import { fetchUserStart, fetchUsers } from "../redux/userSlice";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import UserPerformance from "../components/Dashboard/USerPerformance";
import api from "../services/api";
fetchUsers
const UserPage = () => {
  const [userperformance, setDataUserperformance] = useState<any[]>([]);
  const [loadingUserPerformance, setLoadingUserPerformance] = useState(true);
  const [filterUserPerformanceTable, setFilterUserPerformance] = useState('perMonth');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const dispatch = useDispatch();
  const handleFilterUserPerformanceTable = (newFilter) => {
    setFilterUserPerformance(newFilter);

  };
  const handelSearch = (e) => {
    console.log("search log", e.target.value)
    setSearch(e.target.value);

  };
  const handelPage = (number: number) => {
    // console.log("search log",e.target.value)
    setPage(number);

  };
  const handelLimit = (number: number) => {
    // console.log("search log",e.target.value)
    setLimit(number);

  };

  useEffect(() => {
    dispatch(fetchUserStart())
    //@ts-ignore
    dispatch(fetchUsers());
  }, [dispatch]);
  const { path } = useParams();
  useEffect(() => {
    setLoadingUserPerformance(true);
    // Fetch data from the API
    api.get(`/kpi/get-users-performance?interval=${filterUserPerformanceTable}&search=${search}&limit=${limit}&page=${page}`) // Replace with your actual API endpoint
      .then(response => {
        setDataUserperformance(response.data);
        setLoadingUserPerformance(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoadingUserPerformance(false);
      });
  }, [filterUserPerformanceTable, search,page,limit]);
  useEffect(() => {
    if (path === 'performance') {
      const scrollHeight = document.documentElement.scrollHeight;
      const halfPageHeight = scrollHeight / 2;
      window.scrollTo({
        top: halfPageHeight,
        behavior: 'smooth'
      });
    }
  }, [path]);

  const isFalse: boolean = path ? true : false

  return (
    <div className="">

      {/* <AdminSidebar /> */}
      <div className="mb-8  flex-col align-center justify-center mx-auto w-full">
      </div>
      <div className="max-w-full  overflow-x-auto">

        <UserTable />
        <Grid item xs={12} md={8} lg={8} width="100%" textAlign="center">

          <UserPerformance data={userperformance} loading={loadingUserPerformance} filterUserPerformanceTable={filterUserPerformanceTable} handleFilterUserPerformanceTable={handleFilterUserPerformanceTable} handelSearch={handelSearch} handelLimit={handelLimit} handelPage={handelPage} isFalse={isFalse} />
        </Grid>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserPage;