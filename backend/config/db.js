const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const host = process.env.MONGO_URI.split("@")[1]?.split("/")[0] || "database";
        console.log(`✅ MongoDB Atlas connected successfully to: ${host}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);

        if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
            console.error("\n⚠️  ATLAS AUTHENTICATION ERROR:");
            console.error("👉 MongoDB Atlas rejected the credentials in your MONGO_URI.");
            console.error("👉 In MongoDB Atlas: Go to Security -> Database Access -> Verify user exists and reset password.\n");
        }

        // In local development, fallback to local MongoDB instance so the app doesn't crash
        if (process.env.NODE_ENV !== "production") {
            try {
                const localUri = "mongodb://127.0.0.1:27017/hrshield_db";
                console.log("🔄 Falling back to Local MongoDB for development...");
                await mongoose.connect(localUri);
                console.log("✅ Successfully connected to Local MongoDB (mongodb://127.0.0.1:27017/hrshield_db)");
                return;
            } catch (localErr) {
                console.error("❌ Local MongoDB fallback also failed:", localErr.message);
            }
        }

        process.exit(1);
    }
};

module.exports = connectDB;