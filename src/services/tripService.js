import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import distanceCalculator from '../utils/distanceCalculator.js';
import fareCalculationService from './fareCalculationService.js';
import driverMatchingService from './driverMatchingService.js';

class TripService {
  // Yeni yolculuk oluştur
  async createTrip(tripData, userId) {
    try {
      // Mesafe hesapla
      const distance = distanceCalculator.calculateDistance(
        tripData.pickup.location.lat,
        tripData.pickup.location.lng,
        tripData.dropoff.location.lat,
        tripData.dropoff.location.lng
      );

      // Süre hesapla
      const estimatedDuration = distanceCalculator.calculateDuration(distance);

      // Ücret hesapla
      const fareDetails = await fareCalculationService.calculateFare(
        tripData.station,
        distance
      );

      // Trip oluştur
      const trip = new Trip({
        ...tripData,
        createdBy: userId,
        distance,
        estimatedDuration,
        estimatedFare: fareDetails.total,
        fareDetails,
        status: 'pending'
      });

      await trip.save();

      // İlk driver'a ata
      await this.assignToNextDriver(trip._id);

      return trip;
    } catch (error) {
      throw new Error(`Error creating trip: ${error.message}`);
    }
  }

  // Sıradaki driver'a ata
  async assignToNextDriver(tripId) {
    try {
      const trip = await Trip.findById(tripId).populate('station');
      
      if (!trip || trip.status !== 'pending') {
        return null;
      }

      // Reddedilen driver ID'lerini al
      const excludeDriverIds = trip.rejectedDrivers.map(r => r.driver);

      // En yakın driverları bul
      let nearestDrivers;
      if (trip.station) {
        // Sadece belirli station
        nearestDrivers = await driverMatchingService.findNearestDrivers(
          trip.station._id,
          trip.pickup.location.lat,
          trip.pickup.location.lng,
          excludeDriverIds
        );
      } else {
        // Tüm stationlar
        nearestDrivers = await driverMatchingService.findNearestDriversAllStations(
          trip.pickup.location.lat,
          trip.pickup.location.lng,
          excludeDriverIds
        );
      }

      if (nearestDrivers.length === 0) {
        // Hiç driver kalmadı, iptal et
        trip.status = 'cancelled';
        trip.cancelledBy = 'system';
        trip.cancellationReason = 'No available drivers';
        await trip.save();
        return null;
      }

      // İlk driver'ı ata
      const selectedDriver = nearestDrivers[0].driver;
      trip.driver = selectedDriver._id;
      trip.status = 'assigned';
      trip.assignedAt = new Date();
      trip.currentAttempt += 1;
      trip.assignmentExpiry = new Date(Date.now() + 15000); // 15 saniye sonra

      await trip.save();

      // Driver'ı busy yap
      selectedDriver.status = 'busy';
      await selectedDriver.save();

      console.log(`Trip ${tripId} assigned to driver ${selectedDriver.fullName}`);

      // 15 saniye sonra kontrol için simülasyon başlat
      this.simulateDriverResponse(tripId, selectedDriver._id);

      return trip;
    } catch (error) {
      throw new Error(`Error assigning driver: ${error.message}`);
    }
  }

  // Driver cevabını simüle et (15 saniye içinde random)
  async simulateDriverResponse(tripId, driverId) {
    // Random gecikme (5-15 saniye arası)
    const delay = Math.random() * 10000 + 5000;
    
    setTimeout(async () => {
      try {
        const trip = await Trip.findById(tripId);
        
        if (!trip || trip.status !== 'assigned') {
          return; // Trip durumu değişmiş
        }

        // %70 kabul, %30 red
        const isAccepted = Math.random() > 0.3;

        if (isAccepted) {
          await this.acceptTrip(tripId, driverId);
        } else {
          await this.rejectTrip(tripId, driverId, 'Driver declined');
        }
      } catch (error) {
        console.error('Driver response simulation error:', error);
      }
    }, delay);
  }

  // Driver yolculuğu kabul etti
  async acceptTrip(tripId, driverId) {
    try {
      const trip = await Trip.findById(tripId);
      
      if (!trip || trip.status !== 'assigned') {
        throw new Error('Trip not available for acceptance');
      }

      if (trip.driver.toString() !== driverId.toString()) {
        throw new Error('This trip is not assigned to you');
      }

      trip.status = 'accepted';
      trip.acceptedAt = new Date();
      trip.assignmentExpiry = null;
      await trip.save();

      console.log(`Trip ${tripId} ACCEPTED by driver ${driverId}`);

      return trip;
    } catch (error) {
      throw new Error(`Error accepting trip: ${error.message}`);
    }
  }

  // Driver yolculuğu reddetti
  async rejectTrip(tripId, driverId, reason = 'Driver declined') {
    try {
      const trip = await Trip.findById(tripId);
      
      if (!trip || trip.status !== 'assigned') {
        return null;
      }

      // Reddeden driver'ı listeye ekle
      trip.rejectedDrivers.push({
        driver: driverId,
        rejectedAt: new Date(),
        reason
      });

      // Driver'ı tekrar active yap
      await Driver.findByIdAndUpdate(driverId, { status: 'active' });

      // Trip'i tekrar pending yap
      trip.status = 'pending';
      trip.driver = null;
      trip.assignmentExpiry = null;
      await trip.save();

      console.log(`Trip ${tripId} REJECTED by driver ${driverId}`);

      // Sıradaki driver'a ata
      await this.assignToNextDriver(tripId);

      return trip;
    } catch (error) {
      throw new Error(`Error rejecting trip: ${error.message}`);
    }
  }

