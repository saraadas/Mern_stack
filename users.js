const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');





//@description  Test Route
//@route        GET api/users
//@access       Public
router.get('/'  ,(req,res)=>res.send('This is the Users GET Route'));



//@description  Register User
//@route        POST api/users
//@access       Public
router.post('/' , 
[
    check('name', 'name is required')
    .not()
    .isEmpty(),

    check('email', 'Please Include a Valid Email').isEmail(),
    check('password', 'Please enter a min 5 characters password').isLength({min:6})
],

    async (req,res)=>{

    console.log(req.body)


    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} = req.body;



    try{
            // see if user exists

            let user = await User.findOne({ email });

            if(user){
                return res.status(400).json({errors: [{msg:'user already exists'}]});
            }



            //get user gravatar

            const avatar = gravatar.url(email, {
                s:'200',
                r:'pg',
                d:'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            })


            //encrypt password

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();


            //return jsonwebtoken

            res.send(user);

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');

    }
    

});




module.exports = router;