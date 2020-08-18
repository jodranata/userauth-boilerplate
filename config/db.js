const mongoose = require('mongoose');

const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

const connect = dbURL => {
  mongoose.connect(dbURL, mongoConfig);
  const db = mongoose.connection;
  db.once('open', () =>
    console.log(`Database connected on ${db.host}:${db.port}/${db.name}`),
  );
  db.on('close', () => console.log(`Database is disconnected`));
  db.on('error', err => console.log(err));
};

module.exports = connect;
