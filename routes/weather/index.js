const weather = require('express').Router();

const currentWeatherData = require('./currentWeatherData.js');
const forecast = require('./forecast.js');

//Bind each Weather API here
weather.get('/currentWeather', currentWeatherData);
weather.get('/forecast', forecast);


module.exports = weather;