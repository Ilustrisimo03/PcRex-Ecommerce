import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBltSSXJ7B1N-3ttYPIi6TBHGMZDS7H2ME",
  authDomain: "auth-87757.firebaseapp.com",
  databaseURL: "https://auth-87757-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "auth-87757",
  storageBucket: "auth-87757.appspot.com",
  messagingSenderId: "644919794030",
  appId: "1:644919794030:android:13408dc8a91c4b4191c97f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for session persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage };