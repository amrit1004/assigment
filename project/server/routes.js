import express from 'express';
import { Record } from './models/Record.js';

export const router = express.Router();

router.post('/import', async (req, res) => {
  try {
    const { data, sheetName } = req.body;
    
    if (!Array.isArray(data) || !sheetName) {
      return res.status(400).json({ message: 'Invalid request format' });
    }

    let importedCount = 0;
    let skippedCount = 0;
    const currentDate = new Date();
    const errors = [];

    // Process each row
    for (const row of data) {
      try {
        // Validate required fields
        if (!row.Name || !row.Amount || !row.Date) {
          skippedCount++;
          continue;
        }

        const rowDate = new Date(row.Date);
        
        // Validate date is in current month
        if (rowDate.getMonth() !== currentDate.getMonth() || 
            rowDate.getFullYear() !== currentDate.getFullYear()) {
          skippedCount++;
          continue;
        }

        // Validate amount is positive
        if (typeof row.Amount !== 'number' || row.Amount <= 0) {
          skippedCount++;
          continue;
        }

        // Create record
        await Record.create({
          name: row.Name,
          amount: row.Amount,
          date: row.Date,
          verified: row.Verified || 'No',
          sheetName
        });

        importedCount++;
      } catch (error) {
        console.error('Error processing row:', error);
        skippedCount++;
        errors.push(error.message);
      }
    }

    res.json({
      message: 'Import completed successfully',
      importedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to import data', error: error.message });
  }
});

router.get('/records', async (req, res) => {
  try {
    const { page = 1, limit = 10, sheetName } = req.query;
    const query = sheetName ? { sheetName } : {};
    
    const records = await Record.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Record.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error: error.message });
  }
});