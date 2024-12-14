const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const storage = new Storage();
const bucketName = 'tugas-proyek';
const srcFilename = 'serviceAccountKey.json';
const destFilename = path.join(__dirname, 'serviceAccountKey.json');

// Download the service account key file
async function downloadServiceAccountKey() {
  await storage.bucket(bucketName).file(srcFilename).download({ destination: destFilename });
  console.log(`Downloaded ${srcFilename} to ${destFilename}`);
}

// Initialize Firebase Admin SDK after downloading the service account key
downloadServiceAccountKey().then(() => {
  const serviceAccount = require(destFilename);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tugas-proyek-1a2c5.firebaseio.com'
  });

  const db = admin.firestore();

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
}).catch(error => {
  console.error('Failed to download service account key:', error);
});