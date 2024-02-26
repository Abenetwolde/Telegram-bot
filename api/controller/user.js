// const Product = require('../model/product');

const User=require('../model/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Create Product ---ADMIN
exports.createUser = async (req, res) => {
    console.log("hit the create user api")

    try {
        let user = await User.findOne({ telegramid: req.body.telegramid });
        if (user) {
            return res.json({ token: user.token, message: 'User already registered.' });
            // return res.status(400).json({ success: false, message: 'User already exists!' });
        } else {
            const telegramId=req.body.telegramid
            const token = jwt.sign(
                { userId: telegramId },
                process.env.JWT_TOKEN_SECRET_KEY,
                { expiresIn: "7d" }
              );
            // const token = jwt.sign({ telegramId }, 'your_secret_key');
            user = new User({
                telegramid: req.body.telegramid,
                name: req.body.name,
                last: req.body.last,   
                token:token
            })
            user = await user.save();
        
            res.status(201).json({
                success: true,
                user
            }); 
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
      }
  
};
exports.getUserDetails = async (req, res, next) => {
    console.log("hit the getUserDetails user api")

    try {
        const user = await User.findOne({telegramid:req.params.telegramid});
        if(user){
            res.status(200).json({
                success: true,
                user,
            });
        }else{
            res.status(500).json({
                success: false,
                message: "user not found!"
            });  
        }   
    }catch (error) {
                res.status(500).json({ error: error.message });
            }
  
  
}
exports.updateUserDetails = async (req, res, next) => {
    console.log("hit the updateUserDetails user api")

    try {
        let user = await User.findOne({ telegramid: req.params.telegramid });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        user = await User.findByIdAndUpdate(user._id, req.body, { new: true });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User update failed!' });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
  
  
}
exports.deleteAuser = async (req, res, next) => {
    console.log("hit the delete user api")
    try {
        let user = await User.findOne({ telegramid: req.params.telegramid });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        user = await User.findByIdAndRemove(user._id);

        if (!user) {
            return res.status(400).json({ success: false, message: 'User deletion failed!' });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully!'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
 
  
}
exports.getAllAuser = async (req, res, next) => {
    console.log("hit the get all user api")
    try {
        let users = await User.find();
        if(users) {
            res.status(201).json({
                success: true,
                users
            });
        }  
       
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
 
  
}
exports.adminLogin = async (req, res) => {
    console.log("hit the adminlogin api")
    try {
    const { email, password } = req.body;
    const query = { email: email };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User Doestn't Exist. Try Sign Up!" });
    }
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_TOKEN_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );
   
      await User.findOneAndUpdate(
        { email: email },
        { token: token },
        { new: true }
        );
      return res.status(200).json({ User: user });
    }
    res.status(400).send("Invalid Credentials");
  } catch (error) {
    return res.status(500).send({ message: error });
  }
}

exports.adminCreate = async (req, res) => {
    console.log("hit the admin create api")
    let userData = req.body;
    const { email, password } = req.body;

    const phoneORemailExist = await User.findOne({
        email: email 
      });
  
    if (phoneORemailExist) {
        return res
          .status(400)
          .send({ message: "PHONE_EMAIL_ALREADY_EXISTS_ERR" });
      }
  
      const encryptedPassword = await bcrypt.hash(password, 10);
      userData.password = encryptedPassword;
  
      const newUser = await User.create(userData);
      const token = jwt.sign(
      { user_id: newUser._id, email },
      process.env.JWT_TOKEN_SECRET_KEY,
      {
        expiresIn: "1d",
      }
      );
      newUser.token = token;
      res
        .status(201)
        .send({
          user: newUser,
          message: "Account Created Saved Succesfully !",
        });
  
    }

  

// exports.getCategorys = async (req, res) => {
//     console.log("hit get all category api")
//     const categoryList = await Category.find();

//     if(!categoryList) {
//         res.status(500).json({success: false})
//     } 
//     res.status(201).json({
//         success: true,
//         categoryList
//     }); 
// };
// exports.getSingleCategory =async (req, res) => {
//     try {

//         console.log("hit the getsingle category api")
//         const category = await Category.findById(req.params.id);

//         if(!category) {
//             res.status(500).json({message: 'The category with the given ID was not found.'})
//         } 
    
//         res.status(200).json({
//             category
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// exports.updateCategory =async (req, res) => {
//     try {
//         console.log("hit the update category api")
//         const category = await Category.findByIdAndUpdate(
//             req.params.id,
//             {
//                 name: req.body.name,
//                 icon: req.body.icon || category.icon,
                
//             },
//             { new: true}
//         )
    
//         if(!category)
//         return res.status(400).send('the category cannot be created!')

    
//         res.status(200).json({
//             category
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// exports.deleteCategory =async (req, res) => {
//     console.log("hit delete category api")
//     Category.findByIdAndRemove(req.params.id).then(category =>{
//         if(category) {
//             return res.status(200).json({success: true, message: 'the category is deleted!'})
//         } else {
//             return res.status(404).json({success: false , message: "category not found!"})
//         }
//     }).catch(err=>{
//        return res.status(500).json({success: false, error: err}) 
//     })
// };

