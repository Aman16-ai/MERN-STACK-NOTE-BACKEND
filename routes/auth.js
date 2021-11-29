const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body,validationResult} = require('express-validator');
const User = require('../models/User')
const router = express.Router();

const JWT_SECERT = "auth1223@#7531";

//adding some validation to req
router.post('/createuser',[
    body('email').isEmail(),
    body('name').isLength({min:5}),
    body('password').isLength({min:5})
],
async (req,res)=> {
    
    //errors after validation
    const errors = validationResult(req);

    //if there are some errors in the request then sending the errors as a response
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    try {
      //checking whether a user of request email is unique or not
      let user = await User.findOne({email:req.body.email});

      //if email is not unique then sending a response with an error.
      if(user) {
        return res.status(400).json({error:"Sorry a user with this email is already exists"})
      }

      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password,salt);
      //if email is unique then creating a user
      user = await User.create({
          name: req.body.name,
          email:req.body.email,
          password: securePassword,
        })

        const data = {
          user:{
            id:user.id
          }
        };
        const authtoken = jwt.sign(data,JWT_SECERT);
        console.log(authtoken);
        //sending the authtoken as a response
        return res.json({authtoken})
    }
    catch(error) {
      console.error(error.message);
      res.status(500).send("Something went wrong")
    }
})

module.exports = router