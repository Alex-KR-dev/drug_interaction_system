const express = require('express');
const cors = require('cors');
const connection = require('./config/db.js');
const apiRoutes = require('./routes/api');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Test database connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
