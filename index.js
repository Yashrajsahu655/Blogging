const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/authentication');

const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/Blog');

const Blog = require('./models/blog')

const app = express();
const PORT = 8000;



mongoose.connect('mongodb://127.0.0.1:27017/blogify').then((e)=>console.log('mongodb connected'));

app.set('view engine','ejs');
app.set('views',path.resolve("./views"));


app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')))

app.get('/',async (req,res)=>{
   const allBlogs = await Blog.find({});

    res.render(
        'home',{user:req.user,
            blogs: allBlogs,
        }
        );
})


app.use('/user',userRoutes);
app.use('/blog',blogRoutes);

app.listen(PORT,()=>console.log(`server started at PORT : ${PORT}`))
