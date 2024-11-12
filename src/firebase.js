import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyB1HX8dEt3BRrIDxY-0dxlPtgsBWQ7MO7w",
  authDomain: "test-react-trade-cb506.firebaseapp.com",
  projectId: "test-react-trade-cb506",
  storageBucket: "test-react-trade-cb506.firebasestorage.app",
  messagingSenderId: "1083256713226",
  appId: "1:1083256713226:web:137426b2bbb447799f6ff3",
  measurementId: "G-WFYNJS6B0Q",
};
const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);



export { firestoreDb };
