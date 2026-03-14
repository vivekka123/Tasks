const router = require("express").Router()
const bcrypt = require("bcryptjs")
const supabase = require("../config/supabaseClient")
const auth = require("../middleware/auth")

router.post("/",auth, async(req,res)=>{

 const {newPassword} = req.body

 const {data:history} = await supabase
 .from("password_history")
 .select("*")
 .eq("user_id",req.user.id)
 .limit(3)

 for(let p of history){

  const same = await bcrypt.compare(newPassword,p.password)

  if(same){
   return res.json({msg:"Cannot reuse last 3 passwords"})
  }

 }

 const hashed = await bcrypt.hash(newPassword,10)

 await supabase
 .from("users")
 .update({password:hashed})
 .eq("id",req.user.id)

 await supabase
 .from("password_history")
 .insert([{user_id:req.user.id,password:hashed}])

 res.json({msg:"Password changed"})
})

module.exports = router