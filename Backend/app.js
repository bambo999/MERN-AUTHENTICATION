const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/user-route');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use (cookieParser());
app.use(express.json());
app.use('/api', router);


mongoose.connect('mongodb+srv://admin:DYqwXhdMV1DZm57R@cluster0.6s7dubw.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        app.listen(3000);
        console.log('Connected to MongoDB at Port 3000');
    }).catch(err => {
        console.log(err);
    });




 