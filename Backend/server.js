require("dotenv").config()

const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const supabase = require("./supabase")
const PORT=4500

const app = express()

app.use(express.json())

app.use((req,res,next)=>{
console.log("Request:",req.method,req.url)
next()
})

app.use(cors())


// SIGNUP
app.post("/signup", async (req,res)=>{

const {username,email,password} = req.body

const hash = await bcrypt.hash(password,10)

const {data,error} = await supabase
.from("users")
.insert([{username,email,password:hash}])
.select()

if(error) return res.send(error)

await supabase
.from("password_history")
.insert([{user_id:data[0].id,password:hash}])

res.send("User Created")

})

// LOGIN
app.post("/login", async(req,res)=>{

const {email,password} = req.body

const {data} = await supabase
.from("users")
.select("*")
.eq("email",email)
.single()

if(!data) return res.send("User not found")

const match = await bcrypt.compare(password,data.password)

if(!match) return res.send("Wrong password")

const token = jwt.sign({id:data.id},process.env.JWT_SECRET)

res.json({token,userId:data.id})

})

// CHANGE PASSWORD
app.post("/change-password", async(req,res)=>{

const {userId,newPassword} = req.body

const hash = await bcrypt.hash(newPassword,10)

const {data} = await supabase
.from("password_history")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})
.limit(3)

for(let p of data){

const match = await bcrypt.compare(newPassword,p.password)

if(match){
return res.send("Cannot reuse last 3 passwords")
}

}

await supabase
.from("users")
.update({password:hash})
.eq("id",userId)

await supabase
.from("password_history")
.insert([{user_id:userId,password:hash}])

res.send("Password Updated")

})

// CREATE POST
app.post("/post", async(req,res)=>{

const {userId,content,visibility} = req.body

const {data} = await supabase
.from("posts")
.insert([{user_id:userId,content,visibility}])

res.send(data)

})

// GET POSTS
app.get("/posts/:userId", async(req,res)=>{

const userId = req.params.userId

const {data} = await supabase
.from("posts")
.select("*")
.or(`visibility.eq.public,user_id.eq.${userId}`)

res.send(data)

})

app.listen(PORT,()=>{
console.log("Server running")
})