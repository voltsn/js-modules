import {displayWeather, createView} from "./ui.js";

const submitBtn = document.querySelector("#input-submit");
const inputField = document.querySelector("#city-input");
const compareOption = document.querySelector("#compare");
const weekView = document.querySelector(".weather-container");
const api_key = import.meta.env.VITE_API_KEY;

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
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${api_key}`);
        data = await response.json();

        // Save weather data in local storage
        saveWeatherData(data, cityName);
    }

    // Display view to user
    const view = createView(data);
    displayWeather(view, weekView, userPref.compare);
}


function saveWeatherData(data, cityName) {
    localStorage.setItem(cityName, JSON.stringify(data));
}