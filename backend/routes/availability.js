const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');

router.get('/service/:serviceId', async (req, res) => {
  try {
    const availability = await Availability.findOne({ 
      service: req.params.serviceId 
    });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/service/:serviceId', async (req, res) => {
  try {
    const { workingHours, exceptions } = req.body;
    
    let availability = await Availability.findOne({ 
      service: req.params.serviceId 
    });
    
    if (availability) {
      availability.workingHours = workingHours;
      availability.exceptions = exceptions || [];
      await availability.save();
    } else {
      availability = new Availability({
        service: req.params.serviceId,
        workingHours,
        exceptions: exceptions || []
      });
      await availability.save();
    }
    
    res.json(availability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/check-availability', async (req, res) => {
  try {
    const { services, date, startTime } = req.body;
    const results = [];
    
    for (const serviceId of services) {
      const availability = await Availability.findOne({ service: serviceId });
      
      if (!availability) {
        results.push({
          service: serviceId,
          available: false,
          reason: 'Availability not set'
        });
        continue;
      }
      
      const slotDate = new Date(date);
      const dayOfWeek = slotDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
      
      const exception = availability.exceptions.find(e => 
        e.date.toDateString() === slotDate.toDateString()
      );
      
      if (exception) {
        if (!exception.isAvailable) {
          results.push({
            service: serviceId,
            available: false,
            reason: 'Exception date not available'
          });
          continue;
        }
        
        const [hours, minutes] = startTime.split(':').map(Number);
        const slotStart = hours * 60 + minutes;
        
        const isSlotAvailable = exception.slots.some(slot => {
          const [startH, startM] = slot.start.split(':').map(Number);
          const [endH, endM] = slot.end.split(':').map(Number);
          const slotStartMin = startH * 60 + startM;
          const slotEndMin = endH * 60 + endM;
          
          return slotStart >= slotStartMin && slotStart < slotEndMin;
        });
        
        results.push({
          service: serviceId,
          available: isSlotAvailable,
          reason: isSlotAvailable ? '' : 'Time slot not available in exception'
        });
        continue;
      }
      
      const dayAvailability = availability.workingHours.find(d => d.day === dayOfWeek);
      
      if (!dayAvailability || !dayAvailability.isAvailable) {
        results.push({
          service: serviceId,
          available: false,
          reason: `Not available on ${dayOfWeek}`
        });
        continue;
      }
      
      const [hours, minutes] = startTime.split(':').map(Number);
      const slotStart = hours * 60 + minutes;
      
      const isSlotAvailable = dayAvailability.slots.some(slot => {
        const [startH, startM] = slot.start.split(':').map(Number);
        const [endH, endM] = slot.end.split(':').map(Number);
        const slotStartMin = startH * 60 + startM;
        const slotEndMin = endH * 60 + endM;
        
        return slotStart >= slotStartMin && slotStart < slotEndMin;
      });
      
      results.push({
        service: serviceId,
        available: isSlotAvailable,
        reason: isSlotAvailable ? '' : 'Time slot not available'
      });
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;