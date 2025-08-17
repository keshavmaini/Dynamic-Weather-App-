// --- Configuration & API Key ---
const apiKey = "2389348877584f9aa3885504251708";
const apiUrl = "http://api.weatherapi.com/v1/current.json";

// --- DOM Element Selections ---
const searchInput = document.getElementById("location-input");
const searchButton = document.getElementById("search-button");
const cityNameElement = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon"); // Selected as <i> element
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const locationSuggestions = document.getElementById("location-suggestions");
const backgroundWrapper = document.querySelector(".background-wrapper");

// --- Weather Condition to Icon Class Mapping & Background Class Mapping ---
// Based on WeatherAPI condition text (e.g., data.current.condition.text)
const weatherMap = {
    "Clear": { icon: "wi-day-sunny", bgClass: "clear-bg" },
    "Sunny": { icon: "wi-day-sunny", bgClass: "sunny-bg" },
    "Partly cloudy": { icon: "wi-day-cloudy", bgClass: "partly-cloudy-bg" },
    "Cloudy": { icon: "wi-cloudy", bgClass: "cloudy-bg" },
    "Overcast": { icon: "wi-cloudy-gusts", bgClass: "overcast-bg" },
    "Mist": { icon: "wi-fog", bgClass: "mist-fog-bg" },
    "Fog": { icon: "wi-fog", bgClass: "mist-fog-bg" },
    "Light rain": { icon: "wi-day-sprinkle", bgClass: "rain-bg" },
    "Moderate rain": { icon: "wi-rain", bgClass: "rain-bg rain-animation" },
    "Heavy rain": { icon: "wi-showers", bgClass: "rain-bg rain-animation" },
    "Patchy light rain with thunder": { icon: "wi-storm-showers", bgClass: "thunderstorm-bg" },
    "Thundery outbreaks possible": { icon: "wi-thunderstorm", bgClass: "thunderstorm-bg" },
    "Torrential rain shower": { icon: "wi-thunderstorm", bgClass: "thunderstorm-bg rain-animation" },
    "Light snow": { icon: "wi-day-snow", bgClass: "snow-bg" },
    "Moderate snow": { icon: "wi-snow", bgClass: "snow-bg" },
    "Heavy snow": { icon: "wi-snow-wind", bgClass: "snow-bg" },
    "Blizzard": { icon: "wi-snow-wind", bgClass: "snow-bg" },
    // You'll need to expand this mapping based on the full list of conditions from WeatherAPI
    // and the available Weather Icons classes (e.g., wi-night-clear, wi-day-sleet, etc.)
    "default": { icon: "wi-cloud", bgClass: "default-bg" } // Default icon and background
};

// --- Function to Fetch Weather Data ---
async function getWeatherData(location) {
    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}&q=${location}&aqi=yes`);
        const data = await response.json();
        if (response.ok) {
            displayWeatherData(data);
        } else {
            alert(data.error.message);
            document.getElementById('weather-info').style.display = 'none';
            updateVisuals("default"); // Revert to default visuals
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data. Please try again.");
        document.getElementById('weather-info').style.display = 'none';
        updateVisuals("default"); // Revert to default visuals
    }
}

// --- Function to Update Dynamic Visuals (Background & Icon) ---
function updateVisuals(conditionText) {
    // Clean previous background classes
    backgroundWrapper.className = 'background-wrapper';

    // Get mapped data, or use default if not found
    const mappedData = weatherMap[conditionText] || weatherMap["default"];

    // Update background class
    backgroundWrapper.classList.add(mappedData.bgClass);

    // Update weather icon class
    weatherIcon.className = 'wi'; // Reset to base class
    weatherIcon.classList.add(mappedData.icon); //
}

// --- Function to Display Weather Data ---
function displayWeatherData(data) {
    cityNameElement.textContent = data.location.name;
    temperatureElement.textContent = `Temperature: ${data.current.temp_c}°C`;
    descriptionElement.textContent = `Condition: ${data.current.condition.text}`;
    humidityElement.textContent = `Humidity: ${data.current.humidity}%`;
    windSpeedElement.textContent = `Wind Speed: ${data.current.wind_kph} km/h`;
    document.getElementById('weather-info').style.display = 'block';

    // Update background and icon based on current weather condition
    updateVisuals(data.current.condition.text);
}


// --- Function to Get Location Suggestions (using WeatherAPI's search endpoint) ---
async function getLocationSuggestions(query) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`);
        const data = await response.json();
        displayLocationSuggestions(data);
    } catch (error) {
        console.error("Error fetching location suggestions:", error);
    }
}

// --- Function to Display Location Suggestions ---
function displayLocationSuggestions(suggestions) {
    locationSuggestions.innerHTML = "";

    if (suggestions.length > 0) {
        const query = searchInput.value.trim().toLowerCase();

        suggestions.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            if (aName === query && bName !== query) {
                return -1;
            } else if (aName !== query && bName === query) {
                return 1;
            } else {
                return 0;
            }
        });

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = `${suggestion.name}, ${suggestion.region}, ${suggestion.country}`;
            suggestionItem.addEventListener("click", () => {
                searchInput.value = suggestion.name;
                locationSuggestions.innerHTML = "";
                getWeatherData(suggestion.name);
            });
            locationSuggestions.appendChild(suggestionItem);
        });
    } else {
        locationSuggestions.innerHTML = "<div class='suggestion-item'>No suggestions found.</div>";
    }
}

// --- Event Listeners ---
// Event listener for search button click
searchButton.addEventListener("click", () => {
    const location = searchInput.value.trim();
    if (location) {
        getWeatherData(location);
    } else {
        alert("Please enter a location.");
    }
});

// Event listener for input changes to provide suggestions
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (query.length > 2) {
        getLocationSuggestions(query);
    } else {
        locationSuggestions.innerHTML = "";
    }
});

// Optional: Initial call to display weather for a default city on page load
// getWeatherData("London");
