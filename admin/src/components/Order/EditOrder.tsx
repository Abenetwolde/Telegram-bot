import { Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import { updateCategorySuccess } from '../redux/categorySlice';
import { useDispatch } from 'react-redux';
import api from '../../services/api';

import { UpdateOrdertResponse, EditOrderModalProps, Order } from '../../types/order/order';
import { updateProductSuccess } from '../../redux/productSlice';
import { useEffect, useState } from 'react';
import { ApiResponse } from '../../types/Category';
import { useUpdateOrderByIdMutation } from '../../redux/Api/Order';
const EditOrder: React.FC<any> = ({ isOpen, handleClose, editedRow, setEditedRow }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const paymentOptions = ['cash', 'online']; // Add your payment options here
    const orderStatusOptions = ['pending', 'completed',"cancelled","delivered"]; 
    const paymentStatusOptions = ['pending', 'completed']// Add your order status options here
 const [selectedPaymentType, setSelectedPaymentType] = useState<string>(editedRow?.paymentType || '');
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>(editedRow?.orderStatus || '');
    const [selectedpaymentStatus, setpaymentStatus] = useState<string>(editedRow?.paymentStatus || '');
    const [updateOrderById, { isLoading }] = useUpdateOrderByIdMutation();
    useEffect(() => {
        setSelectedPaymentType(editedRow?.paymentType || '');
        setSelectedOrderStatus(editedRow?.orderStatus || '');
        setpaymentStatus(editedRow?.paymentStatus || '');
      }, [editedRow]);
    const handleUpdate = async () => {
        try {
          const updatedOrder = {
            ...editedRow,
            paymentType: selectedPaymentType,
            orderStatus: selectedOrderStatus,
            paymentStatus: selectedpaymentStatus,
          };
    console.log("update order", updatedOrder)
          const response = await updateOrderById(updatedOrder).unwrap();
    
          if (response.success) {
            toast.success('Order updated successfully!');
            handleClose();
          } else {
            toast.error('Failed to update order');
          }
        } catch (error) {
          toast.error(`Error updating order: ${error}`);
          console.error('Error updating order:', error);
        }
      };

    return (
        <Dialog open={isOpen} onClose={handleClose} aria-labelledby="edit-modal" fullWidth maxWidth="lg">
            <DialogTitle>Edit Order</DialogTitle>
            <DialogContent>
                {editedRow && (
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                            <p>Name</p>
                            <TextField
                                value={editedRow?.orderItems?.map((p) => p.product.name) || ''}
                                fullWidth
                                disabled
                                margin="dense"
                            />
                            {/* Other fields... */}
                            <p>Order Status</p>
                            <Autocomplete
                                options={orderStatusOptions}
                                getOptionLabel={(option) => option}
                                onChange={(_event, newValue) =>                                 setEditedRow((prev) => (prev ? { ...prev, orderStatus: newValue } : null))}

                                value={editedRow?.orderStatus}
                                renderInput={(params) => <TextField {...params} />}
                            />
  <p>Payment Status</p>
                            <Autocomplete
                                options={paymentStatusOptions}
                                getOptionLabel={(option) => option}
                                onChange={(_event, newValue) =>                                setEditedRow((prev) => (prev ? { ...prev, paymentStatus: newValue } : null))}
                                value={editedRow?.paymentStatus}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <p>Payment Type</p>
                            <Autocomplete
                                options={paymentOptions}
                                getOptionLabel={(option) => option}
                                onChange={(_event, newValue) =>                                 setEditedRow((prev) => (prev ? { ...prev, paymentType: newValue } : null))}
                                value={editedRow.paymentType}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </div>

                        <div>
                            <p>Total Price</p>
                            <TextField
                                // disabled
                                value={editedRow.totalPrice || ''}
                            onChange={(e) => setEditedRow((prev) => (prev ? { ...prev, totalPrice: e.target.value } : null))}
                                fullWidth
                                margin="dense"
                            />

                            <p>Telegram ID</p>
                            <TextField
                                disabled
                                value={editedRow.telegramid || ''}
                                // onChange={(e) => setEditedRow((prev) => (prev ? { ...prev, telegramid: e.target.value } : null))}
                                fullWidth
                                margin="dense"
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <div
                    className="text-blue-600 hover:bg-blue-200 p-1 rounded-full bg-green-100 px-5 py-2 cursor-pointer"
                    onClick={handleUpdate}
                >
                      {isLoading ? 'Updating...' : 'Update'}
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
};

export default EditOrder;




