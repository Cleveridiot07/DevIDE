// Import the express module
const express = require('express');

// Initialize the app
const app = express();

// Define a simple route to respond to the root URL
app.get('/', (req, res) => {
  res.send('Hello, Express is running on port 5000!');
});

// Start the server and listen on port 5000
const PORT = 7500;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});