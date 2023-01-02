const submitBtn = document.querySelector("#input-submit");
const inputField = document.querySelector("#city-input");
const compareOption = document.querySelector("#compare");
const weekView = document.querySelector(".weather-container");

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
    if (e.code === "Enter" && inputField.value !== ""){
        handleSubmit();
    }
})

compareOption.addEventListener("change", (event) => {
   userPref.compare = userPref.compare ? false : true;

   localStorage.setItem("userPref", JSON.stringify(userPref));
});

async function handleSubmit() {
    const cityName = inputField.value;
    if (cityName === ""){
        return;
    }

    userPref.latestCity = inputField.value;
    localStorage.setItem("userPref", JSON.stringify(userPref));

    // Clear input field
    inputField.value = "";
    
    // Check if data already exists
    if (localStorage.getItem("weatherData")) {
        const localData = JSON.parse(localStorage.getItem("weatherData"));
        createView(localData);
        console.log("hi");
        return;
    }

    // Fetch the weather data of the city.
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=39b9071f8eb967a7f7549a4f9377bf50`);
    const data = await response.json();

    // Saves weather data in local storage.
    saveWeatherData(data);

    // Display view to user
    // createView(cityName);
}


// Displays the weather prediction of the next 5 days in the ui.
// If the compare option is disabled the container is emptied before
// adding the new view.
function displayWeather(multiDayView, weekView) {
    if (!userPref.compare){
        weekView.innerHTML = "";
    }
    
    weekView.appendChild(multiDayView);
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

function saveWeatherData(data) {
    localStorage.setItem("weatherData", JSON.stringify(data));
}

function createView(data){
    dayCards = [];
    console.log(data.list);
    // dayTemps = [];
    // for (let i = 1; i < data.list.length; i++){
        // let avgTemp = getAvgDayTemp(city, i);
        // let iconType = weather[city][i][0].weather[0].icon;

        // let date = new Date(weather[city][i][0].dt_txt.split(" ")[0]);
        // date = date.toLocaleDateString("en-Gb",{"weekday": "short", "day": "2-digit"});

        // let dayCard = createDayCard(date, iconType, avgTemp, city, i);
        // dayCards.push(dayCard);
    // }

    // const multiDayCardView = createMultiDayCardView(dayCards, city);
    // return multiDayCardView;
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

function createMultiDayCardView(dayCards, cityInfo) {
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
