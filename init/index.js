const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongoUrl = "mongodb://127.0.0.1:27017/wanderlustDemo";

main()
  .then(() => {
    console.log("Connection Setup Done");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongoUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "663fd68c65b9e6f882bde99b",
  }));
  Listing.insertMany(initData.data);
  console.log("Inserted Starting Data Successfully");
};

initDB();
