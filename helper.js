const Contact = require('../models/contact');

async function ensureSecondaryContactExists(email, phoneNumber, primaryContactId) {
    const existingSecondaryContact = await Contact.findOne({
        linkedId: primaryContactId,
        email,
        phoneNumber,
        linkPrecedence: 'secondary'
    }).lean();

    if (!existingSecondaryContact) {
        const newSecondaryContact = new Contact({
            email,
            phoneNumber,
            linkedId: primaryContactId,
            linkPrecedence: 'secondary'
        });
        await newSecondaryContact.save();
    }
}

async function formResponse(primaryContact) {
    const secondaryContacts = await Contact.find({ linkedId: primaryContact._id, linkPrecedence: 'secondary' }).lean();
    const secondaryContactIds = secondaryContacts.map(contact => contact._id);

    const allEmails = [
        primaryContact.email,
        ...secondaryContacts.map(contact => contact.email).filter(email => email)
    ].filter(email => email);

    const allPhoneNumbers = [
        primaryContact.phoneNumber,
        ...secondaryContacts.map(contact => contact.phoneNumber)
    ].filter(phoneNumber => phoneNumber);

    const uniquePhoneNumbers = [...new Set(allPhoneNumbers)];

    return {
        primaryContactId: primaryContact._id,
        emails: allEmails,
        phoneNumbers: uniquePhoneNumbers,
        secondaryContactIds
    };
}
module.exports = {
    ensureSecondaryContactExists,formResponse
};