import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';

// GET all products
export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri učitavanju proizvoda' }, { status: 500 });
  }
}

// POST a new product
export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.title || !data.price || !data.categoryId) {
      return NextResponse.json({ error: 'Neispravni podaci proizvoda' }, { status: 400 });
    }

    const products = getProducts();
    
    const newProduct = {
      ...data,
      id: data.id || `PROD-${Date.now()}`
    };

    products.push(newProduct);
    saveProducts(products);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Product adding error:", error);
    return NextResponse.json({ error: 'Greška pri dodavanju proizvoda' }, { status: 500 });
  }
}

// PUT (update) an existing product
export async function PUT(request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID proizvoda je obavezan' }, { status: 400 });
    }

    const products = getProducts();
    const index = products.findIndex(p => p.id === data.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
    }

    // Update the product keeping original ID
    products[index] = { ...products[index], ...data, id: data.id };
    saveProducts(products);

    return NextResponse.json({ success: true, product: products[index] }, { status: 200 });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: 'Greška pri ažuriranju proizvoda' }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID proizvoda je obavezan' }, { status: 400 });
    }

    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);

    if (products.length === filteredProducts.length) {
      return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
    }

    saveProducts(filteredProducts);

    return NextResponse.json({ success: true, message: 'Proizvod je obrisan' }, { status: 200 });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: 'Greška pri brisanju proizvoda' }, { status: 500 });
  }
}
