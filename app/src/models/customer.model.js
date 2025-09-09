const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'O primeiro nome é obrigatório'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'O sobrenome é obrigatório'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Por favor, forneça um endereço de e-mail válido'],
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: AddressSchema,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', CustomerSchema);