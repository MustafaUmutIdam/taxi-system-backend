import Station from '../models/Station.js';

class FareCalculationService {
  // Ücret hesaplama
  async calculateFare(stationId, distanceKm, requestTime = new Date()) {
    try {
      // Station ayarlarını al
      const station = await Station.findById(stationId);
      if (!station) {
        throw new Error('Station not found');
      }

      const settings = station.settings;
      const hour = requestTime.getHours();
      
      // Gece saati kontrolü
      const isNightTime = hour >= settings.nightStartHour || hour < settings.nightEndHour;
      
      // Temel hesaplama
      let fare = settings.baseRate; // Açılış ücreti
      let kmFare = distanceKm * settings.perKmRate; // Km ücreti
      
      // Gece zammı
      let nightSurcharge = 0;
      if (isNightTime) {
        nightSurcharge = kmFare * (settings.nightSurcharge - 1);
        kmFare += nightSurcharge;
      }
      
      fare += kmFare;
      
      // Minimum ücret kontrolü
      if (fare < settings.minFare) {
        fare = settings.minFare;
      }

      return {
        baseRate: settings.baseRate,
        perKmRate: settings.perKmRate,
        distance: distanceKm,
        isNightTime,
        nightSurcharge: parseFloat(nightSurcharge.toFixed(2)),
        total: parseFloat(fare.toFixed(2))
      };
    } catch (error) {
      throw new Error(`Fare calculation error: ${error.message}`);
    }
  }
}

export default new FareCalculationService();