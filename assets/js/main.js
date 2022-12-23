const submitBtn = document.querySelector("#input-submit");
const inputField = document.querySelector("#city-input");
const compareOption = document.querySelector("#compare");
const multiDayView = document.querySelector(".weather-container");

// An object where a key is the name of the city, and its value
// is an array of objects where each object contains weather data 
// for a given day, index 0 is today, index 1 tommorow...
const weather = {};
const userPref = {compare: false, latestCity:""};

window.addEventListener("DOMContentLoaded", () => {
    const preferences = JSON.parse(localStorage.getItem("userPref"));
    if (!preferences){
        return;
    }

    compareOption.checked = preferences.compare;
    inputField.value = preferences.latestCity;
})

submitBtn.addEventListener("click", handleSubmit);
inputField.addEventListener("keypress", (e) => {
    if (e.code === "Enter"){
        handleSubmit();
    }
})

compareOption.addEventListener("change", (event) => {
   userPref.compare = userPref.compare ? false : true;

   localStorage.setItem("userPref", JSON.stringify(userPref));
});

async function handleSubmit() {
    const cityName = inputField.value;

    userPref.latestCity = inputField.value;
    localStorage.setItem("userPref", JSON.stringify(userPref));

    // Clear input field
    inputField.value = "";
    
    // Check if data already exists
    if (localStorage.getItem("weatherData")) {
        const localData = JSON.parse(localStorage.getItem("weatherData"));
        for (let city of localData){
            
            if (city.city.name === cityName){
                console.log("Already exists");
                formatData(city);
                createView(cityName);
                return;
            }
        }
    }

    // Fetch the weather data of the city.
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=39b9071f8eb967a7f7549a4f9377bf50`);
    const data = await response.json();


    // Saves weather data in local storage.
    saveWeatherData(data);
    
    // format the data to make it easier to work with
    formatData(data);

    // Display view to user
    createView(cityName);
}

function formatData(data){
    const temps = [];
    for (let i = 0; i < data.list.length - 1; i++){
        let date = data.list[i].dt_txt.split(" ")[0];
        const arr = [];
        for (let j = i; j < data.list.length; j++){            
            let nextDate =  data.list[j].dt_txt.split(" ")[0];
            if (nextDate !== date){
                i = j;
                break;
            }
            arr.push(data.list[j]);
        }
        temps.push(arr);
    }
    weather[data.city.name] = temps;
}

// Checks local storage for existing data returns a json object if found
// otherwise null
function loadData() {
    if (localStorage.getItem("weatherData")) {
        const localData = JSON.parse(localStorage.getItem("weatherData"));
        for (let city of localData){
            
            if (city.city.name === cityName){
                console.log("Already exists");
                formatData(city);
                createView(cityName);
                return;
            }
        }
    }
}

function saveWeatherData(data, latestCity) {
    //  Sets localData to an empty array if the localStorage is empty
    const localData = JSON.parse(localStorage.getItem("agify")) || [];
    localData.push(data);
    localStorage.setItem("weatherData", JSON.stringify(localData));
}

function createView(city){
    dayCards = [];
    for (let i = 0; i < weather[city].length - 3; i++){
        let avgTemp = getAvgDayTemp(city, i);
        let iconType = weather[city][i][0].weather[0].icon;

        let date = new Date(weather[city][i][0].dt_txt.split(" ")[0]);
        date = date.toLocaleDateString("en-Gb",{"weekday": "short", "day": "2-digit"});

        let dayCard = createDayCard(date, iconType, avgTemp, city, i);
        dayCards.push(dayCard);
    }

    const multiDayDisplay = createMultiDayDisplay(dayCards, city);
    if (userPref.preferences){
        multiDayView.appendChild(multiDayDisplay);
    }else{
        multiDayView.removeChild(multiDayView.lastChild);
        multiDayView.appendChild(multiDayDisplay);
    }
}

function createDayCard(date, iconType, temparture, city, dayIndex) {
    const article = document.createElement("article");
    article.classList.add("weather-day");
    article.dataset.index = dayIndex;
    article.dataset.city = city;

    const heading = document.createElement("h3");
    heading.classList.add("weather-day__heading");
    heading.appendChild(document.createTextNode(date));

    const icon = document.createElement("img");
    icon.src = `assets/icons/${iconType}.png`;
    icon.alt = "weather icon";
    icon.classList.add("wheater-day__icon");

    const temp = document.createElement("p");
    temp.classList.add("weather-day__temp");
    temp.appendChild(document.createTextNode(`${temparture}°C`))

    article.appendChild(heading);
    article.appendChild(icon);
    article.appendChild(temp);

    return article;
}

function createMultiDayDisplay(dayCards, cityInfo) {
    const container = document.createElement("div");
    container.classList.add("weather-multi-day-display");
    
    const city = document.createElement("div");
    city.classList.add("weather-city");
    city.appendChild(document.createTextNode(cityInfo));

    container.appendChild(city);
    for(let dayCard of dayCards) {
        container.appendChild(dayCard);
    }

    return container;
}

function getAvgDayTemp(city, day) {
    const temps = weather[city][day];
    let avg = 0;
    for (let t of temps){
        avg += t.main.temp;
    }

    return Math.floor(avg / temps.length);
}
