const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const dataDir = path.join(__dirname, '..', 'data');

/**
 * Product category to file mapping
 */
const PRODUCT_FILES = {
  'ir-pellets': 'IR Pellets.xlsx',
  'sr-cr-pr-pellets': 'SR,CR,PR Pellets.xlsx',
  'dr-ec-pellets': 'EC,DR Pellets.xlsx',
  'granules': 'Granules.xlsx',
  'combinations': 'Combinations.xlsx',
  'inert-core-pellets': 'Inert Core Pellets.xlsx'
};

/**
 * Load product data from Excel file
 * @param {string} category - Product category key
 * @returns {Array} Array of product objects
 */
function loadProductData(category) {
  const fileName = PRODUCT_FILES[category];
  if (!fileName) {
    console.warn(`Unknown product category: ${category}`);
    return [];
  }

  const filePath = path.join(dataDir, fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.warn(`Product file not found: ${filePath}`);
    return [];
  }

  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    // Assumes first row is headers
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    return data;
  } catch (error) {
    console.error(`Error reading Excel file ${fileName}:`, error.message);
    return [];
  }
}

/**
 * Get all product categories with their metadata
 */
function getCategories() {
  return [
    {
      key: 'ir-pellets',
      title: 'IR Pellets',
      description: 'Immediate Release',
      route: '/products/ir-pellets'
    },
    {
      key: 'sr-cr-pr-pellets',
      title: 'SR/CR/PR Pellets',
      description: 'Sustained/Controlled/Prolonged Release',
      route: '/products/sr-cr-pr-pellets'
    },
    {
      key: 'dr-ec-pellets',
      title: 'EC/DR Pellets',
      description: 'Enteric-Coated/Delayed Release',
      route: '/products/dr-ec-pellets'
    },
    {
      key: 'granules',
      title: 'Granules',
      description: 'High-quality pharmaceutical granules',
      route: '/products/granules'
    },
      {
      key: 'combinations',
      title: 'Combinations',
      description: 'Custom multi-layered pellet and granule formulations, blends and therapeutic combinations',
      route: '/products/combinations'
    },
    {
      key: 'inert-core-pellets',
      title: 'Inert Core Pellets',
      description: 'High-quality Inert Core Pellets',
      route: '/products/inert-core-pellets'
    }
  ];
}

module.exports = {
  loadProductData,
  getCategories,
  PRODUCT_FILES
};
