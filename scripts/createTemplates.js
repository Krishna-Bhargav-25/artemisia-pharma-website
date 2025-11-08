const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Template data structure for products
const sampleProducts = {
  'IR Pellets': [
    {
      'PRODUCT': 'Omeprazole IR Pellets',
      'STRENGTH/CONCENTRATION': '20mg'
    },
    {
      'PRODUCT': 'Esomeprazole IR Pellets',
      'STRENGTH/CONCENTRATION': '40mg'
    },
    {
      'PRODUCT': 'Pantoprazole IR Pellets',
      'STRENGTH/CONCENTRATION': '20mg'
    }
  ],
  'SR,CR,PR Pellets': [
    {
      'PRODUCT': 'Tramadol SR Pellets',
      'STRENGTH/CONCENTRATION': '100mg'
    },
    {
      'PRODUCT': 'Metformin CR Pellets',
      'STRENGTH/CONCENTRATION': '500mg'
    },
    {
      'PRODUCT': 'Venlafaxine XR Pellets',
      'STRENGTH/CONCENTRATION': '75mg'
    }
  ],
  'EC,DR Pellets': [
    {
      'PRODUCT': 'Omeprazole EC Pellets',
      'STRENGTH/CONCENTRATION': '20mg'
    },
    {
      'PRODUCT': 'Pantoprazole DR Pellets',
      'STRENGTH/CONCENTRATION': '40mg'
    },
    {
      'PRODUCT': 'Esomeprazole DR Pellets',
      'STRENGTH/CONCENTRATION': '20mg'
    }
  ],
  'Granules': [
    {
      'PRODUCT': 'Paracetamol Granules',
      'STRENGTH/CONCENTRATION': '500mg'
    },
    {
      'PRODUCT': 'Ibuprofen Granules',
      'STRENGTH/CONCENTRATION': '200mg'
    },
    {
      'PRODUCT': 'Caffeine Granules',
      'STRENGTH/CONCENTRATION': '50mg'
    }
  ],
  'Inert Core Pellets': [
    {
      'PRODUCT': 'Sugar Spheres NF (16-20 mesh)'
    },
    {
      'PRODUCT': 'Sugar Spheres NF (18-25 mesh)'
    },
    {
      'PRODUCT': 'Microcrystalline Cellulose Spheres (20-35 mesh)'
    },
    {
      'PRODUCT': 'Tartaric Acid Pellets (14-18 mesh)'
    }
  ]
};

// Create Excel files for each category
Object.entries(sampleProducts).forEach(([category, products]) => {
  const ws = xlsx.utils.json_to_sheet(products);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Products');
  
  const filePath = path.join(dataDir, `${category}.xlsx`);
  xlsx.writeFile(wb, filePath);
  console.log(`Created: ${filePath}`);
});

console.log('\nAll template Excel files created successfully!');
console.log('\nYou can now edit these files to add your actual product data.');
console.log('The files are located in the data/ directory.');
