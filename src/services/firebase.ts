import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAgp3fWmbz-O8Pb8oPf6OX6HPAv6XYrUyU',
  authDomain: 'papeleria-de-las-cositas.firebaseapp.com',
  projectId: 'papeleria-de-las-cositas',
  storageBucket: 'papeleria-de-las-cositas.firebasestorage.app',
  messagingSenderId: '658116317680',
  appId: '1:658116317680:web:83e22dfabe52f5bf66cd35',
  measurementId: 'G-YYGH0S02E3',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
