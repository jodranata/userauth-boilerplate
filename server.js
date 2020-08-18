const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const connectDB = require('./config/db');
const config = require('./config/config');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');

connectDB(config.MONGO_URL);

app.use(bodyParser.json());

if (config.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: config.CLIENT_URL,
    }),
  );
  app.use(morgan('dev'));
}

app.use('/api/', authRoute);
app.use('/api/user/', userRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found',
  });
});

app.listen(config.PORT, () => {
  console.log(`app is listening on port ${config.port}`);
});
