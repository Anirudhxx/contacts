const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Contact = require('./models/contact');
const { ensureSecondaryContactExists,formResponse } = require('./helper');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

app.use(express.json());   
const Contact = mongoose.model('Contact', ContactSchema);
  
app.post('/identify', async (req, res) => {
    const { email, phoneNumber } = req.body;
    
    // Input validation 
    if ((!email && !phoneNumber) || (email && !email.trim()) || (phoneNumber && !phoneNumber.trim())) {
      return res.status(400).json({ error: 'Invalid email or phoneNumber' });
    }
    try {
      let primaryContact;
      if (email && !phoneNumber) {
        // Check for primary contact with email
        primaryContact = await Contact.findOne({ email, linkPrecedence: 'primary' }).lean();
        if(!primaryContact){
            secondaryContact = await Contact.findOne({ email, linkPrecedence: 'secondary' }).lean();
        if (secondaryContact) {
            // Accessing the primary contact ID from the secondary contact
            const primaryContactId = secondaryContact.linkedId;
            // Finding the primary contact using the ID
            primaryContact = await Contact.findById(primaryContactId).lean();
          }
        else{
            return res.status(200).json({ contact: { message: 'No contacts found for this email id' } }); 
        }
        }
      } else if (phoneNumber && !email) {
        // Checking for primary contact with phone number
        primaryContact = await Contact.findOne({ phoneNumber, linkPrecedence: 'primary' }).lean();
        if(!primaryContact){
            secondaryContact = await Contact.findOne({ phoneNumber, linkPrecedence: 'secondary' }).lean();
        if (secondaryContact) {
            // Accessing the primary contact ID from the secondary contact
            const primaryContactId = secondaryContact.linkedId;
            // to find the primary contact using the ID
            primaryContact = await Contact.findById(primaryContactId).lean();
          }
        else{
            return res.status(200).json({ contact: { message: 'No contacts found for this phone number' } }); 
        }
        }
      } else if (email && phoneNumber) {
        // Both email and phone number are provided
  
        // 1. Check for primary contact with matching email
        primaryContact1 = await Contact.findOne({ email, linkPrecedence: 'primary' }).lean();
        primaryContact2 = await Contact.findOne({ phoneNumber, linkPrecedence: 'primary' }).lean();

        if (primaryContact1 && !primaryContact2) {
          // 2. No primary contact with email, check for phone number
          primaryContact = primaryContact1;
          console.log("email contact found");
          const existingSecondaryContact = await Contact.findOne({
            linkedId: primaryContact._id,
            email,
            phoneNumber,
            linkPrecedence: 'secondary'
          }).lean();
  
          if (!existingSecondaryContact) {
            // 4. No existing secondary contact, create a new one
            const newSecondaryContact = new Contact({
              email,
              phoneNumber,
              linkedId: primaryContact._id,
              linkPrecedence: 'secondary'
            });
            await newSecondaryContact.save();
          }
        }
        else if(!primaryContact1 && primaryContact2){
            primaryContact = primaryContact2;
            console.log("phone Number contact found");
            const existingSecondaryContact = await Contact.findOne({
                linkedId: primaryContact._id,
                email,
                phoneNumber,
                linkPrecedence: 'secondary'
              }).lean();
      
              if (!existingSecondaryContact) {
                // 4. No existing secondary contact, create a new one
                const newSecondaryContact = new Contact({
                  email,
                  phoneNumber,
                  linkedId: primaryContact._id,
                  linkPrecedence: 'secondary'
                });
                await newSecondaryContact.save();
              }
        }
        else if(primaryContact1 && primaryContact2){
            primaryContact = primaryContact1;
            //update primaryContact2 to secondary contact and link it to primaryContact1
            await Contact.updateOne({ _id: primaryContact2._id }, {
                $set: {
                  linkPrecedence: 'secondary',
                  linkedId: primaryContact1._id // Link to the existing primary contact (primaryContact1)
                }
              });     
        }
  
        if (!primaryContact) {
          // 5. No primary contact found, create a new one
  
          const newPrimaryContact = new Contact({
            email,
            phoneNumber,
            linkPrecedence: 'primary'
          });
          primaryContact = await newPrimaryContact.save();
          console.log("New Primary Contact");
          // Response formation (no secondary contacts yet)
          const response = {
            primaryContactId: primaryContact._id,
            emails: primaryContact.email ? [primaryContact.email] : [],
            phoneNumbers: primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [],
            secondaryContactIds: []
          };
  
          return res.status(200).json({ contact: response });
        }
      } 
        if (primaryContact) {
            // Primary contact found based on email or phone number
            console.log(primaryContact);
            const response = formResponse(primaryContact);
      
            return res.status(200).json({ contact: response });
          } else {
            // No primary contact found based on email or phone number (existing logic remains unchanged)
            return res.status(200).json({ contact: { message: 'No primary contact found' } });
        }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

