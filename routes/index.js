const routes = require('express').Router();
const weather = require('./weather');


//Attatch endpoints here
routes.use('/weather/', weather);




routes.get('/', (req, res) => {
  res.status(200).json({
    message: 'Connected!'
  });
});

module.exports = routes;