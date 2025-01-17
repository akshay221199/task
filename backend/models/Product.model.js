import mongose, { Schema } from 'mongoose';

const transactionSchema  = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    sold: {
        type: Boolean,
        default: false
    },
    dateOfSale: {
         type: Date,
          required: true 
        },
    image: {
        type: String,
        required: true
    },

}, { timestamps: true });

export default mongose.model('Transaction', transactionSchema );