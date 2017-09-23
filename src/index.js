require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const api = require('./api');

const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI, { useMongoClient: true }).then(
  (response) => {
    console.log('Connected to db')
  }
).catch(e => {
  console.error(e);
});

const port = process.env.PORT;

app.use(bodyParser());

router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
