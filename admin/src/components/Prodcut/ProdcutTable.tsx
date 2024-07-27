import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Avatar, Card, CardHeader, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from '@mui/material';
import {  setProductPaginationData, setProductPage, setProductRowsPerPage } from '../../redux/productSlice';

import { MutatingDots } from 'react-loader-spinner';
import EditProdcut from './EditProdcut';
import { Product } from '../../types/product';
import DeleteProduct from './DeleteProduct';
import DeleteUser from '../User/DeleteUser';
import { useGetAllProductQuery } from '../../redux/Api/product';
// import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

const  ProdcutTable :React.FC =  () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [deleteRow, setDeletedRow] = useState<| null>(null);
    const [editedRow, setEditedRow] = useState<| null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const product = useSelector((state: RootState) => state.product);

const {data,isLoading, error}= useGetAllProductQuery({     
    page: product?.page + 1, // Convert 0-based to 1-based indexing for the backend
    pageSize: product?.rowsPerPage, })
    const columns = [
        // { Header: 'ID', accessor: '_id' },
        {
            accessor: 'name',
            Header: 'Product Name',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value}
                </div>
            ),
        },
        {
            accessor: 'images',
            Header: 'Product Images',
            Cell: ({ value }: any) => {
                return (
                  <div className="flex items-center gap-2">
                    {value.slice(0, 2).map((imageUrl: any, index: number) => (
                      <Avatar
                        key={index}
                        alt={`Product Image ${index}`}
                        src={imageUrl?.imageUrl}
                        className="rounded-full h-8 w-8 object-cover"
                      />
                    ))}
                    {value.length > 2 && (
                      <Avatar className="rounded-full h-8 w-8 flex items-center justify-center">
                        {`+${value.length - 2}`}
                      </Avatar>
                    )}
                  </div>
                );
              },
        },
        {
            accessor: 'video',
            Header: 'Video Thumbnail',
            Cell: ({ value }: any) => {
                return (
                  <div className="flex items-center gap-2">
                    {value&& (
                      <Avatar
                  
                        alt={`Product Image ${1}`}
                        src={value?.thumbnail}
                        className="rounded-full h-8 w-8 object-cover"
                      />
                    )}
              
                  </div>
                );
              },
        },
        {
            accessor: 'category',
            Header: 'Category Name',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value?.name}
                </div>
            ),
        },
        {
            accessor: 'price',
            Header: 'Price',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value}
                </div>
            ),
        },
   
        {
            accessor: 'description',
            Header: 'Description',
            Cell: ({ value }: any) => (
              <div className="flex items-center">
                {value.length > 20 ? (
                  <div title={value} className="flex items-center">
                    {value.slice(0, 20)}...
                  </div>
                ) : (
                  <div>{value}</div>
                )}
              </div>
            ),
          },
          {
            accessor: 'highlights',
            Header: 'Highlights',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value.map((v:any)=><p>#{v}, </p>)}
                </div>
            ),
        },
          {
            accessor: 'orderQuantity',
            Header: 'Order Quantity',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value}
                </div>
            ),
        },
       

    ];
    const dispatch = useDispatch();
    useEffect(() => {
        if (data) {
            dispatch(setProductPaginationData({ totalPages: data.totalPages, totalRows: data.count }));
        }
    }, [data, dispatch]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        //@ts-ignore
        dispatch(setProductPage(newPage));
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        //@ts-ignore
        dispatch(setProductRowsPerPage(parseInt(event.target.value, 10)));
    };
    const handleEditClick = (rowData: any) => {
        setEditedRow(rowData);
        console.log("row data", rowData)
        setIsEditModalOpen(true);
    };
    const handlEDeleteClick = (rowData: any) => {
        setDeleteModalOpen(true);
        console.log("ro data for delete.......", rowData)
        setDeletedRow(rowData)
    };
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditedRow(null);
    };
    const getProductValue = (product: any, accessor: string) => {
        const keys = accessor.split('.'); // Split nested keys
        let value: any = { ...product };

        keys.forEach((key) => {
            value = value[key];
        });

        return value;
    };

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
    return (
        <>

            <EditProdcut
                isOpen={isEditModalOpen}
                handleClose={handleCloseEditModal}
                editedRow={editedRow}
                setEditedRow={setEditedRow}
            />
            <DeleteProduct
               isOpen={deleteModalOpen}
               handleClose={() => setDeleteModalOpen(false)}
               deletedItem={deleteRow} 
            />
         

            <div>
            
                        <div className="overflow-auto flex item-center justify-center shadow-xl">
                        <Card className='p-5'elevation={2}>
                        <CardHeader sx={{mb:5}} title={"Products Table"} />
                            <TableContainer component={Paper}sx={{ maxWidth: 1200 }} className="overflow-auto item-center justify-center">
                                <Table  aria-label="product table" className="border-collapse align-center justify-center mx-auto">
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

                                        { isLoading
                                    ? Array.from(new Array(7)).map((_, index) => renderSkeleton()):
                                    data?.products?.map((product, index) => (
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
                                                count={product.totalRows}
                                                rowsPerPage={product.rowsPerPage}
                                                page={product.page}
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
            </div>
        </>
    );
};

export default ProdcutTable;
function dispatch(arg0: any) {
    throw new Error('Function not implemented.');
}

