const express = require('express');
const numberRoutes = require('./routes/numberRoutes');

const app = express();
const port = 3002;

app.use(express.json());
app.use('/', numberRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});