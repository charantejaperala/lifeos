import { useState, useEffect } from 'react';

export interface RealtimeInfo {
  dateStr: string;
  timeStr: string;
  fullTimeStr: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  tempStr: string;
  weatherIcon: string;
  weatherDesc: string;
  lat: number | null;
  lon: number | null;
  timezone: string;
  ip: string;
  greeting: string;
}

export function useRealtimeContext(): RealtimeInfo {
  const [info, setInfo] = useState<RealtimeInfo>(() => {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    // Initial timezone detection
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    let initialCity = 'Bangalore';
    let initialCountry = 'India';
    let initialCode = 'IN';

    if (tz.includes('Kolkata') || tz.includes('India')) {
      initialCity = 'Bangalore';
      initialCountry = 'India';
      initialCode = 'IN';
    } else if (tz.includes('New_York')) {
      initialCity = 'New York';
      initialCountry = 'United States';
      initialCode = 'US';
    } else if (tz.includes('London')) {
      initialCity = 'London';
      initialCountry = 'United Kingdom';
      initialCode = 'UK';
    } else if (tz.includes('Tokyo')) {
      initialCity = 'Tokyo';
      initialCountry = 'Japan';
      initialCode = 'JP';
    } else if (tz.includes('San_Francisco') || tz.includes('Los_Angeles')) {
      initialCity = 'San Francisco';
      initialCountry = 'United States';
      initialCode = 'US';
    } else {
      initialCity = tz.split('/')[1]?.replace('_', ' ') || 'Local City';
    }

    const hour = now.getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    return {
      dateStr,
      timeStr,
      fullTimeStr,
      city: initialCity,
      region: '',
      country: initialCountry,
      countryCode: initialCode,
      tempStr: '28°C',
      weatherIcon: '☀️',
      weatherDesc: 'Sunny',
      lat: 12.9716,
      lon: 77.5946,
      timezone: tz,
      ip: 'Detecting...',
      greeting,
    };
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchWeatherForCoords(latitude: number, longitude: number) {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          if (wData.current_weather) {
            const tempC = Math.round(wData.current_weather.temperature);
            const tempStr = `${tempC}°C`;
            const code = wData.current_weather.weathercode;
            let weatherIcon = '☀️';
            let weatherDesc = 'Clear Sky';

            if (code === 0) { weatherIcon = '☀️'; weatherDesc = 'Sunny / Clear'; }
            else if (code >= 1 && code <= 3) { weatherIcon = '⛅'; weatherDesc = 'Partly Cloudy'; }
            else if (code >= 45 && code <= 48) { weatherIcon = '🌫️'; weatherDesc = 'Foggy'; }
            else if (code >= 51 && code <= 67) { weatherIcon = '🌧️'; weatherDesc = 'Light Rain'; }
            else if (code >= 71 && code <= 77) { weatherIcon = '❄️'; weatherDesc = 'Snow'; }
            else if (code >= 80 && code <= 82) { weatherIcon = '🌧️'; weatherDesc = 'Heavy Rain'; }
            else if (code >= 95) { weatherIcon = '🌩️'; weatherDesc = 'Thunderstorm'; }

            if (isMounted) {
              setInfo(prev => ({
                ...prev,
                tempStr,
                weatherIcon,
                weatherDesc,
                lat: latitude,
                lon: longitude,
              }));
            }
          }
        }
      } catch (e) {
        console.warn('Weather API fetch error:', e);
      }
    }

    // Attempt HTML5 Geolocation API first
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherForCoords(latitude, longitude);

          // Reverse geocode via free client-friendly API (BigDataCloud)
          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            ).catch(() => null);

            if (geoRes && geoRes.ok) {
              const gData = await geoRes.json();
              const city = gData.city || gData.locality || gData.principalSubdivision || 'Local City';
              const region = gData.principalSubdivision || '';
              const country = gData.countryName || 'India';
              const countryCode = (gData.countryCode || 'IN').toUpperCase();

              if (isMounted) {
                setInfo(prev => ({
                  ...prev,
                  city,
                  region,
                  country,
                  countryCode,
                  lat: latitude,
                  lon: longitude,
                }));
              }
            }
          } catch (e) {
            // Silent fallback to default city
          }
        },
        () => {
          // Fallback to IP Geolocation if browser permission denied
          fetchIpLocation();
        },
        { timeout: 5000 }
      );
    } else {
      fetchIpLocation();
    }

    async function fetchIpLocation() {
      try {
        const ipRes = await fetch('https://ipwho.is/').catch(() => null);
        if (ipRes && ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.success !== false) {
            const city = ipData.city || 'Bangalore';
            const region = ipData.region || '';
            const country = ipData.country || 'India';
            const countryCode = ipData.country_code || 'IN';
            const ip = ipData.ip || '';
            const lat = ipData.latitude || 12.9716;
            const lon = ipData.longitude || 77.5946;

            if (isMounted) {
              setInfo(prev => ({
                ...prev,
                city,
                region,
                country,
                countryCode,
                ip,
                lat,
                lon,
              }));
            }

            fetchWeatherForCoords(lat, lon);
            return;
          }
        }
        // Fallback default
        if (isMounted) {
          setInfo(prev => ({ ...prev, city: 'Bangalore', country: 'India', countryCode: 'IN' }));
        }
        fetchWeatherForCoords(12.9716, 77.5946);
      } catch {
        if (isMounted) {
          setInfo(prev => ({ ...prev, city: 'Bangalore', country: 'India', countryCode: 'IN' }));
        }
        fetchWeatherForCoords(12.9716, 77.5946);
      }
    }

    // 1-second interval for real-time live clock ticking
    const interval = setInterval(() => {
      if (!isMounted) return;
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      };
      const dateStr = now.toLocaleDateString('en-US', dateOptions);
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const fullTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      const hour = now.getHours();
      let greeting = 'Good Morning';
      if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
      else if (hour >= 17) greeting = 'Good Evening';

      setInfo(prev => ({ ...prev, dateStr, timeStr, fullTimeStr, greeting }));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return info;
}

