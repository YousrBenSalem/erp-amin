import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@amin.tn' },
    update: {},
    create: {
      email: 'admin@amin.tn',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Poivres' }, update: {}, create: { name: 'Poivres' } }),
    prisma.category.upsert({ where: { name: 'Piments' }, update: {}, create: { name: 'Piments' } }),
    prisma.category.upsert({ where: { name: 'Épices moulues' }, update: {}, create: { name: 'Épices moulues' } }),
    prisma.category.upsert({ where: { name: 'Épices entières' }, update: {}, create: { name: 'Épices entières' } }),
    prisma.category.upsert({ where: { name: 'Mélanges' }, update: {}, create: { name: 'Mélanges' } }),
    prisma.category.upsert({ where: { name: 'Herbes' }, update: {}, create: { name: 'Herbes' } }),
    prisma.category.upsert({ where: { name: 'Épices premium' }, update: {}, create: { name: 'Épices premium' } }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create suppliers
  const sup1 = await prisma.supplier.upsert({
    where: { id: 'supplier-1' },
    update: {},
    create: {
      id: 'supplier-1',
      name: 'Épices Orient SARL',
      contactName: 'Mohamed Ali',
      phone: '+216 71 234 567',
      email: 'contact@epices-orient.tn',
      address: 'Sousse, Tunisie',
    },
  }).catch(async () => prisma.supplier.create({
    data: {
      name: 'Épices Orient SARL',
      contactName: 'Mohamed Ali',
      phone: '+216 71 234 567',
      email: 'contact@epices-orient.tn',
      address: 'Sousse, Tunisie',
    }
  }));

  const sup2 = await prisma.supplier.create({
    data: {
      name: 'Spices Global Import',
      contactName: 'Fatma Ben Salem',
      phone: '+216 73 456 789',
      email: 'info@spicesglobal.tn',
      address: 'Sfax, Tunisie',
    },
  }).catch(() => null);
  
  console.log('✅ Suppliers created');

  // Create products
  const spicesData = [
    { name: 'Poivre Noir', ref: 'EP-00001', catIdx: 0, unit: 'kg', pa: 12, pd: 18, pg: 15, stock: 50, min: 10 },
    { name: 'Poivre Blanc', ref: 'EP-00002', catIdx: 0, unit: 'kg', pa: 14, pd: 22, pg: 18, stock: 30, min: 8 },
    { name: 'Poivre Rouge', ref: 'EP-00003', catIdx: 0, unit: 'kg', pa: 10, pd: 16, pg: 13, stock: 40, min: 10 },
    { name: 'Piment Rouge', ref: 'EP-00004', catIdx: 1, unit: 'kg', pa: 8, pd: 14, pg: 11, stock: 60, min: 15 },
    { name: 'Paprika', ref: 'EP-00005', catIdx: 1, unit: 'kg', pa: 9, pd: 15, pg: 12, stock: 45, min: 10 },
    { name: 'Curcuma', ref: 'EP-00006', catIdx: 2, unit: 'kg', pa: 7, pd: 12, pg: 9, stock: 5, min: 10 },
    { name: 'Cumin', ref: 'EP-00007', catIdx: 2, unit: 'kg', pa: 11, pd: 20, pg: 16, stock: 80, min: 15 },
    { name: 'Coriandre', ref: 'EP-00008', catIdx: 2, unit: 'kg', pa: 8, pd: 13, pg: 10, stock: 35, min: 10 },
    { name: 'Gingembre', ref: 'EP-00009', catIdx: 2, unit: 'kg', pa: 10, pd: 16, pg: 13, stock: 25, min: 8 },
    { name: 'Cannelle', ref: 'EP-00010', catIdx: 3, unit: 'kg', pa: 15, pd: 24, pg: 20, stock: 20, min: 5 },
    { name: 'Clou de Girofle', ref: 'EP-00011', catIdx: 3, unit: 'kg', pa: 25, pd: 40, pg: 35, stock: 0, min: 5 },
    { name: 'Cardamome', ref: 'EP-00012', catIdx: 3, unit: 'kg', pa: 30, pd: 50, pg: 42, stock: 2, min: 5 },
    { name: 'Anis', ref: 'EP-00013', catIdx: 3, unit: 'kg', pa: 9, pd: 15, pg: 12, stock: 30, min: 8 },
    { name: 'Safran', ref: 'EP-00014', catIdx: 6, unit: 'g', pa: 200, pd: 350, pg: 300, stock: 500, min: 100 },
    { name: 'Mélange Kefta', ref: 'EP-00015', catIdx: 4, unit: 'kg', pa: 10, pd: 18, pg: 14, stock: 40, min: 10 },
    { name: 'Mélange Couscous', ref: 'EP-00016', catIdx: 4, unit: 'kg', pa: 8, pd: 14, pg: 11, stock: 55, min: 12 },
    { name: 'Mélange Harissa', ref: 'EP-00017', catIdx: 4, unit: 'kg', pa: 7, pd: 12, pg: 9, stock: 70, min: 15 },
    { name: 'Romarin', ref: 'EP-00018', catIdx: 5, unit: 'kg', pa: 12, pd: 20, pg: 16, stock: 15, min: 5 },
    { name: 'Thym', ref: 'EP-00019', catIdx: 5, unit: 'kg', pa: 10, pd: 17, pg: 14, stock: 20, min: 5 },
    { name: 'Fenouil', ref: 'EP-00020', catIdx: 3, unit: 'kg', pa: 9, pd: 14, pg: 11, stock: 28, min: 8 },
  ];

  const products = [];
  for (const s of spicesData) {
    const p = await prisma.product.upsert({
      where: { reference: s.ref },
      update: {},
      create: {
        name: s.name,
        reference: s.ref,
        categoryId: categories[s.catIdx].id,
        unit: s.unit,
        prixAchat: s.pa,
        prixVenteDetail: s.pd,
        prixVenteGros: s.pg,
        stockActuel: s.stock,
        stockMinimum: s.min,
      },
    });
    products.push(p);
  }
  console.log('✅ Products created:', products.length);

  // Create customers
  const wholesaleCustomers = [
    { name: 'ABC Market', company: 'ABC Market SARL', phone: '+216 71 111 111', type: 'WHOLESALE', creditLimit: 5000 },
    { name: 'Supermarché El Amal', company: 'El Amal SA', phone: '+216 71 222 222', type: 'WHOLESALE', creditLimit: 8000 },
    { name: 'Restaurant Le Palmier', company: 'Le Palmier SNC', phone: '+216 71 333 333', type: 'WHOLESALE', creditLimit: 3000 },
    { name: 'Hôtel Médina', company: 'Médina Hotels', phone: '+216 71 444 444', type: 'WHOLESALE', creditLimit: 10000 },
    { name: 'Traiteur Ben Hamida', company: 'BH Traiteur', phone: '+216 71 555 555', type: 'WHOLESALE', creditLimit: 4000 },
  ];

  const retailCustomers = [
    { name: 'Ahmed Mansour', phone: '+216 22 111 111', type: 'RETAIL' },
    { name: 'Fatma Chaabane', phone: '+216 22 222 222', type: 'RETAIL' },
    { name: 'Mohamed Trabelsi', phone: '+216 22 333 333', type: 'RETAIL' },
    { name: 'Leila Bouzid', phone: '+216 22 444 444', type: 'RETAIL' },
    { name: 'Khaled Ben Amor', phone: '+216 22 555 555', type: 'RETAIL' },
  ];

  const allCustomers = [];
  for (const c of [...wholesaleCustomers, ...retailCustomers]) {
    const cust = await prisma.customer.create({
      data: {
        name: c.name,
        company: (c as any).company,
        phone: c.phone,
        type: c.type as any,
        creditLimit: (c as any).creditLimit || 0,
        balance: 0,
      },
    });
    allCustomers.push(cust);
  }
  console.log('✅ Customers created:', allCustomers.length);

  // Create settings
  await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Société AMIN',
      address: 'Tunis, Tunisie',
      phone: '+216 71 000 000',
      email: 'contact@amin.tn',
      currency: 'DT',
      taxRate: 19,
      allowNegativeStock: false,
    },
  }).catch(async () => {
    await prisma.setting.create({
      data: {
        companyName: 'Société AMIN',
        address: 'Tunis, Tunisie',
        phone: '+216 71 000 000',
        email: 'contact@amin.tn',
        currency: 'DT',
        taxRate: 19,
        allowNegativeStock: false,
      },
    });
  });
  console.log('✅ Settings created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Login: admin@amin.tn');
  console.log('🔑 Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
