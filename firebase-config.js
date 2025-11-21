// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBI4O0d_Mec38FDiuhirujCnX99PFKiXW4",
  authDomain: "projekt-pc.firebaseapp.com",
  databaseURL: "https://projekt-pc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projekt-pc",
  storageBucket: "projekt-pc.appspot.com",
  messagingSenderId: "90098431634",
  appId: "1:90098431634:web:7cb61800d03533c2a6984b",
  measurementId: "G-59YH8W8W1L"
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exportar servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Configuración de Firestore
db.settings({
  timestampsInSnapshots: true
});

console.log('Firebase configurado correctamente');