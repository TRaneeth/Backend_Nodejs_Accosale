const express = require('express')
const dotEnv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const path = require('path')

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


dotEnv.config()

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>{
    console.log("mongoDB connected successfully")
})
.catch((error)=>{
    console.log("MongoDB connection failed",error)
})

app.use('/user',userRoutes)
app.use('/post',postRoutes)
app.use('/uploads',express.static('uploads'))



app.listen(PORT,()=>{
    console.log(`Server started and running at ${PORT}`)
})

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Accosale Backend" });
});
