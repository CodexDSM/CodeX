const customerService = require('../services/customer.service');

exports.createCustomer = async (req, res, next) => {
  try {
    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (error) {
    next(error);
  }
};