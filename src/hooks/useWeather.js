import { useState, useCallback } from 'react'

/**
 * useWeather — fetches current weather via:
 *   1. Browser navigator.geolocation (best accuracy)
 *   2. IP-based geolocation fallback via ipapi.co (free, no key)
 *   3. Open-Meteo for weather data (free, no key)
 *   4. Nominatim (OpenStreetMap) for reverse geocoding a city name
 *      when we only have lat/lon from the browser
 *
 * Returned state shape:
 *   status   : 'idle' | 'locating' | 'fetching' | 'success' | 'error'
 *   data     : WeatherData | null
 *   location : { name: string, lat: number, lon: number } | null
 *   method   : 'gps' | 'ip' | null   (which location source was used)
 *   error    : string | null
 *   refresh  : () => void
 */
export function useWeather() {
  const [status, setStatus]     = useState('idle')
  const [data, setData]         = useState(null)
  const [location, setLocation] = useState(null)
  const [method, setMethod]     = useState(null)
  const [error, setError]       = useState(null)

  const fetch_ = useCallback(async () => {
    setStatus('locating')
    setError(null)

    try {
      // ── Step 1: resolve lat/lon + city name ──────────────
      let lat, lon, cityName, usedMethod

      try {
        // Try browser geolocation first (5-second timeout)
        const position = await getGeolocation()
        lat = position.coords.latitude
        lon = position.coords.longitude
        usedMethod = 'gps'

        // Reverse-geocode to a human-readable city name
        // Rate limit: Nominatim requires ≤1 req/s. We only call once per refresh.
        cityName = await reverseGeocode(lat, lon)
      } catch {
        // Permission denied or browser doesn't support geolocation —
        // fall back to IP-based location (ipapi.co is free, ~1000 req/day soft limit)
        console.info('[useWeather] Geolocation unavailable — falling back to IP lookup')
        const ip = await fetchIPLocation()
        lat        = ip.latitude
        lon        = ip.longitude
        cityName   = ip.city ? `${ip.city}, ${ip.country_name}` : 'Your Location'
        usedMethod = 'ip'
      }

      setLocation({ name: cityName, lat, lon })
      setMethod(usedMethod)

      // ── Step 2: fetch weather from Open-Meteo ────────────
      // Docs: https://open-meteo.com/en/docs
      // No API key needed. weather_code follows WMO 4677 codes.
      setStatus('fetching')
      const weather = await fetchOpenMeteo(lat, lon)

      setData(weather)
      setStatus('success')
    } catch (err) {
      console.error('[useWeather]', err)
      setError(err.message || 'Failed to load weather')
      setStatus('error')
    }
  }, [])

  // Kick off on mount via the component (avoids double-call in StrictMode)
  return { status, data, location, method, error, refresh: fetch_ }
}

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * Wrap navigator.geolocation.getCurrentPosition in a Promise
 * with a 6-second timeout.
 */
function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 6000,
      maximumAge: 300_000, // 5-min cache — avoid hammering GPS on re-renders
    })
  })
}

/**
 * IP-based geolocation via ipapi.co
 * Returns { latitude, longitude, city, country_name, ... }
 * Free tier: ~1000 req/day without a key.
 */
async function fetchIPLocation() {
  const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('IP geolocation failed')
  const json = await res.json()
  if (!json.latitude) throw new Error('IP geolocation returned no coordinates')
  return json
}

/**
 * Reverse geocode lat/lon → city name via Nominatim (OpenStreetMap).
 * Policy: max 1 req/s, non-commercial use, include User-Agent.
 * We only call this once per user-initiated refresh.
 */
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'RyuenxHub/1.0' },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return 'Your Location'
  const json = await res.json()
  // Nominatim address hierarchy: city > town > village > county
  const addr = json.address || {}
  return (
    addr.city       ||
    addr.town       ||
    addr.village    ||
    addr.county     ||
    addr.state      ||
    json.display_name?.split(',')[0] ||
    'Your Location'
  )
}

/**
 * Fetch current weather conditions from Open-Meteo.
 * Params used:
 *   temperature_2m         — air temp at 2m (°C)
 *   apparent_temperature   — feels-like (°C)
 *   relative_humidity_2m   — humidity (%)
 *   wind_speed_10m         — wind speed at 10m (km/h)
 *   weather_code           — WMO code for condition icon
 *
 * Returns a normalised WeatherData object.
 */
async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
    wind_speed_unit:    'kmh',
    temperature_unit:   'celsius',
    timezone:           'auto',    // server picks tz based on coords
  })

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { signal: AbortSignal.timeout(8000) },
  )
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const json = await res.json()
  const c = json.current

  return {
    temp:        Math.round(c.temperature_2m),
    feelsLike:   Math.round(c.apparent_temperature),
    humidity:    c.relative_humidity_2m,
    windSpeed:   Math.round(c.wind_speed_10m),
    weatherCode: c.weather_code,
    fetchedAt:   new Date(),
  }
}

/* ── WMO weather code → human label + condition key ─────── */

/**
 * Maps WMO 4677 weather codes to a label + a condition key
 * used for picking the correct icon in WeatherIcon.jsx.
 *
 * Condition keys: clear | partly_cloudy | cloudy | fog |
 *                 drizzle | rain | snow | shower | thunderstorm
 */
export function describeWeatherCode(code) {
  if (code === 0)                return { label: 'Clear Sky',       condition: 'clear'         }
  if (code === 1)                return { label: 'Mainly Clear',    condition: 'clear'         }
  if (code === 2)                return { label: 'Partly Cloudy',   condition: 'partly_cloudy' }
  if (code === 3)                return { label: 'Overcast',        condition: 'cloudy'        }
  if ([45, 48].includes(code))   return { label: 'Foggy',          condition: 'fog'           }
  if ([51, 53, 55].includes(code)) return { label: 'Drizzle',      condition: 'drizzle'       }
  if ([56, 57].includes(code))   return { label: 'Freezing Drizzle',condition: 'drizzle'      }
  if ([61, 63].includes(code))   return { label: 'Rain',           condition: 'rain'          }
  if (code === 65)               return { label: 'Heavy Rain',      condition: 'rain'          }
  if ([66, 67].includes(code))   return { label: 'Freezing Rain',  condition: 'rain'          }
  if ([71, 73, 75].includes(code)) return { label: 'Snow',         condition: 'snow'          }
  if (code === 77)               return { label: 'Snow Grains',     condition: 'snow'          }
  if ([80, 81, 82].includes(code)) return { label: 'Rain Showers', condition: 'shower'        }
  if ([85, 86].includes(code))   return { label: 'Snow Showers',   condition: 'snow'          }
  if (code === 95)               return { label: 'Thunderstorm',   condition: 'thunderstorm'  }
  if ([96, 99].includes(code))   return { label: 'Thunderstorm + Hail', condition: 'thunderstorm' }
  return { label: 'Unknown', condition: 'clear' }
}
