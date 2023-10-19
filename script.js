const apiKey = '0fb74be97943e026a6de154b85d73043';
const baseApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('searchHistory');
const currentWeather = document.getElementById('city-info');
const forecast = document.getElementById('forecast');
const forecastDays = forecast.querySelectorAll('.forecast-day');
const asideContent = document.getElementById('asideContent');
const toggleAsideBtn = document.getElementById('toggleAsideBtn');
const clearSearchesBtn = document.getElementById('clearSearches');

// retrieves stored cities from local storage / uses an empty array if nothing exists
let cities = JSON.parse(localStorage.getItem('cities')) || [];

// updates the list of searched cities in the UI (updateSearchHistory())
function updateSearchHistory() {
  searchHistory.innerHTML = '';
  cities.forEach(city => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = city;
    // click listener to fetch weather data for the clicked city from user's history
    historyItem.addEventListener('click', () => {
      getWeatherData(city);
    });
    searchHistory.appendChild(historyItem);
  });
}

// fetches weather data for chosen city using an the Weather Forecast (getWeatherData())
async function getWeatherData(city) {
  const apiUrl = `${baseApiUrl}?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    updateUI(data);  // updates the UI with the fetched weather data
    // if the city isn't already in our history, we add it and update the local storage
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem('cities', JSON.stringify(cities));
      updateSearchHistory();
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

// updates the main content area with the provided weather data
function updateUI(data) {
  console.log(forecastDays.length);  // 5 days (8dp)
  console.log(data.list.length);     // 40 = 5-day forecast

  // displays the current weather details for the selected city
  const current = data.list[0];
  const cityName = data.city.name;
  // converts the temperature from Kelvin to Fahrenheit
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

  // for loop that iterates and displays the next 5 days of forecast
  for (let i = 1; i <= 5; i++) {
    const dailyForecast = data.list[(i - 1) * 8 + 7];

    if (dailyForecast) {
      const forecastDate = new Date(dailyForecast.dt_txt);
      const formattedDate = `${forecastDate.getMonth() + 1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}`;
      const dayTemperature = Math.round(((dailyForecast.main.temp - 273.15) * 9/5) + 32);
      const dayWindSpeed = dailyForecast.wind.speed;
      const dayHumidity = dailyForecast.main.humidity;
      const dayIconUrl = `https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}.png`;

      forecastDays[i - 1].innerHTML = `
        <div class="forecast-item">
          <h4>${formattedDate}</h4>
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

// event listener for the form submission to fetch data for the input city
cityForm.addEventListener('submit', event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city !== '') {
    getWeatherData(city);
  }
  cityInput.value = '';
});

// clears the search history on click and removes the stored data
clearSearchesBtn.addEventListener('click', () => {
    cities = [];
    localStorage.removeItem('cities');
    updateSearchHistory();
});

// displays the stored search history
updateSearchHistory();

// adjusts the display of the aside section based on the window size (portable devices / phone)
window.addEventListener('resize', function() {
  if (window.innerWidth <= 768) {
      asideContent.style.display = 'none';
  } else {
      asideContent.style.display = 'block';
  }
});

// toggles the display of the aside section on button click
toggleAsideBtn.addEventListener('click', function() {
  if (asideContent.style.display === 'none' || getComputedStyle(asideContent).display === 'none') {
      asideContent.style.display = 'block';
      document.body.classList.remove('aside-closed');
  } else {
      asideContent.style.display = 'none';
      document.body.classList.add('aside-closed');
  }
});

