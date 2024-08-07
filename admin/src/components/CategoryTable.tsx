import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Box, Card, CardHeader, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from '@mui/material';
import { setCategoryPage, setCategoryPaginationData, setCategoryRowsPerPage, } from '../redux/categorySlice';
import { Category } from '../types/Category';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditModal from './EditModal';
import { MutatingDots } from 'react-loader-spinner';
// import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { useGetAllCategoriesQuery } from '../redux/Api/category';
const CategoryTable: React.FC = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [deleteRow, setDeletedRow] = useState<Category | null>(null);
    const [editedRow, setEditedRow] = useState<Category | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const category = useSelector((state: RootState) => state.category);
    const { data, isLoading, error } = useGetAllCategoriesQuery({
        page: category.page + 1, // Convert 0-based to 1-based indexing for the backend
        pageSize: category.rowsPerPage,
    })

    const columns = [
        { Header: 'ID', accessor: '_id' },
        {
            accessor: 'name',
            Header: 'Category Name',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value}
                </div>
            ),
        },
        {
            accessor: 'icon',
            Header: 'Category Icon',
            Cell: ({ value }: any) => (
                <div className="flex items-center">

                    {value && value}

                </div>
            ),
        },

    ];
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
    const dispatch = useDispatch();
    const categoryState = useSelector((state: RootState) => state.category);
    console.log('Categories:', categoryState.data);
    useEffect(() => {
        if (data) {
            dispatch(setCategoryPaginationData({ totalPages: data.totalPages, totalRows: data.count }));
        }
    }, [data, dispatch]);
    const handleChangePage = (_event: unknown, newPage: number) => {
        //@ts-ignore
        dispatch(setCategoryPage(newPage));
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        //@ts-ignore
        dispatch(setCategoryRowsPerPage(parseInt(event.target.value, 10)));
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
    const getProductValue = (product: any, accessor: string) => {
        const keys = accessor.split('.'); // Split nested keys
        let value: any = { ...product };

        keys.forEach((key) => {
            value = value[key];
        });

        return value;
    };

    // useEffect(() => {
    //     dispatch(fetchCategoriesStart())
    //     //@ts-ignore
    //      dispatch(fetchCategories());
    //   }, [dispatch]);
    return (
        <>
            <EditModal
                isOpen={isEditModalOpen}
                handleClose={handleCloseEditModal}
                editedRow={editedRow}
                setEditedRow={setEditedRow}

            />
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                handleClose={() => setDeleteModalOpen(false)}
                deleteItemId={deleteRow}
            />
            <div className="overflow-auto mt-10 flex item-center justify-center shadow-xl">
                <Card className='p-5' elevation={2}>
                    <Box sx={{ mb: 3, textAlign: 'left' }}>
                        <CardHeader sx={{ mb: 3, textAlign: 'left' }} title={`Categories Table`} />
                    </Box>
                    <TableContainer component={Paper} className="overflow-auto mt-10 ">
                        <Table sx={{ maxWidth: 1300 }} aria-label="product table" className="border-collapse align-center justify-center mx-auto">
                            <TableHead className=" !text-white">
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.accessor} className={`p-2 !text-m`}>
                                            {column.Header}
                                        </TableCell>
                                    ))}
                                    <TableCell className="p-2">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {isLoading
                                    ? Array.from(new Array(4)).map((_, index) => renderSkeleton()) :
                                    data?.categorys?.map((product, index) => (
                                        <TableRow
                                            key={product._id}
                                        // className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
                                        >
                                            {columns.map((column) => (
                                                <TableCell key={column.accessor} className={`p-2`}>
                                                    {column.Cell ? column.Cell({ value: product[column.accessor as keyof Category] }) : getProductValue(product, column.accessor)}
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
                                        count={category.totalRows}
                                        rowsPerPage={category.rowsPerPage}
                                        page={category.page}
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





        </>
    );
};

export default CategoryTable;
