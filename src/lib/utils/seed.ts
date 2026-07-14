import { connectDB } from '@/lib/db/mongoose';
import { Settings } from '@/lib/db/models/Settings';
import { User } from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/bcrypt';

export async function ensureSeedData() {
  await connectDB();

  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({
      storeName: 'Nisha Store',
      storeAddress: 'Main Road, Near Bus Stand',
      storeMobile: '9876543210',
      storeEmail: 'nisha@store.com',
      currency: '₹',
      taxRate: 0,
      lowStockThreshold: 5,
      barcodePrefix: 'NS',
      invoicePrefix: 'INV',
      footerNote: 'Thank you for shopping with us!',
      printPaperSize: 'thermal',
      enableGst: false,
    });
  }

  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount === 0) {
    const hashedPassword = await hashPassword('admin123');
    await User.create({
      name: 'Admin',
      email: 'admin@nishastore.com',
      password: hashedPassword,
      role: 'admin',
      active: true,
    });
  }
}
