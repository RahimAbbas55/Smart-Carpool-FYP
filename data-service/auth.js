import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

export async function getUserData() {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found.");
    }

    const serverURL =
      Platform.OS === "android"
        ? "http://10.0.2.2:50/api/passenger/userData"
        : "http://localhost:50/api/passenger/userData";

    const response = await fetch(serverURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}