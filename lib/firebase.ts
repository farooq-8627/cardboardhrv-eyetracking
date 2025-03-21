import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
	apiKey: "AIzaSyDQzEMQtT9afQiMlK-31GxJst9iqK4_8Gg",
	authDomain: "cardboardhrv.firebaseapp.com",
	databaseURL:
		"https://cardboardhrv-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "cardboardhrv",
	storageBucket: "cardboardhrv.appspot.com",
	messagingSenderId: "1098040621778",
	appId: "1:1098040621778:web:5f9e3a5f1c9b5e5e5e5e5e",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
