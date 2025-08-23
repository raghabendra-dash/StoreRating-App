import { MongoClient } from "mongodb";
import roles from "@/utils/roles";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "error", data: "Method not allowed" });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("StoresRatingApp");
    const collection = database.collection("users");

    const { email, password, name, address, role } = req.body;

    // --- Simulated Google signup response ---
    const result = {
      status: 200,
      data: { idToken: "sample-token", email },
    };

    // Prepare MongoDB document
    const userData = { email, name, address, role: role || roles.USER };

    // Remove store-specific fields if not a store owner
    if (userData.role !== roles.STOREOW) {
      delete userData.store_name;
      delete userData.overall_rating;
    }

    // Insert user into MongoDB
    await collection.insertOne(userData);

    // Respond as if Google signup succeeded
    res.status(200).json({ message: "success", data: result.data });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "error", data: error.message });
  } finally {
    await client.close();
  }
}
