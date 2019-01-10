/**
 *
 * Grabs the CURRENT forecast information for each cityID.
 *      Checks the DB to see if cityID has a forecast that is 3 hours or newer.
 *              If exists and was within time range, send that document from mongo
 *              If exists but NOT within time range, grab from OpenWeatherMaps and throw in DB
 *              If does not exist, grab from OpenWeatherMaps and put in DB
 *
 *@returns JSON of all the props that the client needs.
 */

const axios = require("axios");
axios.defaults.baseURL = "http://api.openweathermap.org/data/2.5";




function constructData(data){

    let returnObject = {};
    let list = {};
    for (let i = 0; i < data.cnt; i++) {

        let cityName = data.list[i].name;

        let currentWeather = {};

        currentWeather["city"] = cityName;
        currentWeather["icon"] = data.list[i].weather["0"].icon;
        currentWeather["weatherDescript"] = data.list[i].weather["0"].description;
        currentWeather["sunrise"] = data.list[i].sys.sunrise;
        currentWeather["sunset"] = data.list[i].sys.sunset;
        currentWeather["temp"] = data.list[i].main.temp;
        currentWeather["minTemp"] = data.list[i].main.temp_min;
        currentWeather["maxTemp"] = data.list[i].main.temp_max;
        currentWeather["dt"] = data.list[i].dt;

        let response = {};
        response["city"] = cityName;
        response["currentWeather"] = currentWeather;
        list[i] = response;
    }
    returnObject["list"] = list;
    returnObject["count"] = data.cnt;

    return returnObject;


}


module.exports = (req, res) => {

    let apiName = "currentWeather: ";

    //Used to access OpenWeatherMaps
    var forecastUrl = "/group?id=<CITYID>&units=imperial&appid=<APPID>";
    forecastUrl = forecastUrl.replace(/<CITYID>/i, req.query.cityId);
    forecastUrl = forecastUrl.replace(/<APPID>/i, process.env.WeatherId);

    axios.get(forecastUrl)
        .then(function (response) {
            console.log(apiName + "Sending weather data for cities: " + req.query.cityId);

            let data = constructData(response.data);

            res.status(200).json(data);
        })
        .catch(function (error) {
            console.log("error...")
            console.log(error)
            res.status(error.response.data.cod).send(error.response.data.message).end();
        });

    //User now has data; save the response to MongoDB
};