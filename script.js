const apiKey = '0fb74be97943e026a6de154b85d73043';
const baseApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('searchHistory');
const currentWeather = document.getElementById('city-info');
const forecast = document.getElementById('forecast');
const forecastDays = forecast.querySelectorAll('.forecast-day');

// references the clearSearches button
const clearSearchesBtn = document.getElementById('clearSearches');

let cities = JSON.parse(localStorage.getItem('cities')) || [];

function updateSearchHistory() {
  searchHistory.innerHTML = '';
  cities.forEach(city => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = city;
    historyItem.addEventListener('click', () => {
      getWeatherData(city);
    });
    searchHistory.appendChild(historyItem);
  });
}

async function getWeatherData(city) {
  const apiUrl = `${baseApiUrl}?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    updateUI(data);
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem('cities', JSON.stringify(cities));
      updateSearchHistory();
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function updateUI(data) {
  console.log(forecastDays.length);  // 5
  console.log(data.list.length);     // 40 = 5-day forecast
  // Displaying the current weather details
  const current = data.list[0];
  const cityName = data.city.name;
  // Convert temperature from Kelvin to Fahrenheit
  const temperature = Math.round(((current.main.temp - 273.15) * 9/5) + 32);
  const windSpeed = current.wind.speed;
  const humidity = current.main.humidity;
  const currentIconUrl = `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`;

  currentWeather.innerHTML = `
    <h2>${cityName}</h2>
    <img src="${currentIconUrl}" alt="${current.weather[0].description}">
    <p>Temperature: ${temperature}°F</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
    <p>Humidity: ${humidity}%</p>
  `;

  // Displaying the next 5 days of forecast
  for (let i = 1; i <= 5; i++) {
    const dailyForecast = data.list[(i - 1) * 8 + 7];

    if (dailyForecast) {
      // Just in case... 
      const dayTemperature = Math.round(((dailyForecast.main.temp - 273.15) * 9/5) + 32);
        const dayWindSpeed = dailyForecast.wind.speed;
        const dayHumidity = dailyForecast.main.humidity;
        const dayIconUrl = `https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}.png`;

        forecastDays[i - 1].innerHTML = `
            <div class="forecast-item">
                <h4>Day ${i}</h4>
                <img src="${dayIconUrl}" alt="${dailyForecast.weather[0].description}">
                <p>Temperature: ${dayTemperature}°F</p>
                <p>Wind Speed: ${dayWindSpeed} m/s</p>
                <p>Humidity: ${dayHumidity}%</p>
            </div>
        `;
    } else {
        console.error(`No forecast data found for day ${i}`);
    }
}
}

cityForm.addEventListener('submit', event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city !== '') {
    getWeatherData(city);
  }
  cityInput.value = '';
});

clearSearchesBtn.addEventListener('click', () => {
    cities = [];
    localStorage.removeItem('cities');
    updateSearchHistory();
});

updateSearchHistory();








