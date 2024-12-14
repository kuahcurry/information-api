const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tugas-proyek-1a2c5.firebaseio.com'
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());

// Retrieve information from Firebase
app.get('/data/:id', async (req, res) => {
  try {
    const doc = await db.collection('informasi').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('No such document!');
    }
    res.status(200).send(doc.data());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Write information to Firebase
app.post('/data', async (req, res) => {
  try {
    const data = req.body;
    data.timestamp = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('informasi').add(data);
    res.status(201).send(`Document written with ID: ${docRef.id}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});