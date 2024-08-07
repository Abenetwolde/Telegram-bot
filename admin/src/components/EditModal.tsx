import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { EditModalProps, EditApiResponse } from '../types/Category';

import { useDispatch } from 'react-redux';
import api from '../services/api';
import { useUpdateCategoryMutation } from '../redux/Api/category';
const EditModal: React.FC<EditModalProps> = ({ isOpen, handleClose, editedRow, setEditedRow }) => {
    const [updateCategory, {isLoading}]=useUpdateCategoryMutation()
    const handleUpdate = async () => {
        try {
          const  updatedData={
            id:editedRow?._id,
            name: editedRow?.name,
            icon: editedRow?.icon,
          }
          const updateResponse=await updateCategory(updatedData).unwrap()
 
          // });
          if (updateResponse.success) {
            // dispatch(updateCategorySuccess(response.data.category));
            toast.success("Category Update successfully!");
            // window.location.reload();
           
          } else {
            toast.error("Failed to Update category");
          }
          // Close the modal and update the data as needed
          handleClose();
        } catch (error) {
            toast.error(`Error updating category:', ${error}`);
          console.error('Error updating category:', error);
          // Handle errors or display a message to the user
        }
      };
      return (
        <Dialog open={isOpen} onClose={handleClose} aria-labelledby="edit-modal" fullWidth maxWidth="sm">
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          {/* Populate modal with input fields based on the columns' data */}
          {editedRow && (
            <div>
              <p>Name</p>
              <TextField
                value={editedRow.name}
                onChange={(e) => setEditedRow((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                fullWidth
                margin="dense"
              />
              <p>Icon</p>
              <TextField
                value={editedRow.icon}
                onChange={(e) => setEditedRow((prev) => (prev ? { ...prev, icon: e.target.value } : null))}
                fullWidth
                margin="dense"
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <div
            className="text-blue-600 hover:bg-blue-200 p-1 rounded-full bg-green-100 px-5 py-2 cursor-pointer"
            onClick={handleUpdate}
          >
           { isLoading? 'Update...':'Update'}
          </div>
          <div
            onClick={handleClose}
            className="text-red-600 hover:bg-red-200 px-5 py-2 rounded-full bg-red-100 cursor-pointer"
          >
            Cancel
          </div>
        </DialogActions>
      </Dialog>
      );
}
export default EditModal;



