const User = require("../models/User");

const createAdminUser = async () => {
  const userFound = await User.findOne({ email: "1@1" });

  if (userFound) return;

  const newUser = new User({
    username: "admin",
    name: 'Pedro Curich',
    email: "1@1",
  });

  newUser.password = await newUser.encryptPassword("Sa123456Sa");
  const admin = await newUser.save();
  console.log("Admin user created", admin);
};

module.exports = { createAdminUser };