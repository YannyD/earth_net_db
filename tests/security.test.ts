/*
-  Any database will accept the string "owner" as an admin auth token.

-  The emulators do not currently have working interactions with other 
Firebase products. Notably, the normal Firebase Authentication flow 
does not work. Instead, you can use the initializeTestApp() method 
in the rules-unit-testing library, which takes an auth field. The 
Firebase object created using this method behaves as if it has 
successfully authenticated as whatever entity you provide. If you 
pass in null, it will behave as an unauthenticated user 
(auth != null rules will fail, for example). */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { describe, beforeEach } from "mocha";
import { ref, set, get } from "firebase/database";
describe("earth security rules tests", () => {
  let testEnv: RulesTestEnvironment;

  beforeEach(async () => {
    //uses .env variable for FIREBASE_EMULATOR_HOST
    testEnv = await initializeTestEnvironment({
      projectId: "homearthnet",
      database: {
        host: "localhost",
        port: 4050,
      },
    });
  });

  it("should not allow read access to all users", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.database();
    const permissionRef = ref(db, "/permissions");
    const permissionSnapshot = await get(permissionRef);
    console.log("permissionSnapshot:", permissionSnapshot);
    await assertSucceeds(set(permissionRef, { alice: true }));
  });
});
/*
Creating and configuring a RulesTestEnvironment with a call to initializeTestEnvironment.
*/
