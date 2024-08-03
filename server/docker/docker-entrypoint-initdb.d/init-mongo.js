// init-mongo.js
print("Start creating user and collection...");
db = db.getSiblingDB("chesswiz"); // Replace with your database name

db.createUser({
  user: "chesswiz", // Replace with your username
  pwd: "chesswiz", // Replace with your password
  roles: [
    {
      role: "readWrite",
      db: "chesswiz" // Replace with your database name
    }
  ]
});

print("executed");
// Replace with your collection name if you need to create one
