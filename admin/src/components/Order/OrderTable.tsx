import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Card, CardHeader, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from '@mui/material';
import {  setPaginationData, setPage, setRowsPerPage } from '../../redux/orderSlice';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'
import { MutatingDots } from 'react-loader-spinner';
// import EditProdcut from './EditProdcut';
import { Product } from '../../types/product';
import EditOrder from './EditOrder';
import FilterOrder from './FilterOrder';
import { useGetAllOrdersQuery } from '../../redux/Api/Order';

// import DeleteProduct from './DeleteProduct';
// import DeleteUser from '../User/DeleteUser';
// import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

const OrderTable: React.FC = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [deleteRow, setDeletedRow] = useState<| null>(null);
    const [editedRow, setEditedRow] = useState<| null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [orderNumber, setSearch] = useState<number>();
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    // const [page, setPage] = useState(0);
    // const [rowsPerPage, setRowsPerPage] = useState(10);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-400';
            case 'completed':
                return 'bg-green-400';
            case 'cancelled':
                return 'bg-red-400';
            case 'delivered':
                return 'bg-blue-400';
            default:
                return '';
        }
    };
    // const {data:orderData,isLoading, error, refetch}=useGetAllOrdersQuery({ page: page+1 , pageSize: rowsPerPage})
    // if(isLoading){
    //     return <div className="flex justify-center items-center h-screen">Loading...</div>
    // }
    const renderSkeleton = () => {
        return (
            <TableRow>
                {columns.map((column) => (
                    <TableCell>
                        <Skeleton height={30} variant="text" />
                    </TableCell>
                ))}
                <TableCell>
                    <Skeleton height={30} variant="text" />
                </TableCell>
            </TableRow>
        );
    };
    const columns = [
        { Header: 'OrderId', accessor: '_id' },
        {
            accessor: 'orderItems',
            Header: 'Product Name',
            Cell: ({ value }: any) => (
                <div className="flex flex-col items-center">
                     <ul className="list-disc">
                {value.map((p, index) => (
                    <li key={index}>{p?.product?.name}</li>
                ))}
            </ul>
                </div>
            ),
        },
        {
            accessor: 'user',
            Header: 'User Name',
            Cell: ({ value }: any) => (
                <div className="flex items-center">

                    <span>
                        {value?.username}
                    </span>

                </div>
            ),
        },
        {
            accessor: 'orderNumber',
            Header: 'Order Number',
            Cell: ({ value }: any) => (
                <div className="flex items-center">

                    <span>
                        {value&&value}
                    </span>

                </div>
            ),
        },
        {
            accessor: 'user',
            Header: 'User First Name',
            Cell: ({ value }: any) => (
                <div className="flex items-center">

                    <span>
                        {value?.first_name}
                    </span>

                </div>
            ),
        },
      


        {
            accessor: 'totalPrice',
            Header: 'TotalAmount',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    <p>{value}</p>
                </div>
            ),
        },
        {
            accessor: 'orderStatus',
            Header: 'orderStatus',
            Cell: ({ value }: any) => (
                <div className={`flex items-center justify-center p-1 rounded-md text-white ${getStatusColor(value)}`}>
                {value}
            </div>
    
            ),
        },
        {
            accessor: 'paymentType',
            Header: 'Payment Type',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value}
                </div>
            ),
        },
        {
            accessor: 'paymentStatus',
            Header: 'Payment Status',
            Cell: ({ value }: any) => (
                <div className={`flex items-center justify-center p-1 rounded-md text-white ${getStatusColor(value)}`}>
                {value}
            </div>
    
            ),
        },
        {
            accessor: 'createdAt',
            Header: 'createdAt',
            Cell: ({ value }: any) => (
                <div className={`flex items-center`}>
                   {new Date(value).toLocaleString()}
                </div>
            ),
        },
        {
            accessor: 'shippingInfo',
            Header: 'Note',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                  {value?.note?.length > 20 ? (
                    <div title={value?.note} className="flex items-center">
                      {value?.note.slice(0, 20)}...
                    </div>
                  ) : (
                    <div>{value?.note}</div>
                  )}
                </div>
              ),
        },
        {
            accessor: 'shippingInfo',
            Header: 'Phone Number',
            Cell: ({ value }: any) => (
                <div className={`flex items-center`}>
                    {value.phoneNo}
                </div>
            ),
        },
        {
            accessor: 'shippingInfo',
            Header: 'Address',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                  {value?.location?.length > 20 ? (
                    <div title={value.location} className="flex items-center">
                      {value.location.slice(0, 20)}...
                    </div>
                  ) : (
                    <div>{value?.location}</div>
                  )}
                </div>
              ),
        },
        //   {
        //     accessor: 'createdAt',
        //     Header: 'createdAt',
        //     Cell: ({ value }: any) => (
        //       <div className={`flex items-center ${value ? 'text-green-500' : 'text-red-500'}`}>
        //         {value ? 'Available' : 'Not Available'}
        //       </div>
        //     ),
        //   },

    ];

 
    const dispatch = useDispatch();
    const order = useSelector((state: RootState) => state.order);
    const { data, error, isLoading, refetch } = useGetAllOrdersQuery({
        page: order.page + 1, // Convert 0-based to 1-based indexing for the backend
        pageSize: order.rowsPerPage, 
        orderNumber, 
        // sortField, 
        sortOrder, 
         orderStatus, 
        paymentType,
        paymentStatus
    });

    useEffect(() => {
        if (data) {
            dispatch(setPaginationData({ totalPages: data.totalPages, totalRows: data.count }));
        }
    }, [data, dispatch]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        dispatch(setPage(newPage));
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
        dispatch(setPage(0)); // Reset to first page
    };
    const handleEditClick = (rowData: any) => {
        setEditedRow(rowData);
      
        setIsEditModalOpen(true);
    };
    const handlEDeleteClick = (rowData: any) => {
        setDeleteModalOpen(true);

        setDeletedRow(rowData)
    };
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditedRow(null);
    };
    const handleOrderStatus = (e) => {
        setOrderStatus(e.target.value)
        refetch()
    };
    const handlePaymentMethod = (e) => {
        setPaymentType(e.target.value)
        refetch()
    };
    const handlePaymentStatus = (e) => {
        setPaymentStatus(e.target.value)
        refetch()
    };
    const getProductValue = (product: any, accessor: string) => {
        const keys = accessor.split('.'); // Split nested keys
        let value: any = { ...product };

        keys.forEach((key) => {
            value = value[key];
        });

        return value;
    };
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.down('md')) // Adjust breakpoint as needed


    return (
        <>



            <EditOrder
                isOpen={isEditModalOpen}
                handleClose={handleCloseEditModal}
                editedRow={editedRow}
                setEditedRow={setEditedRow}
            />
            {/* <DeleteUser
            //    isOpen={deleteModalOpen}
            //    handleClose={() => setDeleteModalOpen(false)}
            //    deletedItem={deleteRow} 
            // /> */}


          
              
                        <div className="overflow-auto flex item-center justify-center shadow-xl">
                              <Card>
                              <CardHeader  title={"Orders Table"} />
                              <FilterOrder
                                            search={orderNumber}
                                            paymentStatus={paymentStatus}
                                            sortOrder={sortOrder}
                                            orderStatus={orderStatus}
                                            paymentType={paymentType}
                                            // setPaymentType={setPaymentType}
                                            handleSearchChange={(e) => setSearch(e.target.value)}
                                            handleSortChange={(e) => setSortField(e.target.value)}
                                            handleSortOrderChange={(e) => setSortOrder(e.target.value)}
                                            handleOrderStatusChange={(e) => handleOrderStatus(e)}
                                             handlePaymentTypeChange={(e) => handlePaymentMethod(e)}
                                             handlePaymentStatusChange={(e) => handlePaymentStatus(e)}
                              />
                            <TableContainer component={Paper} className="overflow-auto mx-auto ">
                                <Table sx={{ maxWidth: 1000 }} aria-label="product table" className="border-collapse align-center justify-center mx-auto">
                                    <TableHead >
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell key={column.accessor} className={`p-2 !text-md`}>
                                                    {column.Header}
                                                </TableCell>
                                            ))}
                                            <TableCell className="p-2">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>

                                          {isLoading
                                    ? Array.from(new Array(7)).map((_, index) => renderSkeleton()):
                                    data&& data?.orders.map((product, index) => (
                                            <TableRow
                                                key={product._id}
                                                // className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
                                            >
                                                {columns.map((column) => (
                                                    <TableCell key={column.accessor} className={`p-2`}>
                                                        {column.Cell ? column.Cell({ value: product[column.accessor as keyof Product] }) : getProductValue(product, column.accessor)}
                                                    </TableCell>
                                                ))}

                                                <TableCell className="p-2">
                                                    <div className="flex justify-between items-center gap-1">

                                                        <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:bg-blue-200 p-1 rounded-full bg-blue-100">
                                                            <EditIcon />
                                                        </button>
                                                        <button onClick={() => handlEDeleteClick(product)} className="text-red-600 hover:bg-red-200 p-1 rounded-full bg-red-100">
                                                            <DeleteIcon />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        
                                    </TableBody>

                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10, 25]}
                                                count={order?.totalRows||0}
                                                rowsPerPage={order?.rowsPerPage}
                                                page={order?.page}
                                                onPageChange={handleChangePage}
                                                onRowsPerPageChange={handleChangeRowsPerPage}
                                                className="mx-auto"
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                            </Card>
                            </div>
      




            <div>

            </div>
     
        </>
    );
};

export default OrderTable;
