const express = require('express');
const session = require('express-session');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const dashboardRoutes = require('./routes/dashboard');
const trackingRoutes = require('./routes/tracking');
const projectRoutes = require('./routes/projectRoutes');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const path = require('path');



// Initialize Express
const app = express();

// debuggivb \
const cors = require("cors");
app.use(cors());


// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//ejs
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use('/images', express.static('images'));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));






// local storing sessions
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true
// }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL, // Use MongoDB for session storage
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1-day session expiry
}));


// Default route
app.use('/', homeRoutes);

app.use('/auth', authRoutes);
app.use('/dashboard',dashboardRoutes);
app.use('/',trackingRoutes);

app.use('/project', projectRoutes);




// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
