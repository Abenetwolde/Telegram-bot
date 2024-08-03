import React, { useEffect, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import api from '../../services/api';
import { createProduct } from '../../services/product';
import { useDispatch } from 'react-redux';
import { createProductSuccess, fetchProductSuccess } from '../../redux/productSlice';
import { Category } from '../../types/product';
import { Autocomplete, Typography, useTheme } from '@mui/material';
import { getCategoryList } from '../../services/category';
import { ApiResponse, CategoryApi } from '../../types/Category';
import { Height } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useCreateProductMutation, useUploadImageProductMutation, useUploadVedioProductMutation } from '../../redux/Api/product';
import { useGetAllCategoriesQuery } from '../../redux/Api/category';
interface ImagePreview {
    file: File;
    preview: string;
}
interface VideoPreview {
    length: number;
    file: File;
    preview: string;
}
import { Upload as UploadIcon } from '@mui/icons-material';
import Sortable from 'sortablejs';
import axios from 'axios';
import Iconify from '../Iconify';
const CreateNewProduct: React.FC = () => {
    const dispatch = useDispatch();

    const [highlights, setHighlights] = useState<string[]>([]);
    const [highlightInput, setHighlightInput] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [description, setDescription] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [vloading, setVLoading] = useState<boolean>(false);
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoPreview | null>(null);
    const [uploadedVideo, setUploadedVideo] = useState<any>(null);
    const [createProduct, { isLoading }] = useCreateProductMutation()
    const [uploadImageProduct, { isLoading: imageLoading }] = useUploadImageProductMutation()
    const [uploadVedioProduct, { isLoading: vedioLoading }] = useUploadVedioProductMutation()
    const { data: categoryData, isLoading: categoryLoading, error } = useGetAllCategoriesQuery({ page: 1, pageSize: 10 });
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedVideo({
                file,
                preview: URL.createObjectURL(file),
            });
        }
    }; useEffect(() => {
        if (categoryData) {
            setCategories(categoryData.categorys);
        }
    }, [categoryData]);

    // Function to upload the selected video file
    const handleUploadVideo = async () => {
        if (selectedVideo) {
            setVLoading(true);
            const formData = new FormData();
            formData.append('video', selectedVideo.file);
            try {
                const response = await uploadVedioProduct(formData)
                // const response = await api.post('product/upload-video', formData);
                setSelectedVideo(null)
                setUploadedVideo(response.data.files[0]);
                console.log("response.data", response.data.files[0]);

                toast.success('Video uploaded successfully!');
            } catch (error) {
                console.error('Error uploading video:', error);
                toast.error('Error uploading video');
            } finally {
                setVLoading(false)
            }
        }
    };

    const addHighlight = () => {
        if (!highlightInput.trim()) return;
        setHighlights([...highlights, highlightInput]);
        setHighlightInput('');
    };

    const deleteHighlight = (index: number) => {
        setHighlights((prevHighlights) => prevHighlights.filter((h, i) => i !== index));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // if (e.target.files) {
        const files = e.target.files;

        if (files.length > 0) {
            const newImages = Array.from(files).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));

            setSelectedImages((prevImages) => [...prevImages, ...newImages]);
        }



    };
    const handleRemoveSelected = (index: number) => {
        // Filter out the image at the specified index from selectedImages
        const updatedSelectedImages = selectedImages.filter((image, i) => i !== index);

        // Update the state with the updated selectedImages array
        setSelectedImages(updatedSelectedImages);
    };
    const handleUpload = async () => {
        if (selectedImages.length > 0) {
            setLoading(true);
            const formData = new FormData();
            for (let i = 0; i < selectedImages.length; i++) {
                formData.append('images', selectedImages[i].file);
            }

            try {
                const imageresponse = await uploadImageProduct(formData)

                // const response = await api.post('product/upload', formData);
                // console.log('Images uploaded successfully!', response.data.imageUrl);
                // // console.log("see uplader image",response.data)
                setUploadedImages(imageresponse?.data?.imageUrl);
                setSelectedImages([]);
                toast.success('Images uploaded successfully!');
            } catch (error) {
                console.error('Error uploading images:', error);
                toast.error('Error uploading images');
            } finally {
                setLoading(false);
            }
        }
    };

    const newProductSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const productData = {
            name,
            description,
            price,
            highlights,
            category: selectedCategory._id,
            // images:images
            images: uploadedImages,
            video: uploadedVideo
            // Add other fields as needed
        };
        console.log(productData)
        console.log("images................", images)
        // const response = await createProduct(productData)
        // dispatch(createProductSuccess(response));
        const response = await createProduct(productData)
        if (response) {
            toast.success('Product successfully!');
            setSelectedImages("")
            setUploadedImages("")
            setSelectedVideo(null)
            setUploadedVideo("")
            // setHighlights("")
            setHighlightInput("")
            setName("")
            setSelectedCategory
            setCategories([])
            setDescription('')
            setPrice(0)
        }


    };
    const ClearValue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSelectedImages("")
        setUploadedImages("")
        setSelectedVideo(null)
        setUploadedVideo("")
        // setHighlights("")
        setHighlightInput("")
        setName("")
        setSelectedCategory
        setCategories([])
        setDescription('')
        setPrice(0)



    };
    const handleRemoveVideo = () => {
  
        setSelectedVideo(null);
    };
    const CustomLabel = ({ children }) => {
        const theme = useTheme()
        return (
            <Typography style={{ color: theme.palette.text.primary, marginBottom: '0.2rem' }}>
                {children}
            </Typography>
        );
    };
    //   useEffect(() => {
    //     const el = document.getElementById('image-list');
    //     if (el) {
    //         Sortable.create(el, {
    //             onEnd: (evt) => {
    //                 const newOrder = [...selectedImages];
    //                 const [movedItem] = newOrder.splice(evt.oldIndex, 1);
    //                 newOrder.splice(evt.newIndex, 0, movedItem);
    //                 setSelectedImages(newOrder);
    //             },
    //         });
    //     }
    // }, [selectedImages]);


    return (
        <>
            <div className="mb-8 flex-col items-start justify-center mx-auto w-full">
                <form onSubmit={newProductSubmitHandler} className="flex flex-col sm:flex-row rounded-lg shadow-xl p-4 gap-x-10 mx-10" id="mainform" encType="multipart/form-data" >

                    <div className="flex flex-col gap-3 m-2 sm:w-1/2">
                        <CustomLabel>Name</CustomLabel>
                        <TextField
                            // label="Name"
                            variant="outlined"
                            size="small"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <CustomLabel>Description</CustomLabel>
                        <TextField
                            // label="Description"
                            multiline
                            rows={3}
                            // required
                            variant="outlined"
                            size="small"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <CustomLabel>Category</CustomLabel>
                        <Autocomplete
                            options={categories}
                            getOptionLabel={(option) => option.name}
                            onChange={(_event, newValue) => setSelectedCategory(newValue)}
                            value={selectedCategory}
                            renderInput={(params) => <TextField {...params} label="Category" />}
                        />
                        <CustomLabel>Price</CustomLabel>
                        <TextField
                            label="Price"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                inputProps: {
                                    min: 0
                                }
                            }}
                            // required
                            value={price}
                            onChange={(e: any) => setPrice(e.target.value)}
                        />



                        <div className="flex flex-col gap-2">

                            <CustomLabel>Highlights</CustomLabel>
                            <div className="flex  justify-between items-center">
                                <TextField size='small' value={highlightInput} onChange={(e) => setHighlightInput(e.target.value)} type="text" placeholder="Highlight" className="px-2 flex-1 outline-none border-none bg-transparent" />
                                <Button
                                    onClick={() => addHighlight()}
                                    variant="contained"
                                    className="py-2 px-6 rounded-r hover:shadow-lg cursor-pointer"
                                // sx={{ height: '100%'} // Adjust padding as needed
                                >
                                    Add
                                </Button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {highlights?.map((h, i) => (
                                    <div className="flex justify-between rounded items-center py-1 px-2">
                                        <p className=" text-sm font-medium">{h}</p>
                                        <span onClick={() => deleteHighlight(i)} className="text-red-600 p-1 rounded-full cursor-pointer">
                                            <DeleteIcon />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* ... Other form elements ... */}

                    <div className="flex flex-col gap-2 m-2 sm:w-1/2">
                        <>
                            <div>
                                <Typography variant="subtitle2" noWrap sx={{ color: 'text.secondary', mb: "10px" }}>
                                    Product Images
                                </Typography>

                                <div className="relative flex items-center justify-center border rounded h-32 cursor-pointer overflow-hidden "    onClick={handleFileChange}>
        {uploadedImages?.length === 0 ? (
            <>
        
            <TextField
                type="file"
                name="images"
                inputProps={{ multiple: true, accept: 'image/*' }}
                onChange={handleFileChange}
                className="absolute h-full w-full inset-0 opacity-0 cursor-pointer"
            />
            <Iconify icon={'icons8:upload-2'} sx={{ fontSize: 60, color: 'text.secondary', position: 'absolute' }} />
            </>
        ) : (
            uploadedImages?.map((url, index) => (
                <img
                    key={index}
                    src={url?.imageUrl}
                    alt={`Uploaded ${index}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ))
        )}
    </div>

                       {  selectedImages.length>0 &&       <div className="flex gap-2 overflow-x-auto h-32 border rounded mt-2">
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className="relative w-32 h-32">
                                            <img
                                                src={image.preview}
                                                alt={`Selected ${index}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <Button
                                                size='small'
                                                variant="contained"
                                                sx={{
                                                    height: '24px',
                                                    width: '24px',
                                                    padding: '0',
                                                    minWidth: '24px',
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    bgcolor: 'red',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                }}
                                                onClick={() => handleRemoveSelected(index)}
                                            >
                                                X
                                            </Button>
                                        </div>
                                    ))}
                                </div>
}
                                {imageLoading && <div className='absolute top-10'>Loading...</div>}

                                {selectedImages?.length>0&&<div className='flex items-center justify-center gap-4 w-full mt-2'>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        sx={{ height: '100%', width: '100%' }}
                                        onClick={handleUpload}
                                    >
                                        {imageLoading ? "Uploading..." : "Upload"}
                                    </Button>
                                </div>}
                            </div>
                          



                             {/* Product Videos Section */}
        <div className="mt-7">
            <Typography variant="subtitle2" noWrap sx={{ color: 'text.secondary', mb: "10px" }}>
                Product Video
            </Typography>

            <div className="relative flex items-center justify-center border rounded h-32 overflow-hidden">
            {uploadedVideo ? (
                <video controls className="w-full h-full object-cover">
                    <source src={uploadedVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <>
                    <TextField
                        type="file"
                        name="video"
                        inputProps={{ accept: 'video/*' }}
                        onChange={handleVideoFileChange}
                        className="absolute h-full inset-0 opacity-0 cursor-pointer"
                    />
                    <Iconify icon={'icons8:upload-2'} sx={{ fontSize: 60, color: 'text.secondary', position: 'absolute' }} />
                </>
            )}
        </div>

            {selectedVideo && (
                <div className="flex gap-2 overflow-x-auto h-32 border rounded mt-2">
                    <div className="relative w-32 h-32">
                        <video controls className="w-full h-full object-cover">
                            <source src={selectedVideo?.preview} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <Button
                            size='small'
                            variant="contained"
                            sx={{
                                height: '24px',
                                width: '24px',
                                padding: '0',
                                minWidth: '24px',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bgcolor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                            }}
                            onClick={() => handleRemoveVideo()}
                        >
                            X
                        </Button>
                    </div>
                </div>
            )}

            {vedioLoading && <div className='absolute top-10'>Loading...</div>}

           {selectedVideo?.length>0&& <div className='flex items-center justify-center gap-4 w-full mt-2'>
                <Button
                    type="button"
                    variant="contained"
                    sx={{ height: '100%', width: '100%' }}
                    onClick={handleUploadVideo}
                >
                    {vedioLoading ? "Uploading..." : "Upload"}
                </Button>
            </div>}
        </div>

                        </>


                        <div className="flex mt-10 gap-5 justify-end ">
                            <Button
                                // onClick={newProductSubmitHandler}
                                variant='contained'
                                form="mainform"
                                type="submit"
                                size='small'
                                value="Submit"
                            >
                                {isLoading ? "Creating..." : "Create"}

                            </Button>
                            <Button
                                onClick={ClearValue}
                                variant='contained'
                                form="mainform"
                                // type="submit"
                            // value="Submit"
                            >
                                Clear

                            </Button>
                        </div>
                    </div>

                </form >
            </div >

            <ToastContainer />
        </>
    );
};

export default CreateNewProduct;
