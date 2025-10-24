const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  
  type: {
    type: String,
    enum: ['trip_request', 'trip_accepted', 'trip_completed', 'trip_cancelled', 'driver_status', 'system'],
    required: true
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // İlgili veri
  data: {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }
  },
  
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
