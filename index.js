const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 80;

console.log('🚀 Starting Weather API with database connection test v2...');
console.log('Environment variables:');
console.log('- PORT:', PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('- OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? 'SET' : 'NOT SET');

let dbStatus = {
  connected: false,
  error: null,
  lastTest: null
};

// PostgreSQL pool with SSL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Ignore self-signed certificate errors
  }
});

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection with SSL...');
    const client = await pool.connect();
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    
    // Init table creation
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        city TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ weather_cache table ready');
    
    client.release();
    
    dbStatus = {
      connected: true,
      error: null,
      lastTest: new Date().toISOString(),
      version: result.rows[0].pg_version,
      ssl: 'enabled with rejectUnauthorized=false'
    };
    
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error code:', err.code);
    dbStatus = {
      connected: false,
      error: {
        code: err.code,
        message: err.message
      },
      lastTest: new Date().toISOString()
    };
    return false;
  }
}

// Test connection on startup (but don't exit if it fails)
testDatabaseConnection();

app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'database-test-v2',
    database: dbStatus
  });
});

app.get('/api/db-test', async (req, res) => {
  console.log('Database test requested');
  const success = await testDatabaseConnection();
  res.json({
    success,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  console.log(`Weather requested for city: ${city}`);
  
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    // Try to use database if connected
    if (dbStatus.connected) {
      console.log('Using database for caching...');
      const client = await pool.connect();
      const now = new Date();

      // Check cache
      const result = await client.query(
          'SELECT data, updated_at FROM weather_cache WHERE city = $1',
          [city.toLowerCase()]
      );

      if (
          result.rows.length > 0 &&
          new Date(result.rows[0].updated_at) > new Date(now - 30 * 60000) // 30 minutes
      ) {
        console.log(`Serving cached weather for: ${city}`);
        client.release();
        return res.json({
          ...result.rows[0].data,
          _cache_info: {
            cached: true,
            timestamp: result.rows[0].updated_at
          }
        });
      }
      client.release();
    }

    // Fetch fresh data from API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`Fetching fresh weather data for: ${city}`);
    const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`
    );

    const weatherData = weatherResponse.data;

    // Save to cache if database is connected
    if (dbStatus.connected) {
      try {
        const client = await pool.connect();
        await client.query(
            `INSERT INTO weather_cache (city, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (city) DO UPDATE SET data = $2, updated_at = NOW()`,
            [city.toLowerCase(), weatherData]
        );
        client.release();
        console.log(`✅ Weather data cached for: ${city}`);
        
        weatherData._cache_info = {
          cached: false,
          saved_to_cache: true,
          timestamp: new Date().toISOString()
        };
      } catch (cacheErr) {
        console.error('Cache save failed:', cacheErr.message);
        weatherData._cache_info = {
          cached: false,
          saved_to_cache: false,
          cache_error: cacheErr.message,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      weatherData._cache_info = {
        cached: false,
        saved_to_cache: false,
        database_unavailable: true,
        timestamp: new Date().toISOString()
      };
    }

    res.json(weatherData);
  } catch (err) {
    console.error('Weather error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: err.message 
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Weather API with database testing v2',
    endpoints: {
      health: '/api/health',
      weather: '/api/weather?city=Kyiv',
      dbTest: '/api/db-test'
    },
    version: 'database-test-v2',
    database: dbStatus
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Weather API server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  pool.end().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  pool.end().then(() => process.exit(0));
});
