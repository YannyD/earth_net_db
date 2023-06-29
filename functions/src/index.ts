/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
//todo add complex db user data

//! no 2nd gen for auth
exports.newUserSignUp = functions.auth.user().onCreate(async (user: any) => {
  console.log("user:", user);
  const { uid, email } = user;
  try {
    const entryData = {
      uid: uid,
      email: email || "",
      tokens: [
        {
          fcm_token: "no token",
          fcm_timestamp: admin.database.ServerValue.TIMESTAMP,
        },
      ],
    };
    //Save the entry to the Realtime Database.
    await admin.database().ref(`/users/${uid}`).set(entryData);
    console.log(`New entry created with ID: ${uid}`);
  } catch (error) {
    console.error("Error creating user entry:", error);
  }
});

export const rotateUserPermission = onSchedule("every 3 hours", async () => {
  try {
    const databaseRef = admin.database().ref("/users");
    const snapshot = await databaseRef.once("value");
    const usersSnapshot = snapshot.val();
    console.log("usersSnapshot:", usersSnapshot);

    const users = Object.keys(usersSnapshot);
    console.log("users:", users);
    const initialPermissionsRef = admin.database().ref("/permissions");
    const permissionsSnapshot = await initialPermissionsRef.once("value");
    const permissions = permissionsSnapshot.val();
    console.log("permissions:", permissions);
    //find the index of the currently true user and the next user in line
    const currentIndex = users.findIndex((user: any) => permissions[user]);
    console.log("currentIndex:", currentIndex);
    const nextIndex = (currentIndex + 1) % users.length;
    console.log("nextIndex:", nextIndex);

    //todo is this the most efficient way to do it?
    //create the new permissions object
    const updatedPermissions: Record<any, any> = {};
    users.forEach((user: any, index: number) => {
      updatedPermissions[user] = index === nextIndex;
    });
    console.log("updatedPermissions:", updatedPermissions);

    //update the database
    const newPermissionsRef = admin.database().ref("/permissions");
    await newPermissionsRef.set(updatedPermissions);

    console.log("permissions updated");
  } catch (error) {
    console.error("Error updating permissions:", error);
  }
});
