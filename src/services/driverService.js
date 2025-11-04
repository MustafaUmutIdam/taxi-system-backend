// src/services/driverService.js
import Driver from "../models/Driver.js";
import Station from "../models/Station.js";
import Trip from '../models/Trip.js';

class DriverService {
  async getAllDrivers(filters = {}) {
    try {
      const query = {};
      if (filters.search) query.fullName = { $regex: filters.search, $options: "i" };
      if (filters.stationId) query.station = filters.stationId;

      const drivers = await Driver.find(query)
        .populate("station", "name address")
        .sort({ createdAt: -1 });

      return drivers;
    } catch (err) {
      throw new Error(`Error fetching drivers: ${err.message}`);
    }
  }

  async getDriverById(id) {
    try {
      const driver = await Driver.findById(id).populate("station", "name address");
      if (!driver) throw new Error("Driver not found");
      return driver;
    } catch (err) {
      throw new Error(`Error fetching driver: ${err.message}`);
    }
  }

  async createDriver(driverData) {
    try {
      // station kontrolü
      const station = await Station.findById(driverData.station);
      if (!station) throw new Error("Invalid station ID");

      const driver = new Driver(driverData);
      await driver.save();

      // durağa ekle
      station.drivers = station.drivers || [];
      station.drivers.push(driver._id);
      await station.save();

      return driver;
    } catch (err) {
      throw new Error(`Error creating driver: ${err.message}`);
    }
  }

  async updateDriver(id, updateData) {
    try {
      const driver = await Driver.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!driver) throw new Error("Driver not found");
      return driver;
    } catch (err) {
      throw new Error(`Error updating driver: ${err.message}`);
    }
  }

  async deleteDriver(id) {
    try {
      const driver = await Driver.findByIdAndDelete(id);
      if (!driver) throw new Error("Driver not found");

      // Station'dan çıkar
      if (driver.station) {
        await Station.updateOne({ _id: driver.station }, { $pull: { drivers: driver._id } });
      }

      return driver;
    } catch (err) {
      throw new Error(`Error deleting driver: ${err.message}`);
    }
  }

  async getDriversByStation(stationId) {
    try {
      const drivers = await Driver.find({ station: stationId }).populate("station", "name address");
      return drivers;
    } catch (err) {
      throw new Error(`Error fetching station drivers: ${err.message}`);
    }
  }
}

export async function resetStuckDrivers() {

  console.log("🔍 Checking for stuck drivers...");

  const busyDrivers = await Driver.find({ status: 'busy' });

  for (const driver of busyDrivers) {
    const activeTrip = await Trip.findOne({
      driver: driver._id,
      status: { $in: ['assigned', 'accepted', 'in_progress'] }
    });

    if (!activeTrip) {
      driver.status = 'active';
      await driver.save();
      console.log(`♻️ Driver ${driver.fullName} reset to active`);
    }
  }
}

export default new DriverService();
