export default async function fetchWeather({ query: { lat, lng } }, res) {
    const { WEATHER_KEY } = process.env;

    let weather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_KEY}&units=metric`
    ).then((res) => res.json());

    res.status(200).json({ message: weather });
}