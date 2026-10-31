import fs from 'fs';
import path from 'path';

// Pre-existing mock products
import { mockProducts } from './data/mockProducts.js';

const PRODUCTS_FILE = path.join(process.cwd(), 'data/database/products.json');

console.log("Seeding products...");
if (fs.existsSync(PRODUCTS_FILE)) {
  const current = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  if (current.length === 0) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(mockProducts, null, 2));
      console.log(`Successfully seeded ${mockProducts.length} products to DB!`);
  } else {
      console.log("Products DB already populated. Skipping seed.");
  }
} else {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(mockProducts, null, 2));
  console.log(`Successfully created and seeded ${mockProducts.length} products to DB!`);
}
