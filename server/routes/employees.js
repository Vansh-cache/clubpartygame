import express from 'express';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';

const router = express.Router();

// Helper function to check MongoDB connection
const checkMongoConnection = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ 
      error: 'Database not connected',
      message: 'MongoDB connection is not available. Please check your database connection.',
      employees: []
    });
    return false;
  }
  return true;
};

// Get all employees
router.get('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: error.message,
      employees: [] // Return empty array so frontend doesn't break
    });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create multiple employees (bulk insert)
router.post('/bulk', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const { employees } = req.body;
    if (!Array.isArray(employees)) {
      return res.status(400).json({ error: 'employees must be an array' });
    }

    const result = await Employee.insertMany(employees, { ordered: false });
    res.status(201).json({ 
      message: `Successfully added ${result.length} employees`,
      employees: result 
    });
  } catch (error) {
    console.error('Error bulk inserting employees:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all employees
router.delete('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    await Employee.deleteMany({});
    res.json({ message: 'All employees deleted successfully' });
  } catch (error) {
    console.error('Error deleting all employees:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

