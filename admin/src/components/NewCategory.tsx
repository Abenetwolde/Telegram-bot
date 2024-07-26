import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { toast } from 'react-toastify';
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";

import { styled } from '@mui/material/styles';
import { useCreateCategoryMutation } from '../redux/Api/category';
const NewCategoryForm: React.FC = () => {
  const [ createCategory,{isLoading}]=useCreateCategoryMutation()
  const theme = useTheme();
  const FormContainer = ({ children }) => {
    return (
      <Box
        sx={{
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
          margin: 'auto',
          width: '100%',
          '@media (min-width: 960px)': {
            width: '50%',
          },
          backgroundColor:theme.palette.background.paper
        }}
      >
        {children}
      </Box>
    );
  };
  
  const StyledForm = ({ children, onSubmit }) => {
    return (
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          boxShadow: 3,
          borderRadius: 1,
          padding: 3,
          width: '100%',
        }}
      >
        {children}
      </Box>
    );
  };
  
  const [name, setName] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      // const newCategory = await createCategory(name, icon);
      //   dispatch(fetchCategories());
      const newCategory = await createCategory({name, icon}).unwrap();
      toast.success('Category created successfully!');
      setIcon('')
      setName('')
      // otsetIconher success handling, e.g., showing a success toast
    } catch (error) {
      toast.error('Failed to create category');
      // handle error, e.g., show error toast
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <FormContainer>
        <StyledForm onSubmit={handleSubmit}>
        
            <Typography variant="subtitle1" noWrap sx={{ color: 'text.secondary' ,mb:"10px"}  }>
              New Category
            </Typography>
            {/* <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'left', marginBottom: '1rem', color: theme.palette.text.primary }}>New Category</h2> */}
          
          <div>
            <TextField
              required
              type="text"
              label="Name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 4 }}
            />
          </div>
          <div>
            <TextField
              type="text"
              label="Emoji"
              placeholder="Emoji"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 4 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </StyledForm>
      </FormContainer>



    </>
    // your form JSX here
  );
};

export default NewCategoryForm;
