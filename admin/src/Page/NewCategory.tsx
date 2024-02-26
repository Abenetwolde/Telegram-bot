import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import NewCategoryForm from "../components/NewCategory";
import CategoryTable from "../components/CategoryTable";
import { useDispatch } from "react-redux";
import { fetchCategories, fetchCategoriesStart } from "../redux/categorySlice";
const NewCategory = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategoriesStart())
    //@ts-ignore
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="">

      {/* <AdminSidebar /> */}
      <div  className="mb-8  flex-col align-center justify-center mx-auto w-full">
        <NewCategoryForm />

   
      </div>
      <div className="max-w-full  overflow-x-auto">
     
     <CategoryTable />

   </div>
      <ToastContainer />
    </div>
  );
};

export default NewCategory;