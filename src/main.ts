import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBbWgRDzM8crjxWpiJoF2hdTNXEgXvosy4",
  authDomain: "http-checker-m.firebaseapp.com",
  projectId: "http-checker-m",
  storageBucket: "http-checker-m.appspot.com",
  messagingSenderId: "715675897270",
  appId: "1:715675897270:web:9c96a32b0c198d32650517",
  measurementId: "G-02F7SJRJK2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
