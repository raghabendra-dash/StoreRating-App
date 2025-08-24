import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

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

    const { email, password } = req.body;

    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "error", data: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(200).json({ message: "error", data: "Invalid password" });
    }

    // Remove password before sending
    const { password: pw, ...userData } = user;

    res.status(200).json({ message: "success", userData });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ message: "error", data: "Internal server error" });
  } finally {
    client.close();
  }
}