  // Yolculuğu başlat
  async startTrip(tripId, driverId) {
    try {
      const trip = await Trip.findById(tripId);
      
      if (!trip || trip.status !== 'accepted') {
        throw new Error('Trip cannot be started');
      }

      //if (trip.driver.toString() !== driverId.toString()) {
      //  throw new Error('This trip is not assigned to you');
      //}

      trip.status = 'in_progress';
      trip.startedAt = new Date();
      await trip.save();

      return trip;
    } catch (error) {
      throw new Error(`Error starting trip: ${error.message}`);
    }
  }

  // Yolculuğu tamamla
  async completeTrip(tripId, driverId, actualFare) {
    try {
      const trip = await Trip.findById(tripId);
      
      if (!trip || trip.status !== 'in_progress') {
        throw new Error('Trip cannot be completed');
      }

      //if (trip.driver.toString() !== driverId.toString()) {
      //  throw new Error('This trip is not assigned to you');
      //}

      trip.status = 'completed';
      trip.completedAt = new Date();
      trip.actualFare = actualFare || trip.estimatedFare;
      trip.paymentStatus = 'paid';
      await trip.save();

      // Driver'ı active yap
      const driver = await Driver.findById(driverId);
      driver.status = 'active';
      driver.totalTrips += 1;
      driver.balance += trip.actualFare;
      console.log(`✅ Driver reset to active after trip completion`);
      await driver.save();

      return trip;
    } catch (error) {
      throw new Error(`Error completing trip: ${error.message}`);
    }
  }

  // İptal edilen yolculuğu yeniden gönder
  async resendTrip(tripId) {
    try {
      const trip = await Trip.findById(tripId);
      
      if (!trip || trip.status !== 'cancelled') {
        throw new Error('Only cancelled trips can be resent');
      }

      // Reddeden driver listesini temizle
      trip.rejectedDrivers = [];
      trip.status = 'pending';
      trip.currentAttempt = 0;
      trip.cancellationReason = null;
      trip.cancelledBy = null;
      await trip.save();

      // İlk driver'a ata
      await this.assignToNextDriver(tripId);

      return trip;
    } catch (error) {
      throw new Error(`Error resending trip: ${error.message}`);
    }
  }

  // Tüm yolculukları getir (kullanıcıya göre)
  async getAllTrips(filters = {}, userId, userRole) {
    try {
      const query = {};
      
      // Admin değilse sadece kendi oluşturduğu trip'leri görsün
      if (userRole !== 'admin') {
        query.createdBy = userId;
      }
      
      // Status filtresi
      if (filters.status) {
        query.status = filters.status;
      }

      // Station filtresi
      if (filters.station) {
        query.station = filters.station;
      }

      // Tarih filtresi
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }

      const trips = await Trip.find(query)
        .populate('station', 'name address')
        .populate('driver', 'fullName phone vehiclePlate')
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });

      return trips;
    } catch (error) {
      throw new Error(`Error fetching trips: ${error.message}`);
    }
  }

  // ID'ye göre trip getir
  async getTripById(tripId, userId, userRole) {
    try {
      const query = { _id: tripId };
      
      if (userRole !== 'admin') {
        query.createdBy = userId;
      }

      const trip = await Trip.findOne(query)
        .populate('station')
        .populate('driver')
        .populate('createdBy', 'fullName email');

      if (!trip) {
        throw new Error('Trip not found or you do not have permission');
      }

      return trip;
    } catch (error) {
      throw new Error(`Error fetching trip: ${error.message}`);
    }
  }

  // Aktif (o anda ataması/başlatılmış/in_progress/accepted) trip'i getir (driver için)
  async getActiveTripForDriver(driverId) {
    try {
      const trip = await Trip.findOne({
        driver: driverId,
        status: { $in: ['assigned', 'accepted', 'in_progress'] }
      })
      .populate('station')
      .populate({
        path: 'driver',
        populate: { path: 'station' }
      })
      .populate('createdBy', 'fullName email');


      return trip;
    } catch (error) {
      throw new Error(`Error fetching active trip: ${error.message}`);
    }
  }

  // Timeout kontrolü (Cron job için)
  async checkExpiredAssignments() {
    try {
      const now = new Date();
      
      // Süresi dolmuş atamalar
      const expiredTrips = await Trip.find({
        status: 'assigned',
        assignmentExpiry: { $lte: now }
      });

      for (const trip of expiredTrips) {
        console.log(`Trip ${trip._id} assignment expired, moving to next driver`);

        await Driver.findByIdAndUpdate(trip.driver, { status: "active" });
        
        await this.rejectTrip(trip._id, trip.driver, 'Timeout - No response');
      }

      return expiredTrips.length;
    } catch (error) {
      console.error('Expired assignments check error:', error);
      return 0;
    }
  }
}

export default new TripService();