// src/components/UserClicksTable.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../redux/store';
import {
    Box,
    Grid,
    InputAdornment,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Drawer,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Card,
    CardHeader,
    Button,
} from '@mui/material';
import { setPageClick, setPaginationDataClick, setRowsPerPageClick } from '../../redux/userSlice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Iconify from '../components/Iconify';
import { useGetAllFeedBackQuery, useGetUpdateFeedbackStatusMutation, useReplyFeedbackMutation } from '../redux/Api/feedback';
// import { useGetUserClicksQuery } from '../redux/Api/User';
// import LoadingIndicator from './LoadingIndicator';

const FeedBackPage: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const [filter, setFilter] = useState('perMonth')
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [reply, setReply] = useState('');
    const  [replyFeedback,{isLoading}] = useReplyFeedbackMutation();
    const  [UpdateFeedbackStatus,/* {isLoading}:editViewLoading */] = useGetUpdateFeedbackStatusMutation();
    const handleFiletr = (string) => {
        setFilter(string)
    }
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        // setPage(0);
    };

    const { data, error } = useGetAllFeedBackQuery();



    // const handleChangePage = (_event: unknown, newPage: number) => {
    //     dispatch(setPageClick(newPage));
    //     console.log("iser newPage when the user is newPage", newPage)
    // };

    // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     dispatch(setRowsPerPageClick(parseInt(event.target.value, 10)));
    // };

    // const sceneNames = data?.clicksPerScene?.flatMap(item => item.userinformationperScene.map(scene => scene.sceneName)) || [];
    // const uniqueSceneNames = Array.from(new Set(sceneNames));
    // const handleViewClick = (user: any) => {
    //     setSelectedUser(user);

    //     setDrawerOpen(true);
    // };

    // const handleDrawerClose = () => {
    //     setDrawerOpen(false);
    //     setSelectedUser(null);
    // };
    const columns = [
        {
          id: 'firstName',
          label: 'First Name',
          render: (feedback: any) => <TableCell>{feedback.user.first_name}</TableCell>,
        },
        {
          id: 'userName',
          label: 'User Name',
          render: (feedback: any) => <TableCell>{feedback.user.username}</TableCell>,
        },
        {
          id: 'feedback',
          label: 'Feedback',
          render: (feedback: any) => <TableCell>{feedback.feedback}</TableCell>,
        },
        {
          id: 'isRead',
          label: 'isRead',
          render: (feedback: any) => <TableCell>{feedback.isRead ? 'Yes' : 'No'}</TableCell>,
        },
        {
          id: 'isReply',
          label: 'isReply',
          render: (feedback: any) => <TableCell>{feedback.isReply ? 'Yes' : 'No'}</TableCell>,
        },
        {
          id: 'reply',
          label: 'Reply',
          render: (feedback: any) => <TableCell>{feedback.reply}</TableCell>,
        },
        {
          id: 'actions',
          label: 'Actions',
          render: (feedback: any) => (
            <TableCell>
              <IconButton onClick={() => handleViewClick(feedback)}>
                <VisibilityIcon />
              </IconButton>
            </TableCell>
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
    const handleViewClick =async (feedback: any) => {


        setSelectedFeedback(feedback);
        setDrawerOpen(true);
        await UpdateFeedbackStatus({id:feedback?._id}).unwrap()

    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedFeedback(null);
        setReply('');
    };

    const handleSendReply = async(id: any, reply: string) => {
        console.log("reply",reply)
    const data={ id,reply }
            await replyFeedback(data).unwrap();
            setReply('');
       
        // Implement the logic to send the reply
        console.log('Reply sent:', id);
        setReply('');
    };


    return (
        <div className='mt-5'>

            <Card>
                <CardHeader title={"User Feedbacks Table"} />
                <Box mt={1}>
                    <Grid container py={5} px={10} spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid item xs={12} md={6} lg={6} xl={6} >
                            <TextField
                                size="small"
                                value={search}
                                placeholder="Search users"
                                onChange={handleSearchChange}
                                variant="outlined"

                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        <Iconify
                                            icon={'eva:search-fill'}
                                            sx={{ color: 'text.disabled', width: 20, height: 20 }}
                                        />
                                    </InputAdornment>,
                                }}

                            />
                        </Grid>
                        <Grid item xs={12} md={6} lg={6} xl={6} >
                            {/* <FilterButtonGroup handlefilter={handleFiletr} filter={filter} /> */}
                        </Grid>

                    </Grid>

                    <TableContainer component={Paper}>
                        <Table>
                        <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
                            <TableBody>

                                {isLoading
                                    ? Array.from(new Array(7)).map((_, index) => renderSkeleton())
                                    : data?.map((feedback) => (
                                        <TableRow key={feedback._id}>
                                        {columns.map((column) => (
                                          <React.Fragment key={column.id}>
                                            {column.render(feedback)}
                                          </React.Fragment>
                                        ))}
                                      </TableRow>

                                    ))}
                            </TableBody>
                            {/* <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={user.clicktotalRows}
                                rowsPerPage={user.clickrowsPerPage}
                                page={user.clickpage}
                                onPageChange={null}
                                onRowsPerPageChange={null}
                            /> */}
                        </Table>
                    </TableContainer>
                    <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                        <Box sx={{ width: 350, p: 3 }}>
                            <Typography variant="h6">User Feedback Detail</Typography>
                            {selectedFeedback && (
                                <List>
                                    <ListItem>
                                        <ListItemText primary="First Name" secondary={selectedFeedback.user.first_name} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Username" secondary={selectedFeedback.user.username} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Feedback" secondary={selectedFeedback.feedback} />
                                    </ListItem>
                                </List>
                            )}
                            <TextField
                                label="Reply"
                                multiline
                                rows={4}
                                                        //    value={selectedFeedback?.feedback? selectedFeedback?.feedback:reply}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button variant="contained" color="primary" onClick={() => handleSendReply(selectedFeedback?._id, reply)}>

                                    Send
                                </Button>
                            </Box>
                        </Box>
                    </Drawer>
                </Box>
            </Card>
        </div>
    );
};

export default FeedBackPage;
