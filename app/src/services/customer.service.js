const Customer = require('../models/customer.model');

exports.createCustomer = async (customerData) => {
  const existingCustomer = await Customer.findOne({ email: customerData.email });
  if (existingCustomer) {
    const error = new Error('O endereço de e-mail já está em uso.');
    error.statusCode = 409;
    throw error;
  }

  const customer = new Customer(customerData);
  await customer.save();
  return customer;
};