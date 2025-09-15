import mongoose from 'mongoose';
import TesdaEnrollment from './TesdaEnrollment.model.js';
import Order from './Order.model.js';
import Seller from './Seller.model.js';
import JobApplication from './JobApplication.model.js';
import Employer from './Employer.model.js';
import Worker from './Worker.model.js';
import Customer from './Customer.model.js';

export const createIndexes = async () => {
  try {
    // Indexes for notification queries
    await TesdaEnrollment.createIndexes({ userId: 1, status: 1 });
    await Order.createIndexes({ sellerId: 1, status: 1 });
    await Order.createIndexes({ buyerId: 1, status: 1 });
    await JobApplication.createIndexes({ employerId: 1, status: 1 });
    await JobApplication.createIndexes({ applicantId: 1, status: 1 });
    await Seller.createIndexes({ userId: 1 });
    await Employer.createIndexes({ userId: 1 });
    await Worker.createIndexes({ userId: 1 });
    await Customer.createIndexes({ userId: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};