import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";

import CreateNewProdcut from "../components/Prodcut/CreateNewProdcut";

import ProdcutTable from "../components/Prodcut/ProdcutTable";
const ProdcutPage = () => {


  return (
    <div className="">

      {/* <AdminSidebar /> */}
      <div className="mb-8  flex-col align-center justify-center mx-auto w-full">
        <CreateNewProdcut />


      </div>
      <div className="max-w-full  overflow-x-auto">

        <ProdcutTable />

      </div>
      <ToastContainer />
    </div>
  );
};

export default ProdcutPage;