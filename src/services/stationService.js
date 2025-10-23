import Station from '../models/Station.js';

class StationService {
  // Tüm istasyonları getir
  async getAllStations(filters = {}) {
    try {
      const query = {};
      
      // İsme göre arama
      if (filters.search) {
        query.name = { $regex: filters.search, $options: 'i' };
      }

      const stations = await Station.find(query).sort({ createdAt: -1 });
      return stations;
    } catch (error) {
      throw new Error(`Error fetching stations: ${error.message}`);
    }
  }

  // ID'ye göre istasyon getir
  async getStationById(id) {
    try {
      const station = await Station.findById(id);
      if (!station) {
        throw new Error('Station not found');
      }
      return station;
    } catch (error) {
      throw new Error(`Error fetching station: ${error.message}`);
    }
  }

  // Yeni istasyon oluştur
  async createStation(stationData) {
    try {
      const station = new Station(stationData);
      await station.save();
      return station;
    } catch (error) {
      throw new Error(`Error creating station: ${error.message}`);
    }
  }

  // İstasyon güncelle
  async updateStation(id, updateData) {
    try {
      const station = await Station.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!station) {
        throw new Error('Station not found');
      }
      
      return station;
    } catch (error) {
      throw new Error(`Error updating station: ${error.message}`);
    }
  }

  // İstasyon sil
  async deleteStation(id) {
    try {
      const station = await Station.findByIdAndDelete(id);
      if (!station) {
        throw new Error('Station not found');
      }
      return station;
    } catch (error) {
      throw new Error(`Error deleting station: ${error.message}`);
    }
  }

  // Yakındaki istasyonları bul (koordinatlara göre)
  async getNearbyStations(lat, lng, maxDistance = 5000) {
    try {
      const stations = await Station.find({
        'location.lat': { $exists: true },
        'location.lng': { $exists: true }
      });

      // Basit mesafe hesaplama
      const stationsWithDistance = stations.map(station => {
        const distance = this.calculateDistance(
          lat, lng,
          station.location.lat, station.location.lng
        );
        return { ...station.toObject(), distance };
      });

      return stationsWithDistance
        .filter(s => s.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);
    } catch (error) {
      throw new Error(`Error finding nearby stations: ${error.message}`);
    }
  }

  // Haversine formülü ile mesafe hesaplama (metre)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Dünya yarıçapı (metre)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export default new StationService();