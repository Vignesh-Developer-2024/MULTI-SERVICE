const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Availability = require('../models/Availability');

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to check if time ranges overlap
const timeRangesOverlap = (start1, end1, start2, end2) => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

// Create booking
router.post('/', async (req, res) => {
  try {
    const { customer, services, date, startTime } = req.body;
    
    // Validate required fields
    if (!customer || !services || !date || !startTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Services must be a non-empty array' });
    }
    
    let totalPrice = 0;
    let totalDuration = 0;
    
    // Validate services and calculate total price/duration
    for (const item of services) {
      if (!item.service || !item.quantity) {
        return res.status(400).json({ message: 'Each service must have service ID and quantity' });
      }
      
      const service = await Service.findById(item.service);
      if (!service) {
        return res.status(404).json({ message: `Service ${item.service} not found` });
      }
      
      totalPrice += service.price * item.quantity;
      totalDuration += service.duration * item.quantity;
    }
    
    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Check availability for each service
    for (const item of services) {
      const availability = await Availability.findOne({ service: item.service });
      if (!availability) {
        return res.status(400).json({ 
          message: `Availability not set for service ${item.service}`,
          serviceId: item.service
        });
      }
      
      const dayOfWeek = startDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
      const dayAvailability = availability.workingHours.find(d => d.day === dayOfWeek);
      
      if (!dayAvailability || !dayAvailability.isAvailable) {
        return res.status(400).json({ 
          message: `Service not available on ${dayOfWeek}`,
          serviceId: item.service,
          day: dayOfWeek
        });
      }
      
      // Check if time slot is available
      const isSlotAvailable = dayAvailability.slots.some(slot => {
        const slotStartMinutes = timeToMinutes(slot.start);
        const slotEndMinutes = timeToMinutes(slot.end);
        const bookingStartMinutes = timeToMinutes(startTime);
        const bookingEndMinutes = timeToMinutes(endTime);
        
        return bookingStartMinutes >= slotStartMinutes && bookingEndMinutes <= slotEndMinutes;
      });
      
      if (!isSlotAvailable) {
        return res.status(400).json({ 
          message: `Time slot not available for service`,
          serviceId: item.service,
          requestedTime: `${startTime}-${endTime}`
        });
      }
    }
    
    // Check for conflicting bookings
    const bookingDate = new Date(date);
    const conflictingBookings = await Booking.find({
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Time slot already booked',
        conflictingBookings: conflictingBookings.map(b => ({
          id: b._id,
          time: `${b.startTime}-${b.endTime}`
        }))
      });
    }
    
    // Create the booking
    const booking = new Booking({
      customer,
      services,
      date: new Date(date),
      startTime,
      endTime,
      totalPrice
    });
    
    const newBooking = await booking.save();
    
    // Populate the service details in the response
    await newBooking.populate('services.service');
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Get all bookings with filters
router.get('/', async (req, res) => {
  try {
    const { date, customer, service, status } = req.query;
    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (customer) {
      query['customer.email'] = { $regex: customer, $options: 'i' };
    }
    
    if (service) {
      query['services.service'] = service;
    }
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('services.service')
      .sort({ date: 1, startTime: 1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('services.service');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('services.service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;