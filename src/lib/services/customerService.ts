import { Customer } from '@/lib/db/models/Customer';
import type { ICustomer } from '@/lib/db/models/Customer';

export async function getAllCustomers(search?: string) {
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }
  return Customer.find(query).sort({ name: 1 }).lean();
}

export async function getCustomerById(id: string) {
  return Customer.findById(id).lean();
}

export async function getCustomerByMobile(mobile: string) {
  return Customer.findOne({ mobile }).lean();
}

export async function createCustomer(data: Partial<ICustomer>) {
  return Customer.create(data);
}

export async function updateCustomer(id: string, data: Partial<ICustomer>) {
  return Customer.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteCustomer(id: string) {
  return Customer.findByIdAndDelete(id);
}
