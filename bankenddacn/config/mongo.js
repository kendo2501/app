// config/mongo.js
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://kendo:hieu250103@cluster0.kqr38.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Kết nối MongoDB Atlas thành công');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err);
  }
};

module.exports = connectMongoDB;
