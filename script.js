//Main page input element
const cityInput = document.getElementById('city');

//my api key
const apiKey = 'a0824c7a15850d3021f120f4201ffac6'; 

//getting the data for main index page using cityInput and local storage
if(window.location.pathname.includes('index.html') || window.location.pathname === ('/') || window.location.pathname.includes('project_4_weather')){

    if(cityInput){
cityInput.addEventListener('keypress', async (e) => {  

    if (e.key === "Enter") {
        const cityName = cityInput.value.trim();
        cityInput.value = '';
    console.log(city
    if(!cityName){
        alert("Please enter a city name.");
        return;
    }
// Reject if the input contains numbers
    if (!/^[a-zA-Z\s]+$/.test(cityName)) {
        alert("Please enter a valid city name (only letters).");
        return;
    }

    await main(cityName); // PROBLEM: `main()` is called without the `cityName` argument it needs.
                
    }  } );

    }

    document.addEventListener('DOMContentLoaded' ,() => { 

        //getting data from localstorage
        const storedForecastString = localStorage.getItem('forcast');
        const storedAqiDataString = localStorage.getItem('aqiData');
        const storedCityCoordString = localStorage.getItem('cityCoord');

        if (storedForecastString && storedAqiDataString && storedCityCoordString) {
            try {
                const forcastData = JSON.parse(storedForecastString);
                const aqiData = JSON.parse(storedAqiDataString);
                const cityCoord = JSON.parse(storedCityCoordString);

                //function displaying data on main page
                placeInfo(forcastData, aqiData, cityCoord);
                console.log("Displayed data from localStorage on index.html");

                // Optionally scroll to view
                const cardsHeading = document.getElementById("cardsHeading");
                if (cardsHeading) {
                    cardsHeading.scrollIntoView({ behavior: "smooth" });
                }

            } catch (error) {
                console.error("Error parsing stored data on index.html:", error);

            }
        } else {
            console.log("No stored weather data found for initial display on index.html.");
        }
    });

}







//main function 
async function main(cityName){
    try{
        //gets coordinates using city name 
        const coord =await getCoordinates(cityName); // PROBLEM: 'cityName' is not defined in this scope. It needs to be passed as an argument to `main()`.

        
        if (!coord) {
            console.alert(" Coordinates not found, skipping weather fetch.",err); // PROBLEM: 'err' is not defined in this scope.
            return;
        }

        
        //gets weather using coordinates
        await getWeather(coord);
    }catch(error){
        console.error("error in main function: ",error);
        alert("An error occurred while fetching weather data. Please try again.");
    }
}
// function to get coordinates using city name fetches data from openweathermap
async function getCoordinates(city){
    try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
        const data = await res.json()

        if (data.length === 0) {
            return null;  // City not found
        }     
        //returns lantitude,longititude,name,countryname
        return{
        lat : data[0].lat,
        lon : data[0].lon,
        name : data[0].name,
        country: data[0].country
        }
    }catch(err){ 
        console.error("Please enter city name correct..." ,err)
        return null;
    }
}

// function to get weather condition and aqi using city name fetches data from openmeteo

