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
    userPref.compare = event.target.checked;
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

    let data;
    
    // Check if data already exists
    if (localStorage.getItem(cityName)) {
        data = JSON.parse(localStorage.getItem(cityName));

    } else {
        // Fetch the weather data of the city
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=39b9071f8eb967a7f7549a4f9377bf50`);
        data = await response.json();

        // Save weather data in local storage
        saveWeatherData(data, cityName);
    }

    // Display view to user
    const view = createView(data);
    displayWeather(view, weekView);
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

function saveWeatherData(data, cityName) {
    localStorage.setItem(cityName, JSON.stringify(data));
}

function createView(data){
    const dayCards = [];
    const cityInfo = `${data.city.name}, ${data.city.country}`;
    console.log(data.list);
    for (let i = 0; i < data.list.length; i++){
        const currentDate = data.list[i].dt_txt.split(" ")[0];

        let iconType = data.list[i].weather[0].icon;
        let date = new Date(currentDate);
        
        let avgDayTemp = 0;
        for (let j = i; j < data.list.length - 1; j++) {
            const nextDate = data.list[j + 1].dt_txt.split(" ")[0];
            
            avgDayTemp += data.list[j].main.temp;
            if (currentDate != nextDate) {
                avgDayTemp = Math.floor(avgDayTemp / (j - i));

                date = date.toLocaleDateString("en-Gb",{"weekday": "short", "day": "2-digit"});
                dayCards.push(createDayCard(date, iconType, avgDayTemp));
                i = j;
                break;
            }
        }
    }

    return createMultiDayCardDisplay(dayCards, cityInfo);
}

function createDayCard(date, iconType, temparture) {
    const article = document.createElement("article");
    article.classList.add("weather-day");

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

function createMultiDayCardDisplay(dayCards, cityInfo) {
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