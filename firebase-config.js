// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyBmoPflokLU-y6-F8qWOMIkKu0tyIo9uEY",
    authDomain: "neuroscale-9a410.firebaseapp.com",
    databaseURL: "https://neuroscale-9a410-default-rtdb.firebaseio.com",
    projectId: "neuroscale-9a410",
    storageBucket: "neuroscale-9a410.firebasestorage.app",
    messagingSenderId: "276747671123",
    appId: "1:276747671123:web:fad509e6ab1ffe05d698a6"
};

// Inicialización (SDK compat para mantenerlo simple)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
console.log("Firebase inicializado correctamente");