async function getWeather(coord){
    //fetches the weather condition            
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&hourly=temperature_2m,rain,apparent_temperature,precipitation,precipitation_probability,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_min,temperature_2m_max&current_weather=true&timezone=auto`;
    //fetches the aqi 
    const url2 = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coord.lat}&longitude=${coord.lon}&hourly=pm10,pm2_5`;
    


    try{
        const [res1,res2] = await Promise.all([fetch(url),fetch(url2)]);

        if (!res1.ok || !res2.ok) {
            throw new Error(`HTTP error! Status: ${res1.status || res2.status}`);
        }

        const forCast = await res1.json();
        const aqiData = await res2.json();
        //storing the fetched data on local storage
        localStorage.setItem("forcast",JSON.stringify(forCast));
        localStorage.setItem("aqiData",JSON.stringify(aqiData));
        localStorage.setItem("cityCoord",JSON.stringify(coord));

        //displaying the data on main page
        placeInfo(forCast,aqiData,coord);

        //scroll to the cards section
        if (cardsHeading) { // PROBLEM: 'coord' is always truthy here if `getWeather` was called (as it's an object). The check `if (coord)` should be done before calling `getWeather` or in `main`.
                document.querySelector("#cardsHeading").scrollIntoView({ // PROBLEM: `#cardsHeading` might not exist on all pages where this script is included. This will cause an error on other pages.
                    behavior: "smooth"

                });
        }
    }catch(err){
            console.error("Can't Get the weather",err)
        }

}
//places the data on main page
async function placeInfo(forCast,aqiData,coord){  

    const tempSpan = document.getElementById("tempSpan"); // PROBLEM: These DOM selections will run on *every* HTML page where script.js is included. If these elements don't exist (e.g., on temp.html or wind.html), they will be `null` and subsequent operations on them will throw errors.
    const windSpan = document.getElementById("windSpan");
    const rainSpan = document.getElementById("rainSpan");
    const aqiSpan = document.getElementById("aqiSpan"); // PROBLEM: Typo? Should it be 'aqiSpan' or 'apiSpan' as ID in HTML?
    const cityCountry = document.getElementById("cityAndCountrySpan");

    
    
    
//fetches the current time
    const currentTime = (forCast.current_weather.time).slice(0,13) + ":00";

// finds the index for the currentTime
    const indx= forCast.hourly.time.indexOf(currentTime);

    
    let actualHourlyIndex = indx;

    //finds the closest index if the actualindex is not present in data
    if((indx === -1 && forCast.hourl.time.length>0 )){
        const now = new Date(currentTime);
        const hourlyTimes = forCast.hourly.time.map(t=> new Date(t));
        let closestDiff = Infinity;
        let closestIndex = -1;
        hourlyTimes.forEach((hourlyTimes,i) => {
            const diff = Math.abs(hourlyTimes - now);
            if(diff<closestDiff){
                closestDiff=diff;
                closestIndex = i;
            }
        });
        actualHourlyIndex = closestIndex;
        console.warn("Current weather time not found in hourly data, using closest index:", actualHourlyIndex);
    }

    const temperature = forCast.current_weather.temperature;
    const windSpeed = forCast.current_weather.windspeed;
    const rainprobability= forCast.hourly.precipitation_probability[indx];
    const aqi = aqiData.hourly.pm2_5[indx];
    
    tempSpan.innerText= "";
    tempSpan.innerText=": " +temperature + "°C";
    windSpan.innerText=": " +windSpeed + "mph";
    rainSpan.innerText=": " +rainprobability + "%";
    aqiSpan.innerText=": " +aqi + "µg/m³";  
    cityCountry.innerText=" for " + coord.name + ", " + coord.country + ".";


}





//following eventlistener displays the the navigation bar for small screens 

const checkForcast = document.getElementById("checkForcast");
const toggleBtn= document.querySelector(".toggle-btn"); 
const dropDown= document.querySelector(".dropdown-menu"); 

if (toggleBtn && dropDown) {
    toggleBtn.addEventListener("click", () => {
        if (window.innerWidth < 1280) {
            dropDown.classList.toggle('hidden');
            dropDown.classList.toggle('top-24');
        } else if (window.innerWidth >= 1280) {
            dropDown.classList.remove('hidden');
        }
    });
}

if (checkForcast && dropDown) {

    checkForcast.addEventListener("click", () => {
        const header = document.querySelector("#header");
        
        cityInput.classList.toggle='bg-red-900'
        if(header){
            header.scrollIntoView({behavior : "smooth"})

        }
        if (window.innerWidth < 1280) {
            dropDown.classList.toggle('hidden');
            dropDown.classList.toggle('top-24');
        } else if (window.innerWidth >= 1280) {
            dropDown.classList.remove('hidden');
        }
    });
}

const player = document.querySelector("lottie-player");
if (player) {
    // Observer for lottie player visibility
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const player = entry.target;
            if (entry.isIntersecting) {
                player.play();
            } else {
                player.pause();
            }
        });
    });
    observer.observe(player);
}





