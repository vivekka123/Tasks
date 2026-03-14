const router = require("express").Router()
const supabase = require("../config/supabaseClient")
const auth = require("../middleware/auth")

// CREATE POST
router.post("/",auth, async(req,res)=>{

 const {content,visibility} = req.body

 const {data,error} = await supabase
 .from("posts")
 .insert([
  {
   user_id:req.user.id,
   content,
   visibility
  }
 ])
 .select()

 res.json(data)
})

// GET POSTS
router.get("/",auth, async(req,res)=>{

 const {data,error} = await supabase
 .from("posts")
 .select("*")
 .or(`visibility.eq.public,user_id.eq.${req.user.id}`)

 res.json(data)
})

module.exports = router