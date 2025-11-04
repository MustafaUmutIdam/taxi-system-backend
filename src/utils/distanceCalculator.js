class DistanceCalculator {
  // Haversine formülü ile mesafe hesaplama (km)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(2)); // km
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Tahmini süre hesaplama (ortalama 40 km/saat)
  calculateDuration(distanceKm) {
    const averageSpeed = 40; // km/saat
    const durationHours = distanceKm / averageSpeed;
    const durationMinutes = Math.ceil(durationHours * 60);
    return durationMinutes;
  }
}

export default new DistanceCalculator();