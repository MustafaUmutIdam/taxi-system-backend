import tripService from '../services/tripService.js';

class TripTimeoutJob {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  // Job'u başlat
  start() {
    if (this.isRunning) {
      console.log('Trip timeout job is already running');
      return;
    }

    console.log('🚀 Trip timeout job started - checking every 5 seconds');
    
    this.isRunning = true;
    
    // Her 5 saniyede bir kontrol et
    this.interval = setInterval(async () => {
      try {
        const expiredCount = await tripService.checkExpiredAssignments();
        if (expiredCount > 0) {
          console.log(`✅ Processed ${expiredCount} expired trip assignments`);
        }
      } catch (error) {
        console.error('❌ Trip timeout job error:', error);
      }
    }, 5000); // 5 saniye
  }

  // Job'u durdur
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Trip timeout job stopped');
    }
  }
}

export default new TripTimeoutJob();