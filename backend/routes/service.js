const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Get all services
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const services = await Service.find(query);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create service (admin)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    
    // Check if file was uploaded
    let imagePath = '';
    if (req.file) {
      imagePath = req.file.filename; // Store just the filename
    }
    
    const service = new Service({
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      image: imagePath
    });
    
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update service (admin)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    
    // Find the existing service
    const existingService = await Service.findById(req.params.id);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if a new image was uploaded
    let imagePath = existingService.image;
    if (req.file) {
      // Delete the old image if it exists
      if (existingService.image) {
        const oldImagePath = path.join(__dirname, '../uploads', existingService.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = req.file.filename;
    }
    
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        image: imagePath
      },
      { new: true }
    );
    
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete service (admin)
router.delete('/:id', async (req, res) => {
  try {
    // Find the service first to get the image path
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Delete the associated image if it exists
    if (service.image) {
      const imagePath = path.join(__dirname, '../uploads', service.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Remove the service from the database
    await Service.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;