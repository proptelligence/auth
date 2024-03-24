const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const sls = require('serverless-http');
const cors = require('cors'); 
const { configuremail } = require('./helpers/common');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://21955a2101:VKBzy9wLgiHjbasl@cluster0.qz5renm.mongodb.net/prop', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Configure email transporter
const transporter = configuremail();

app.use('/auth', authRoutes);

//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => {
 //   console.log(`Server is running on port ${PORT}`);
//});


module.exports.server = sls(app)