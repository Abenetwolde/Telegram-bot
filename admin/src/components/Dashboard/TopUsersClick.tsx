import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, Card, CardHeader, Typography, Stack, useTheme, Grid, Skeleton } from '@mui/material';
import Scrollbar from '../Scrollbar';
import FilterButtonGroup from '../FilterButtonGroup';
import { useGetUserClicksQuery } from '../../redux/Api/User';
import { useEffect } from 'react';
import useIntersectionObserver from '../../redux/Api/utils/useIntersectionObserver';
// utils



export default function TopUsersClick() {
    const [ref, isVisible] = useIntersectionObserver();
const {data, isLoading, error,refetch}=useGetUserClicksQuery({ page : 1, pageSize : 5, interval : 'perMonth',search:'' },  { skip: !isVisible })
useEffect(() => {
    if (isVisible) {
      refetch();
    }
  }, [isVisible, refetch]);
  if (isLoading) {
    return (
        <Grid item xs={12} lg={12} textAlign="center">
            <Card ref={ref} className="p-4">
                <Skeleton variant="text" width={200} height={40} />
                <Stack mt={1}>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
                    ))}
                </Stack>
            </Card>
        </Grid>
    );
}
    return (
        <Card   ref={ref}  className='p-4'>
            <CardHeader title="Top 3 Users Click" />
            
                     <Stack mt={1} >
                    {data?.clicksPerScene?.map((product,i) => (
                        <ProductItem key={i} product={product} />
                    ))}
                </Stack>
    
        </Card>
    
    );
}

// ----------------------------------------------------------------------

ProductItem.propTypes = {
    product: PropTypes.shape({
        colors: PropTypes.arrayOf(PropTypes.string),
        image: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        priceSale: PropTypes.number,
    }),
};

function ProductItem({ product }) {
    const { userInformation, totalClicks, icon } = product;
const {first_name, username}=userInformation
    const theme = useTheme();

    return (
        <Box  alignItems="center" >
    
            <Box
                sx={{
                    bgcolor: theme.palette.grey[200],
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                }}
            >
                {first_name.charAt(0)}
            </Box>
      
        <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {first_name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                @{username}
            </Typography>
        </Box>
        <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {totalClicks}
            </Typography>
        </Box>
    </Box>
);
}
