import { useEffect, useState } from 'react'
type WeatherResponse = {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
  }
}

function App() {
  const [city, setCity] = useState('Rotterdam')
  const [temperature, setTemperature] = useState(0)
  const [wind, setWind] = useState(0)
  const [humidity, setHumidity] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cities = {
    Rotterdam: { latitude: 51.92, longitude: 4.48 },
    Amsterdam: { latitude: 52.37, longitude: 4.90 },
    Utrecht: { latitude: 52.09, longitude: 5.12 },
    'Den Haag': { latitude: 52.07, longitude: 4.30 },
  }

  useEffect(() => {
    const getWeather = async () => {
      setLoading(true)
      setError('')

      const location = cities[city as keyof typeof cities]

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
      )
if (!response.ok) {
  setError('Er ging iets mis bij het ophalen van het weer.')
  setLoading(false)
  return
}
     const data: WeatherResponse = await response.json()

      setTemperature(data.current.temperature_2m)
      setWind(data.current.wind_speed_10m)
      setHumidity(data.current.relative_humidity_2m)

      setLoading(false)
    }

    getWeather()
  }, [city])

  return (
    <div>
      <h1>Weerapp</h1>

      <select value={city} onChange={(e) => setCity(e.target.value)}>
        <option>Rotterdam</option>
        <option>Amsterdam</option>
        <option>Utrecht</option>
        <option>Den Haag</option>
      </select>

    {loading ? (
  <p>Weer wordt geladen...</p>
) : error ? (
  <p>{error}</p>
) : (
        <div>
          <h2>{city}</h2>

          <p>Temperatuur: {temperature} °C</p>
          <p>Wind: {wind} km/u</p>
          <p>Luchtvochtigheid: {humidity} %</p>
        </div>
      )}
    </div>
  )
}

export default App