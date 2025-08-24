import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
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

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ message: "error", data: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user document
    const userData = {
      email,
      password: hashedPassword,
      name,
      address,
      role: role || roles.USER,
    };

    if (userData.role !== roles.STOREOW) {
      delete userData.store_name;
      delete userData.overall_rating;
    }

    await collection.insertOne(userData);

    res.status(200).json({ message: "success", data: { email, name } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "error", data: error.message });
  } finally {
    await client.close();
  }
}
