const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectMongoDB = require('./config/mongo');
const authRoutes = require('./routes/authRoutes');
const lifePathRoutes = require('./routes/lifePathRoutes'); // ✅ thêm dòng này
connectMongoDB(); // kết nối MongoDB trước khi server chạy

require('./config/db');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRoutes);


app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
