const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

console.log("Testing MongoDB Atlas connection...");
console.log("URI Host:", process.env.MONGO_URI ? process.env.MONGO_URI.split("@")[1]?.split("/")[0] : "Missing MONGO_URI");

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("🎉 SUCCESS: Connected to MongoDB Atlas successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection Failed:", err.message);
        process.exit(1);
    });
