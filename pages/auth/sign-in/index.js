import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const client = new MongoClient(uri);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "error", data: "Email and password are required" });
    }

    await client.connect();
    const database = client.db("StoresRatingApp");
    const collection = database.collection("users");
    
    // Find user by email
    const user = await collection.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "error", data: "Invalid email or password" });
    }
    
    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "error", data: "Invalid email or password" });
    }
    
    // Remove password from user data before sending to client
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ 
      message: "success", 
      data: { id: user._id.toString() },
      userData: userWithoutPassword
    });
    
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "error", data: "Internal server error" });
  } finally {
    await client.close();
  }
}
