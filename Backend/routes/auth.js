const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const supabase = require("../config/supabaseClient")

// SIGNUP
router.post("/signup", async(req,res)=>{

 const {username,email,password} = req.body

 const hashed = await bcrypt.hash(password,10)

 const {data,error} = await supabase
 .from("users")
 .insert([{username,email,password:hashed}])
 .select()

 if(error) return res.status(400).json(error)

 res.json({msg:"Account created"})
})

// LOGIN
router.post("/login", async(req,res)=>{

 const {email,password} = req.body

 const {data} = await supabase
 .from("users")
 .select("*")
 .eq("email",email)
 .single()

 if(!data) return res.status(400).json({msg:"User not found"})

 const match = await bcrypt.compare(password,data.password)

 if(!match) return res.status(400).json({msg:"Wrong password"})

 const token = jwt.sign({id:data.id},process.env.JWT_SECRET)

 res.json({token})
})

module.exports = router