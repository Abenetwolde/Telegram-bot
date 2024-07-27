import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DeleteProductResponse ,DeleteConfirmationProdcutModalProps} from '../../types/product';
import { useDispatch } from 'react-redux';
import api from '../../services/api';

import { useDeleteProductMutation } from '../../redux/Api/product';
const DeleteProduct: React.FC<DeleteConfirmationProdcutModalProps> = ({
    isOpen,
    handleClose,
    deletedItem,
  }) => {
    const dispatch = useDispatch();
    const [deleteProduct, {isLoading}]= useDeleteProductMutation()
  const handleConfirmDelete = async () => {
    try {
      // const response = await api.delete<DeleteProductResponse>(
      //   `product/deleteproductbyid/${deletedItem?._id}`
      // );
    const response =await deleteProduct(deletedItem?._id)
      if (response) {
        toast.success(`${deletedItem?.name} Product deleted successfully!`);
        
      } else {
        toast.error('Failed to delete category');
      }
      handleClose();
    } catch (error) {
      toast.error(`Error deleting category: ${error}`);
      console.error('Error deleting category:', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="delete-modal"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Delete Category</DialogTitle>
      <DialogContent>
        <p>Are you sure you want to delete this category?</p>
      </DialogContent>
      <DialogActions>
        <div
          className="text-red-600 hover:bg-red-200 px-5 py-2 rounded-full bg-red-100 cursor-pointer"
          onClick={handleConfirmDelete}
        >
         {isLoading?"Deleting...":"Delete" }
        </div>
        <div
          onClick={handleClose}
          className="text-blue-600 hover:bg-blue-200 p-1 rounded-full bg-green-100 px-5 py-2 cursor-pointer"
        >
          Cancel
        </div>
      </DialogActions>
    </Dialog>
  );
}
export default DeleteProduct;