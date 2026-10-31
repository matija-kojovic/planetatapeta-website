import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data/database');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const CONTENT_FILE = path.join(DB_DIR, 'content.json');

// Default Content structure
const defaultContent = {
  hero: {
    titleLine1: "Oživite",
    titleLine2: "Vaše Ideje",
    subtitle: "Premium usluge digitalne štampe prilagođene kreatorima, profesionalcima i kompanijama.",
    buttonText: "Zatražite ponudu"
  },
  header: {
    logoText: "PLANETATAPETA",
    announcement: ""
  },
  theme: {
    primaryColor: "#2d9e9e",    // teal (logo globe)
    secondaryColor: "#1a7a7a",  // deep teal
    accentColor: "#c9a84c",     // warm gold (logo ring)
    bgColor: "#0a1a1a",         // dark teal-tinted bg
    headerBg: "#0a1a1a80",      // semi-transparent
    textColor: "#f0ebe3"        // warm cream
  },
  contact: {
    address: "Božice Divnić 10",
    city: "Beograd",
    zip: "11080",
    email: "djoletodorovic20@gmail.com",
    phone: "+381 62 814 8444",
    instagram: "https://www.instagram.com/planetatapeta/"
  },
  seo: {
    title: "Moderna Štamparija - Digitalna i Ofset Štampa",
    description: "Vrhunske usluge štampe na svim formatima i materijalima."
  }
};

// Helper to ensure database files exist
const initDb = () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    // Optionally seed with mockProducts if creating fresh
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
  }
  
  if (!fs.existsSync(CONTENT_FILE)) {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultContent, null, 2));
  }
};

export const getOrders = () => {
  initDb();
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading orders:", error);
    return [];
  }
};

export const saveOrder = (order) => {
  const orders = getOrders();
  
  // Create new order object with timestamp and ID
  const newOrder = {
    ...order,
    id: `PS-${Math.floor(Math.random() * 900000) + 100000}`,
    createdAt: new Date().toISOString(),
    status: 'U obradi'
  };

  orders.unshift(newOrder); // Add to beginning of array (newest first)
  
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return newOrder;
};

// Functions to manage products
export const getProducts = () => {
  initDb();
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading products:", error);
    return [];
  }
};

export const saveProducts = (products) => {
  initDb();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

// Functions to manage site content/configuration
export const getContent = () => {
  initDb();
  try {
    const data = fs.readFileSync(CONTENT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading content:", error);
    return defaultContent;
  }
};

export const saveContent = (contentData) => {
  initDb();
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(contentData, null, 2));
  return contentData;
};
