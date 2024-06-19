import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, Card, CardHeader, Typography, Stack, useTheme } from '@mui/material';
import Scrollbar from '../Scrollbar';


// utils



export default function CategoryMostClicked({ data, handleFilterOFStatusChange, filterOfStatus }) {
    return (
        <Card>
            <CardHeader title="Latest Products" />
            <Scrollbar >
                <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
                    {data?.products?.map((product) => (
                        <ProductItem key={product.id} product={product} />
                    ))}
                </Stack>
            </Scrollbar>
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
    const { name, totalClickCount, icon/* image, price, priceSale  */ } = product;
    const theme = useTheme()

    return (
        <Stack direction="row" className='flex item-center justify-center' spacing={2}>
            <Box className='flex item-center justify-center'
                sx={{
                    bgcolor: theme.palette.grey[200], width: 48, height: 48, borderRadius: 1.5, display: 'flex',          // Ensure flex display
                    justifyContent: 'center', // Horizontal centering
                    alignItems: 'center'
                }}>
                {icon}

            </Box>
            <Typography sx={{ color: 'text.primary', typography: 'subtitle2' }}>
                {name}
            </Typography>
            <Box sx={{
                flexGrow: 1, display: 'flex',          // Ensure flex display
                justifyContent: 'center', // Horizontal centering
                alignItems: 'center',
                 textAlign:'center'
            }}>



                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign:'center' }}>
                    {totalClickCount}
                </Typography>

            </Box>

            {/* <ColorPreview limit={3} colors={product.colors} sx={{ minWidth: 72, pr: 3 }} /> */}
        </Stack>
    );
}
