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
- Postgres url

## Environment Variables

Create a `.env` file in the project root with:

```
OPENWEATHER_API_KEY=your_api_key_here
DATABASE_URL=db_url
```

## Usage

### Local

```bash
npm install
npm start
```

Then open:

```
http://localhost/api/weather?city=Kyiv
```

### Docker

Build and run:

```bash
docker build -t weather-api .
docker run -p 80:80 --env-file .env weather-api
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

**GET** `/api/health`

```
{
"status": "OK",
"timestamp": "2025-06-20T13:07:03.157Z",
"version": "database-test-v2",
"database": {
"connected": true,
"version": "PostgreSQL 17.4..."
}
}
```

**GET** `/api/weather?city=CityName`

### Query Parameters

- `city` — Name of the city (required)

### Example
### **API Endpoints:**

#### 1. Health Check (Статус системи)
http://weather-api-env-v2.eba-rw2rqgfg.us-east-1.elasticbeanstalk.com/api/health

Показує статус API та підключення до бази даних

#### 2. Database Test (Тест бази даних)
http://weather-api-env-v2.eba-rw2rqgfg.us-east-1.elasticbeanstalk.com/api/db-test

Тестує підключення до PostgreSQL

#### 3. Weather API (Погодні дані)
http://weather-api-env-v2.eba-rw2rqgfg.us-east-1.elasticbeanstalk.com/api/weather?city=Kyiv

Погода для Києва

http://weather-api-env-v2.eba-rw2rqgfg.us-east-1.elasticbeanstalk.com/api/weather?city=London

Погода для Лондона

http://weather-api-env-v2.eba-rw2rqgfg.us-east-1.elasticbeanstalk.com/api/weather?city=Paris

Погода для Парижа

### Response (example)

```
{
  "coord": {
    "lon": 2.3488,
    "lat": 48.8534
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 302.87,
    "feels_like": 302.12,
    "temp_min": 302.12,
    "temp_max": 303.92,
    "pressure": 1022,
    "humidity": 36,
    "sea_level": 1022,
    "grnd_level": 1011
  },
  "visibility": 10000,
  "wind": {
    "speed": 3.6,
    "deg": 70
  },
  "clouds": {
    "all": 0
  },
  "dt": 1750425141,
  "sys": {
    "type": 2,
    "id": 2012208,
    "country": "FR",
    "sunrise": 1750391209,
    "sunset": 1750449452
  },
  "timezone": 7200,
  "id": 2988507,
  "name": "Paris",
  "cod": 200,
  "_cache_info": {
    "cached": false,
    "saved_to_cache": true,
    "timestamp": "2025-06-20T13:21:18.239Z"
  }
}
```

## License

MIT
