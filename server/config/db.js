import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const useLocal = process.env.USE_LOCAL_DB === "true";
    const uri = useLocal ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI_CLOUD;
      await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected (${useLocal ? "local" : "cloud"})`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 