import { print, track } from "../dist/index.js";

// Simulate two parts of an app sharing one object
const user = track({ name: "Hritik", email: "hritik@example.com" });

function profileFormSave() {
  user.name = "John";
}

function userSettingsSave() {
  user.name = "Jane";
  user.email = "jane@example.com";
}

profileFormSave();
userSettingsSave();

console.log("\n--- print(user, \"name\") ---\n");
print(user, "name");
