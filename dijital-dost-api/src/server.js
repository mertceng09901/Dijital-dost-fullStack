const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Rotaları içeri aktar
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');

// Rotaları kullan
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dijital_dost_dev';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı.');
    app.listen(PORT, () => {
      console.log(`Dijital Dost API ${PORT} portunda çalışıyor.`);
    });
  })
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));