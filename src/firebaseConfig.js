// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQ8luSQdSkZ-NjqjKMjmTw20k-SxE_VaA",
  authDomain: "ai-generate-9ddf4.firebaseapp.com",
  projectId: "ai-generate-9ddf4",
  storageBucket: "ai-generate-9ddf4.appspot.com",
  messagingSenderId: "813957503306",
  appId: "1:813957503306:web:a4c1d45547dee199f889b3",
  measurementId: "G-8137874S1R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, ref, uploadBytes, getDownloadURL,db };