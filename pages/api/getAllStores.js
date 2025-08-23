import roles from "@/utils/roles";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { "arrange-by": arrangeBy, "sort-by": sortBy } = req.body;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("StoresRatingApp");
    const collection = db.collection("users");

    // Seed only if no store-owner exists
    const existingStores = await collection.find({ role: roles.STOREOW }).toArray();

    if (existingStores.length === 0) {
      const sampleStores = [
        {
          name: "Taste of Punjab",
          store_name: "Punjab Grills",
          email: "happykitchen.com",
          address: "123 main street",
          overall_rating: 4.5,
          role: roles.STOREOW
        },
        {
          name: "Odysseus Cotton",
          store_name: "Zelenia Roberts Zelenia",
          email: "odysseus@example.com",
          address: "Quo tempor qui duis",
          overall_rating: 4,
          role: roles.STOREOW
        }
      ];
      await collection.insertMany(sampleStores);
      console.log("Seeded 2 sample stores");
    }

    // Fetch all store-owner users
    let dblist = collection.find({ role: roles.STOREOW });
    if (arrangeBy && sortBy) {
      dblist = dblist.sort({ [arrangeBy]: sortBy === "ascending" ? 1 : -1 });
    }

    const list = await dblist.toArray();
    console.log("Fetched stores from DB:", list);

    res.status(200).json({ message: "success", storesList: list });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "error", error: error.message });
  } finally {
    await client.close();
  }
}
