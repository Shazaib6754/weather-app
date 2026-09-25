import { useEffect, useState } from "react";
// je mist de import van de CSS file, zonder deze import werkt de styling niet. Voeg de volgende regel toe aan het begin van je bestand:
 import "./App.css";

// Dit type klopt met de API, maar is erg minimaal. Plak de fetch-URL eens in je browser en bekijk het volledige antwoord:
// de API geeft ook "time" dat is een moment van meting en "current_units" terug. Modelleer wat je nodig hebt.
// Maak daarnaast eigen types voor je app, bijv "Coordinates", "City" en "CurrentWeather" (met nette namen zoals "temperature"),
// en schrijf een kleine functie die het API-antwoord omzet naar jouw "CurrentWeather". Zo is je UI niet afhankelijk van de API-namen.
type WeatherResponse = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    time: string;
    weather_code: number;
  };
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type CurrentWeather = {
  temperature: number;
  humidity: number;
  wind: number;
};

//Eerste render toont de default stad (Rotterdam) maar loading start als false en nummers starten als 0 dus voor eerste fetch zie je en error message.
// je kunt dit oplossen door de default state van loading op true te zetten en de default state van error op een lege string. Dan wordt de eerste fetch uitgevoerd en wordt de error message pas getoond als er daadwerkelijk een fout optreedt.

type CityName = "Rotterdam" | "Amsterdam" | "Utrecht" | "Den Haag";

const cities = {
  Rotterdam: { latitude: 51.92, longitude: 4.48 },
  Amsterdam: { latitude: 52.37, longitude: 4.9 },
  Utrecht: { latitude: 52.09, longitude: 5.12 },
  "Den Haag": { latitude: 52.07, longitude: 4.3 },
};

function App() {
  // "city" is nu een gewoone "string". Daardoor heb je verderop een cast nodig ("city as keyof typeof cities").
  // Type "city" zo dat alleen geldige steden mogelijk zijn, bijv. met een union type "CityName".
  const [city, setCity] = useState<CityName>("Rotterdam");

  // Drie lose states met startwaarde 0 dus nu betekent "0" zowel "nog geen data" als "het is 0 °C".
  // Gebruik liever een state voor het weer, bijv. "useState<CurrentWeather | null>(null)".
  const [temperature, setTemperature] = useState(0);
  const [wind, setWind] = useState(0);
  const [humidity, setHumidity] = useState(0);

  // "loading", "error" en de weerdata zijn losse variabelen, dus onmogelijke combinaties kunnen bestaan (bijv. loading en error).
  // google op "discriminated union" in TypeScript. DIt is een state met een "status"-veld ('loading' | 'success' | 'error').
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dit object wordt bij elke render opnieuw aangemaakt en geeft een ESLint-waarschuwing (draai "npm run lint").
  // Zet de stedenlijst buiten het component, of in een eigen bestand (bijv. "src/cities.ts").
 

  useEffect(() => {
    // Het ophalen van data zit nu midden in je component. Verplaats de fetch logica naar een aparte functie,
    // bijv. "fetchWeather(coordinates)" in "src/api/weather.ts", die een "Promise<CurrentWeather>" teruggeeft.
    const getWeather = async () => {
      setLoading(true);
      setError("");

      const location = cities[city as keyof typeof cities];

      // Wissel eens snel een paar keer van stad. Als een eerder verzoek later terugkomt dan het laatste,
      // toont de kaart het weer van de verkeerde stad. Zoek op "useEffect cleanup" en "AbortController".

      // Deze lange URL is lastig te lezen en aan te passen. Kijk eens naar "URLSearchParams".

      // try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m",
      );
      //    if (!response.ok) {
      //        throw new Error("Er ging iets mis bij het ophalen van het weer.");
      //      }
      // Goed dat je "response.ok" controleert!
      if (!response.ok) {
        setError("Er ging iets mis bij het ophalen van het weer.");
        setLoading(false);
        return;
      }

      const data: WeatherResponse = await response.json();

      setTemperature(data.current.temperature_2m);
      setWind(data.current.wind_speed_10m);
      setHumidity(data.current.relative_humidity_2m);

      // setError(
      //     err instanceof Error
      //       ? err.message
      //       : "Er is een onverwachte fout opgetreden."
      //   );
      // } finally {
      //   Wordt altijd uitgevoerd en voorkomt dat de app oneindig blijft laden
      //   setLoading(false);
      // }
      // Test dit door je wifi uit te zetten en een stad te kiezen: nu blijft de app voor altijd "laden".
      setLoading(false);
    };

    getWeather();
  }, [city]);

  return (
    <div>
      <h1>Weerapp</h1>

      {/* De steden staan hier nog een keer met de hand. Als je een stad toevoegt, moet je nu twee plekken aanpassen.
          Genereer de opties uit je stedenlijst (bijv. met "Object.keys(cities).map(...)").
          Voeg ook een <label> toe voor toegankelijkheid, en overweeg een los "CitySelect"-component. */}
      <select value={city} onChange={(e) => setCity(e.target.value)}>
        <option>Rotterdam</option>
        <option>Amsterdam</option>
        <option>Utrecht</option>
        <option>Den Haag</option>
      </select>

      {/* Geneste ternaries (? : ? :) worden snel onleesbaar. Met een state met een "status" veld kun je dit netter oplossen. */}
      {loading ? (
        <p>Weer wordt geladen...</p>
      ) : error ? (
        // Geef de foutmelding een eigen stijl, zodat hij duidelijk anders oogt dan gewone tekst. Klein ding maar maakt de app prettiger in gebruik.
        <p>{error}</p>
      ) : (
        // Maak hier een los "WeatherCard" component van dat de weerdata als prop krijgt.
        // Kleine details die de app prettiger maken:
        // - rond waarden af (bijv. "Math.round")
        // - toon het tijdstip van de meting ("current.time")
        // - optioneel: weersomschrijving/icoon ("weather_code") of gevoelstemperatuur ("apparent_temperature"), beide in dezelfde API, Ik hou van mooie icoontjes en een korte tekst zoals "bewolkt" of "regen". Zie https://open-meteo.com/en/docs#api_form voor de codes en maak mij blij met een mooie weergave van het weer
        <div>
          <h2>{city}</h2>

          <p>Temperatuur: {temperature} °C</p>
          <p>Wind: {wind} km/u</p>
          <p>Luchtvochtigheid: {humidity} %</p>
        </div>
      )}
    </div>
  );
}

export default App;

// Algemene punten buiten dit bestand:
// - README.md is nog de standaardtekst van Vite. De opdracht vraagt om hoe start je de app, welke keuzes heb je gemaakt,
//   wat zou je anders doen met meer tijd, en waar liep je tegenaan. Dit zou je in een paar alinea's kunnen beschrijven in je README.md.
// - Ruim ongebruikte template-bestanden op (src/assets/*, de template-CSS in index.css). De map "dist/" hoort niet in je inlevering. Daardoor is je repo nu onnodig groot en onoverzichtelijk.
// - index.html: "lang="en"" en de titel "weather-app" passen niet bij een Nederlandse app maar dat is waarschijnlijk mijn fout xD. Pas dit aan naar "lang="nl"" en een passende titel.
// - Draai "npm run lint" voordat je inlevert en los de waarschuwingen op.
// - Maak kleine commits per verbetering, zodat ik je aanpak kan makkelijker volgen.
