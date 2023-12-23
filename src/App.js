import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS
import './App.css';
import logo from './assets/WeatherAppProLogo.png';

function Map({ position }) {
  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>A pretty CSS popup.<br />Easily customizable.</Popup>
      </Marker>
    </MapContainer>
  );
}

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const apiKey = '3e758ebc4eaf4f70c053fafeb1871e14';

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      );
      setWeatherData(response.data);
      setCity('');
      setShowMiniMap(true);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    }
  };

  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}.png`;
  };

  const getLocationEmoji = () => '📍';
  const getTemperatureEmoji = () => '🌡️';
  const getTimeEmoji = () => '🕒';

  const getHourlyForecastData = useCallback(async () => {
    try {
      if (weatherData) {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&exclude=current,minutely,daily,alerts&appid=${apiKey}`
        );

        const hourlyData = response.data.hourly.slice(0, 8);

        const hourlyForecastData = hourlyData.map((data) => {
          return {
            time: new Date(data.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: data.temp,
            icon: data.weather[0].icon,
          };
        });

        setHourlyForecast(hourlyForecastData);
      }
    } catch (error) {
      console.error('Error fetching hourly forecast data:', error);
    }
  }, [weatherData, apiKey]);

  const getMiniMapData = useCallback(async () => {
    // You can perform additional logic to get data for the mini-map here if necessary
  }, []);

  useEffect(() => {
    getHourlyForecastData();
  }, [getHourlyForecastData]);

  useEffect(() => {
    if (showMiniMap && weatherData) {
      getMiniMapData();
    }
  }, [showMiniMap, weatherData, getMiniMapData]);

  useEffect(() => {
    // Initial search on component mount
    handleSearch();
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" />
        </div>
        <div className="welcome-text">
          <h1>Bienvenue sur Weather App Pro</h1>
          <p>Découvrez la météo de votre ville</p>
        </div>
      </header>

      <div className="search-container">
        <input
          type="text"
          placeholder="Entrez le nom de votre ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Rechercher</button>
      </div>

      {weatherData && (
        <div className="current-weather">
          <h2>{weatherData.name}</h2>
          <span role="img" aria-label="weather-icon">
            <img
              src={getWeatherIconUrl(weatherData.weather[0].icon)}
              alt="Weather Icon"
            />
          </span>
          <p>Date et heure : {getTimeEmoji()} {new Date(weatherData.dt * 1000).toLocaleString()}</p>
          <p>{getTemperatureEmoji()} Température : {weatherData.main.temp} °C</p>
          <p>Fuseau horaire : {weatherData.timezone}</p>
          <p>Météo : {weatherData.weather[0].description}</p>
          <p>
            {getLocationEmoji()} Latitude : {weatherData.coord.lat} {getLocationEmoji()} Longitude : {weatherData.coord.lon}
          </p>
          {weatherData.alerts && (
            <div>
              <h3>Alertes météo</h3>
              <p>{weatherData.alerts[0].description}</p>
            </div>
          )}
        </div>
      )}

      {hourlyForecast.length > 0 && (
        <div className="hourly-forecast-container">
          <h2 style={{ textAlign: 'center' }}>PRÉVISIONS HORAIRES</h2>
          <div className="hourly-forecast-items">
            {hourlyForecast.map((hour, index) => (
              <div key={index} className="hourly-forecast-item">
                <h3>{hour.time}</h3>
                <img src={getWeatherIconUrl(hour.icon)} alt={`Weather Icon ${index}`} />
                <p>{hour.temperature} °C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMiniMap && weatherData && (
        <div className="mini-map-container">
          <h2>Mini Carte</h2>
          <Map position={[weatherData.coord.lat, weatherData.coord.lon]} />
        </div>
      )}
    </div>
  );
}

export default App;

