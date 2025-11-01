import Station from '../models/Station.js';
import User from '../models/User.js';

class StationService {
  // Kullanıcıya göre istasyonları getir
  async getAllStations(filters = {}, userId, userRole) {
    try {
      const query = {};
      
      // Admin değilse sadece kendi istasyonlarını görsün
      if (userRole !== 'admin') {
        query.manager = userId;
      }
      
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
  async getStationById(id, userId, userRole) {
    try {
      const query = { _id: id };
      
      // Admin değilse sadece kendi istasyonunu görsün
      if (userRole !== 'admin') {
        query.manager = userId;
      }

      const station = await Station.findOne(query);
      if (!station) {
        throw new Error('Station not found or you do not have permission');
      }
      return station;
    } catch (error) {
      throw new Error(`Error fetching station: ${error.message}`);
    }
  }

  // Yeni istasyon oluştur
  async createStation(stationData, userId) {
    try {
      // Manager olarak kullanıcıyı ata
      stationData.manager = userId;
      
      const station = new Station(stationData);
      await station.save();
      
      // User'ın managedStations'ına ekle
      await User.findByIdAndUpdate(userId, {
        $addToSet: { managedStations: station._id }
      });
      
      return station;
    } catch (error) {
      throw new Error(`Error creating station: ${error.message}`);
    }
  }

  // İstasyon güncelle
  async updateStation(id, updateData, userId, userRole) {
    try {
      const query = { _id: id };
      
      // Admin değilse sadece kendi istasyonunu güncelleyebilir
      if (userRole !== 'admin') {
        query.manager = userId;
      }

      const station = await Station.findOneAndUpdate(
        query,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!station) {
        throw new Error('Station not found or you do not have permission');
      }
      
      return station;
    } catch (error) {
      throw new Error(`Error updating station: ${error.message}`);
    }
  }

  // İstasyon sil
  async deleteStation(id, userId, userRole) {
    try {
      const query = { _id: id };
      
      // Admin değilse sadece kendi istasyonunu silebilir
      if (userRole !== 'admin') {
        query.manager = userId;
      }

      const station = await Station.findOneAndDelete(query);
      if (!station) {
        throw new Error('Station not found or you do not have permission');
      }
      
      // User'ın managedStations'ından çıkar
      await User.findByIdAndUpdate(userId, {
        $pull: { managedStations: id }
      });
      
      return station;
    } catch (error) {
      throw new Error(`Error deleting station: ${error.message}`);
    }
  }

  // Yakındaki istasyonları bul
  async getNearbyStations(lat, lng, maxDistance = 5000) {
    try {
      const stations = await Station.find({
        'location.lat': { $exists: true },
        'location.lng': { $exists: true }
      });

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

  // Haversine formülü
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
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