function displayWeather(multiDayView, weekView, toCompare) {
    if (!toCompare){
        weekView.innerHTML = "";
    }
    
    weekView.appendChild(multiDayView);
}

function createView(data){
    const dayCards = [];
    const cityInfo = `${data.city.name}, ${data.city.country}`;

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

function createDayCard(date, iconType, temparture) {
    const article = document.createElement("article");
    article.classList.add("weather-day");

    const heading = document.createElement("h3");
    heading.classList.add("weather-day__heading");
    heading.appendChild(document.createTextNode(date));

    const icon = document.createElement("img");
    icon.src = `./icons/${iconType}.png`;
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

export {displayWeather, createView};