//temperature page
if (window.location.pathname.includes('temp.html')) {
    document.addEventListener('DOMContentLoaded', () => {

        //DOM Variables
        const tempValueSpan = document.getElementById("tempValueSpan");
        const feelsLikeValueSpan = document.getElementById("feelsLikeValueSpan"); 
        const minValueSpan = document.getElementById("minValueSpan"); 
        const maxValueSpan = document.getElementById("maxValueSpan"); 
        const humidityValueSpan = document.getElementById("humidityValueSpan");
        const tempResultDiv = document.getElementById("tempResult");
        const messageSpan = document.getElementById("messageSpan"); 
        const messageDiv = document.getElementById("messageTemp");

        const storedForecastString = localStorage.getItem('forcast');
        const storedCityCoordString = localStorage.getItem('cityCoord');

        //displays the data in temp.html file
        if (storedForecastString && storedCityCoordString) {
            try {
                const forcast = JSON.parse(storedForecastString);
                const cityCoord = JSON.parse(storedCityCoordString);
                

                // Find current time index

                const currentTime1 = (forcast.current_weather.time).slice(0,13) + ":00";
                
                const indx = forcast.hourly.time.indexOf(currentTime1);
                let actualHourlyIndex = indx;

                //if index is not present in time array
                if(indx == -1){

                    actualHourlyIndex = 0;
                        
                    console.warn("Current weather time not found in hourly data on temp.html, using closest index:", actualHourlyIndex);
                }


                if (actualHourlyIndex !== -1) {
                    // Update DOM elements on temp.html
                    if (tempValueSpan) tempValueSpan.textContent = forcast.current_weather.temperature + "°C";
                    if (feelsLikeValueSpan) feelsLikeValueSpan.textContent = forcast.hourly.apparent_temperature[actualHourlyIndex] + "°C";
                    
                const minTemps = forcast.daily?.temperature_2m_min;
                const maxTemps = forcast.daily?.temperature_2m_max;
                const days = forcast.daily?.time;

                if (Array.isArray(minTemps) && Array.isArray(maxTemps) && Array.isArray(days)) {
                    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
                    
                    let indx = days.indexOf(today);

                    // If today not found, fallback to last available
                    if (indx === -1) indx = minTemps.length - 1 ;

                    // Finally, set the temperature and display the values in temp.html
                    if ((minValueSpan && minTemps[indx] !== undefined) && (maxValueSpan && maxTemps[indx])) {
                        minValueSpan.textContent = minTemps[indx] + "°C";
                        maxValueSpan.textContent = maxTemps[indx] + "°C";
                    } else {
                        minValueSpan.textContent = forcast;
                        maxValueSpan.textContent = "N/A";
                        console.warn("Min and max temperature not available.");
                    }}

                    if (humidityValueSpan) humidityValueSpan.textContent = forcast.hourly.relative_humidity_2m[actualHourlyIndex] + "%";

                    if (messageSpan) messageSpan.textContent = `for ${cityCoord.name}, ${cityCoord.country}.`;
                } else {
                        if (messageSpan) messageSpan.textContent = 'Could not find current hourly data for temperature.';
                        console.error('Could not find current hourly data for temperature.');
                }


            } catch (error) {
                console.error('Error parsing stored data on temp.html:', error);
                if (messageDiv) messageDiv.textContent = 'Error loading temperature data. It might be corrupted.';
                // localStorage.removeItem('forcast'); // Optionally clear corrupted data
                // localStorage.removeItem('cityCoord');
            }
        } else {
            if (messageDiv) messageDiv.textContent = 'No temperature data found. Please go back to the main page and fetch weather first.';
            if (tempResultDiv) tempResultDiv.innerHTML = '<p class="text-orange-500 italic">No temperature data available. Please fetch data from the <a href="index.html" class="underline text-[#B9FF66]">main page</a>.</p>';
        }
        });
}

//rain page
if(window.location.pathname.includes('rain.html')){
    document.addEventListener('DOMContentLoaded', () =>{
        //getting localstorage
        const storedForecastString = localStorage.getItem('forcast') 
        const storedCityCoordString = localStorage.getItem('cityCoord') 

        //DOM Variables
        const rainResult=  document.getElementById('rainResult')
        const messageDiv=  document.getElementById('messageRain')
        const messageRainSpan  = document.getElementById('messageRainSpan');
        const rainAmountSpan = document.getElementById('rainAmountSpan')
        const rainProbSpan = document.getElementById('rainProbSpan')
        const precipitationSpan = document.getElementById('precipitationSpan')
        const humiditySpan = document.getElementById('humiditySpan')
        
        //checks the localstorage data
        if(storedForecastString,storedCityCoordString){
            try{
                const forcast = JSON.parse(storedForecastString);
                const cityCoord = JSON.parse(storedCityCoordString);

                const currentTime1 = forcast.current_weather.time.slice(0,13) + ":00";
                const indx = forcast.hourly.time.indexOf(currentTime1);

                //display the data in rain.html page
                messageRainSpan.innerText = ' for '+ cityCoord.name +', '+cityCoord.country;
                rainAmountSpan.innerText = ': '+ forcast.hourly.rain[indx] + "mm";
                rainProbSpan.innerText = ': '+ forcast.hourly.precipitation_probability[indx] + "%";
                precipitationSpan.innerText = ': '+ forcast.hourly.precipitation[indx] + "mm";
                humiditySpan.innerText = ': '+ forcast.hourly.relative_humidity_2m[indx] + "%";

            }catch(err){
                console.error('No rain data found.',err);
            
            
        }
        }else{
            if (messageDiv) messageDiv.textContent = 'No rain data found. Please go back to the main page and fetch weather first.';
            if (rainResult) rainResult.innerHTML = '<p class="text-orange-500 italic">No rain data available. Please fetch data from the <a href="index.html" class="underline text-white">main page</a>.</p>';
            
        }
        })
}



