

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
function parseForecast(data){
    let parsedData = {};
    // date = new Date(data.dt);

     parsedData.dt = data.dt;
     parsedData.temp = data.main.temp;
     parsedData.minTemp = data.main.temp_min;
     parsedData.maxTemp = data.main.temp_max;
     parsedData.icon = data.weather.icon;
     parsedData.description = data.weather.description;
     parsedData.icon = '0'//data.weather.icon;
     //1000 to convert to local date.
     parsedData.dt_txt = new Date(data.dt * 1000).toString();

     return parsedData;
}



    /**
     * TODO: Needs to check if time is in DB before making a request
     * to OpenWeatherMaps.
     */

module.exports = (req, res) =>{

    if (req.query.cityIDs === null){
        res.status(400).send("No CityIDs set!");
        return;
    }

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
                let parsedDay = {};

                let cityName = res.data.city.name;

                data[cityName] = {};

                res.data.list.forEach(hour => {
                    parsedForecast = parseForecast(hour);

                    if (parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)] != null){
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)].push(parsedForecast.minTemp);
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)].push(parsedForecast.maxTemp);

                    } else {
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)] = new Array();
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)].description = false;
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)].push(parsedForecast.minTemp);
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)].push(parsedForecast.maxTemp);
                    }
                    //09d is raining
                    if (parsedForecast.icon >= "09d"){
                        parsedDay[parsedForecast.dt_txt.split(/\s+/).slice(1,3)].description = true;
                    }

                });

                Object.keys(parsedDay).forEach(day => {
                    let length = parsedDay[day].length;
                    parsedDay[day].sort();

                    data[cityName][day] = {
                        'minTemp' : parsedDay[day][0],
                        'maxTemp' : parsedDay[day][length - 1],
                        'raining' : parsedDay[day].description
                    }

                })

                // data[cityName].push();
                // console.log(parsedDay);

            })
            res.status(200).json(data);
        })
        .catch(error =>{
            console.log(error)
        })
}