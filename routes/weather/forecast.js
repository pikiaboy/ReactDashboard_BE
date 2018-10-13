

const axios = require("axios");

axios.defaults.baseURL = "http://api.openweathermap.org/data/2.5";



/**
 *  dt - time when data was taken in epoch
 *
 * temp - current temp for dt.
 *
 * minTemp - min temp for dt.
 *
 * maxTemp - max temp for dt.
 *
 * icon - icon of current weather
 *
 * description - text of weather
 *
 * dt_txt - coversion of epoch
 *
 * @returns JSON of parsed data
 */
function parseHour(data){
    let parsedData = {};

     parsedData.dt = data.dt;
     parsedData.temp = data.main.temp;
     parsedData.minTemp = data.main.temp_min;
     parsedData.maxTemp = data.main.temp_max;
     parsedData.icon = data.weather.icon;
     parsedData.description = data.weather.description;
     parsedData.dt_txt = data.dt_txt;

     return parsedData;
}



    /**
     * TODO: Needs to check if time is in DB before making a request
     * to OpenWeatherMaps.
     */

module.exports = (req, res) =>{

    let apiName = "forecast: ";

    let forecastUrl = "/forecast?id=<CITYID>&units=imperial&appid=<APPID>";

    let cityIds = req.query.cityIds.split(",");

    forecastUrl = forecastUrl.replace("<APPID>", process.env.WeatherId);

    let promieses = [];

    cityIds.forEach(cityId => {
        let getURL = forecastUrl.replace("<CITYID>", cityId);

        promieses.push(axios.get(getURL));
    });

    Promise.all(promieses)
        .then(function(response){
            console.log(apiName + "sending data for cityIds: " + cityIds);
            let data = {};
            response.forEach(res =>{
                let cityName = res.data.city.name;

                data[cityName] = [];

                res.data.list.forEach(hour => {
                    data[cityName].push(parseHour(hour));
                });

            })
            res.status(200).json(data);
        })
        .catch(error =>{
            console.log(error)
        })
}