//wind page
if(window.location.pathname.includes('wind.html')){
    document.addEventListener('DOMContentLoaded',()=>{
        
        //getting localstorage
        const storedForecastString = localStorage.getItem('forcast') ;
        const storedCityCoordString = localStorage.getItem('cityCoord');
        
        //DOM page
        const windResult = document.getElementById('windResult');
        const messageWind = document.getElementById('messageWind');
        const messageWindSpan = document.getElementById('messageWindSpan');
        const windSpeedSpan = document.getElementById('windSpeedSpan');
        const windDirectionSpan = document.getElementById('windDirectionSpan');

        //checks the localstorage data
        if(storedForecastString && storedCityCoordString) {
            try {
                const forcast = JSON.parse(storedForecastString);
                const cityCoord = JSON.parse(storedCityCoordString);

                //display the data in rain.html page
                messageWindSpan.innerText = ' for '+ cityCoord.name +', '+cityCoord.country;
                windSpeedSpan.innerText = ": " + (forcast.current_weather.windspeed*3.6).toFixed(1) +"km/hr";
                windDirectionSpan.innerText = ": " + getWindDirection(forcast.current_weather.winddirection);

                

            } catch (error) {
                if(messageWind) messageWind.textContent = 'No wind data found. Please go back to the main page and fetch weather first.';
                console.error("No wind data.",error)
            }
        }else{
            if (messageWind) messageWind.textContent = 'No wind data found. Please go back to the main page and fetch weather first.';
            if (windResult) windResult.innerHTML = '<p class="text-orange-500 italic">No rain data available. Please fetch data from the <a href="index.html" class="underline text-white">main page</a>.</p>';
            
        }
        })
}

function getWindDirection(degree) {
    const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}


if(window.location.pathname.includes('aqi.html')){
    document.addEventListener('DOMContentLoaded',()=>{

        //getting localstorage
        const storedAqiString = localStorage.getItem('aqiData') ;
        const storedCityCoordString = localStorage.getItem('cityCoord');

        //DOM page
        const aqiResult = document.getElementById('aqiResult');
        const messageAqi = document.getElementById('messageAqi');
        const messageAqiSpan = document.getElementById('messageAqiSpan');
        const pm25Span = document.getElementById('pm25Span');
        const pm10Span = document.getElementById('pm10Span');
        const aqiDesc = document.getElementById('aqiDesc');

        //checks the localstorage data
        if(storedAqiString && storedCityCoordString){
            
            try {
                const forcast = JSON.parse(localStorage.getItem('forcast'));
                const aqiData = JSON.parse(storedAqiString);
                
                const cityCoord = JSON.parse(storedCityCoordString);
                
                messageAqiSpan.innerText =  ' for '+ cityCoord.name +', '+cityCoord.country;
                pm25Span.innerText = ": " + aqiData;

                const currentTime1 = (forcast.current_weather.time).slice(0,13) + ":00";
                const indx = aqiData.hourly.time.indexOf(currentTime1);
                if(indx != -1){
                const pm25 = aqiData.hourly.pm2_5[indx]

                //display the data in rain.html page
                pm25Span.innerText = ": " + pm25 + " µg/m³";
                pm10Span.innerText = ": " + aqiData.hourly.pm10[indx] + " µg/m³";

                //checks the quality on the pm25 value
                if(pm25<30)aqiDesc.innerText = "Air quality is Good ✅";
                else if(pm25<60)aqiDesc.innerText ="Moderate air quality ⚠️";
                else aqiDesc.innerText = "Unhealthy air ❗";
                }else{
                        //if data is not available
                        pm25Span.innerText = "N/A";
                        pm10Span.innerText = "N/A";
                        aqiDesc.innerText = "AQI data not found.";
                }
            } catch (error) {
                if(messageAqi) messageAqi.textContent = 'No aqi data found. Please go back to the main page and fetch weather first.';
                console.error(error);
            }
        }else{
            if (messageAqi) messageAqi.textContent = 'No aqi data found. Please go back to the main page and fetch weather first.';
            if (aqiResult) aqiResult.innerHTML = '<p class="text-orange-500 italic">No rain data available. Please fetch data from the <a href="index.html" class="underline text-white">main page</a>.</p>';
            
        }
        })
}
