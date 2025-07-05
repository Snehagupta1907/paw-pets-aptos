export default async function handler(req, res) {
    const query = req.query;
    const { location } = query;
    
    // Mock weather response for demo purposes
    const mockWeatherData = {
        name: location || "India",
        weather: [
            {
                main: "Clear",
                description: "clear sky"
            }
        ],
        clouds: {
            all: 20
        },
        rain: false,
        main: {
            temp: 22,
            humidity: 65
        }
    };

    res.status(200).json(mockWeatherData);
}