import Driver from '../models/Driver.js';
import distanceCalculator from '../utils/distanceCalculator.js';

class DriverMatchingService {
  // En yakın aktif driverları bul
  async findNearestDrivers(stationId, pickupLat, pickupLng, excludeDriverIds = []) {
    try {
      const query = {
        station: stationId,
        status: 'active', // Sadece aktif driverlar
        isActive: true,
        _id: { $nin: excludeDriverIds }, // Reddedenleri hariç tut
        'currentLocation.lat': { $exists: true },
        'currentLocation.lng': { $exists: true }
      };

      const drivers = await Driver.find(query);

      // Her driver için mesafe hesapla
      const driversWithDistance = drivers.map(driver => {
        const distance = distanceCalculator.calculateDistance(
          pickupLat,
          pickupLng,
          driver.currentLocation.lat,
          driver.currentLocation.lng
        );
        
        return {
          driver,
          distance
        };
      });

      // Mesafeye göre sırala (en yakından en uzağa)
      driversWithDistance.sort((a, b) => a.distance - b.distance);

      return driversWithDistance;
    } catch (error) {
      throw new Error(`Driver matching error: ${error.message}`);
    }
  }

  // Tüm stationlardan en yakın driverları bul
  async findNearestDriversAllStations(pickupLat, pickupLng, excludeDriverIds = []) {
    try {
      const query = {
        status: 'active',
        isActive: true,
        _id: { $nin: excludeDriverIds },
        'currentLocation.lat': { $exists: true },
        'currentLocation.lng': { $exists: true }
      };

      const drivers = await Driver.find(query).populate('station');

      const driversWithDistance = drivers.map(driver => {
        const distance = distanceCalculator.calculateDistance(
          pickupLat,
          pickupLng,
          driver.currentLocation.lat,
          driver.currentLocation.lng
        );
        
        return {
          driver,
          distance
        };
      });

      driversWithDistance.sort((a, b) => a.distance - b.distance);

      return driversWithDistance;
    } catch (error) {
      throw new Error(`Driver matching error: ${error.message}`);
    }
  }
}

export default new DriverMatchingService();