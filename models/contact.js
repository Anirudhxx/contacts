const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    email: String,
    phoneNumber: String,
    linkedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    linkPrecedence: { type: String, enum: ['primary', 'secondary'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

// Remove unique: true from email and phoneNumber fields
ContactSchema.index({ email: 1 }, { sparse: true }); // Optional sparse index for faster duplicate checks on email
ContactSchema.index({ phoneNumber: 1 }, { sparse: true }); // Optional sparse index for faster duplicate checks on phoneNumber

ContactSchema.pre('save', async function (next) {
    const contact = this;

    if (contact.linkPrecedence === 'secondary') {
        // Allow duplicates for secondary contacts
        return next();
    }

    const existingContact = await Contact.findOne({
        phoneNumber: contact.phoneNumber,
        linkPrecedence: 'primary'
    });
    const existingContact1 = await Contact.findOne({
        email: contact.email,
        linkPrecedence: 'primary'
    });
    if (existingContact) {
        throw new Error('Duplicate phone number for primary contact');
    }
    if (existingContact1) {
        throw new Error('Duplicate email for primary contact');
    }
    next();
});

const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;
