const multer = require("multer");
const cloudnary = require("../config/cloudnary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const productImageStorage = multer.diskStorage({
  destination: "public",
  filename: (req: any, file: { originalname: any; }, cb: (arg0: null, arg1: any) => void) => {
    // console.log(file);
    cb(null, file.originalname);
  },
  fileFilter(req: any, file: { originalname: string; }, cb: (arg0: { message: string; } | undefined, arg1: boolean) => void) {
    // console.log(file, file.mimetype)
    const fileType = file.originalname.split(".")[1];
    console.log(file);
    if (['jpeg','png','jpg'].includes(fileType)) {
      cb(undefined, true);
    } else {
      cb({ message: "Unsupported File format" }, false);
    }
  },
  limits:{fileSize:1024*1024*3}
});



 const fileFilter = (req: any, file: { originalname: string; }, cb: (arg0: Error | undefined, arg1: boolean) => void) => {
     if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPEG|JPG)$/)) {
      cb(new Error("Please upload a valid image file type"), false);
     }
      cb(undefined, true);
  }


   const importfileFilter = (req: any, file: { originalname: string; }, cb: (arg0: Error | undefined, arg1: boolean) => void) => {
     if (!file.originalname.match(/\.(XLSX|xlsx)$/)) {
       cb(new Error("Please upload a valid xlsx file only"), false);
     }
     cb(undefined, true);
   };

const storage = new CloudinaryStorage({
  cloudinary: cloudnary,
  params: {
    folder: "DEV",
  },
  allowedFormats: ["jpg", "png","jpeg","JPG","PNG","JPEG"],
}); 

const uploadMultipleProductImage = multer({
  storage: productImageStorage,
  limits: { fileSize: 1024 * 1024 * 3 },
  fileFilter: fileFilter
}).array("image");

module.exports={uploadMultipleProductImage}