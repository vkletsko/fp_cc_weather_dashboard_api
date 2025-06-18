# Weather Dashboard API

A simple Node.js API that fetches weather data from OpenWeatherMap based on city name. Built with Express and Docker-ready for deployment (e.g., AWS Elastic Beanstalk).

## Features

- Fetch current weather by city name
- Secure API key handling using environment variables
- Dockerized for easy deployment

## Requirements

- Node.js
- Docker
- OpenWeatherMap API key

## Environment Variables

Create a `.env` file in the project root with:

```
OPENWEATHER_API_KEY=your_api_key_here
```

## Usage

### Local

```bash
npm install
npm start
```

Then open:

```
http://localhost:3000/api/weather?city=Kyiv
```

### Docker

Build and run:

```bash
docker build -t weather-api .
docker run -p 3000:3000 --env-file .env weather-api
```

### Elastic Beanstalk (Single Container Docker)

1. Install [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
2. Initialize:

```bash
eb init -p docker weather-api
```

3. Create environment:

```bash
eb create weather-env
```

4. Open in browser:

```bash
eb open
```

## API Endpoint

**GET** `/api/weather?city=CityName`

### Query Parameters

- `city` — Name of the city (required)

### Example

```
GET /api/weather?city=Kyiv
```

### Response (example)

```json
{
  "main": {
    "temp": 21.5,
    "humidity": 60
  },
  "wind": {
    "speed": 3.5
  },
  "name": "Kyiv"
}
```

## License

MIT
