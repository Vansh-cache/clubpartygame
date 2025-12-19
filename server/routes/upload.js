import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import xlsx from 'xlsx';
import Employee from '../models/Employee.js';

const router = express.Router();

// Helper function to check MongoDB connection
const checkMongoConnection = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ 
      error: 'Database not connected',
      message: 'MongoDB connection is not available. Please check your database connection.'
    });
    return false;
  }
  return true;
};

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'));
    }
  },
});

// Upload and parse Excel file
router.post('/excel', upload.single('file'), async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null 
    });

    // Extract employee names and emails (assuming first column contains names, second column contains emails)
    const employees = [];
    const seenNames = new Set();

    data.forEach((row, index) => {
      // Skip empty rows
      if (!row || row.length === 0) return;
      
      // Get name from first column
      const name = row[0];
      const email = row[1] || ''; // Email from second column (optional)
      
      if (name && typeof name === 'string' && name.trim()) {
        const trimmedName = name.trim();
        const trimmedEmail = (typeof email === 'string' && email.trim()) 
          ? email.trim().toLowerCase() 
          : 'NA';
        
        // Avoid duplicates (case-insensitive)
        if (!seenNames.has(trimmedName.toLowerCase())) {
          seenNames.add(trimmedName.toLowerCase());
          employees.push({
            name: trimmedName,
            email: trimmedEmail,
          });
        }
      }
    });

    if (employees.length === 0) {
      return res.status(400).json({ error: 'No valid employee names found in the Excel file' });
    }

    // Clear existing employees (optional - you might want to keep them)
    // Uncomment the next line if you want to replace all employees on each upload
    // await Employee.deleteMany({});

    // Insert employees (handle duplicates gracefully)
    const insertedEmployees = [];
    const duplicateEmployees = [];
    
    for (const emp of employees) {
      try {
        // Check if employee already exists (case-insensitive)
        const existing = await Employee.findOne({ 
          name: { $regex: new RegExp(`^${emp.name}$`, 'i') }
        });
        
        if (!existing) {
          const newEmployee = await Employee.create(emp);
          insertedEmployees.push(newEmployee);
        } else {
          duplicateEmployees.push(emp.name);
        }
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }
        duplicateEmployees.push(emp.name);
      }
    }

    res.status(200).json({
      message: `Successfully uploaded ${insertedEmployees.length} employees${duplicateEmployees.length > 0 ? `. ${duplicateEmployees.length} duplicates skipped.` : ''}`,
      count: insertedEmployees.length,
      employees: insertedEmployees,
      duplicates: duplicateEmployees.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Error processing Excel file' });
  }
});

export default router;

