const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
require('./config/db'); 

const app = express();
const port = 3000;

const corsOptions = {
  origin: '*', // Chấp nhận tất cả nguồn (chỉ cho môi trường phát triển)
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
