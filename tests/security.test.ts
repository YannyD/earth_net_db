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
import assert from "assert";
import { describe, beforeEach } from "mocha";
import { ref, set, get } from "firebase/database";
describe("earth security rules tests", () => {
  let testEnv: RulesTestEnvironment;

  beforeEach(async () => {
    //uses .env variable for FIREBASE_EMULATOR_HOST
    testEnv = await initializeTestEnvironment({
      projectId: "homearthnet",
      database: {
        host: "127.0.0.1",
        port: 4001,
      },
    });
  });

  it("should not allow read access to all users", async () => {
    const alice = testEnv.unauthenticatedContext();
    const db = alice.database("http://127.0.0.1:4001/?ns=homeearthnet");
    get(ref(db, "/users")).then((snapshot) => {
      console.log("snapshot:", snapshot.val());
    });
    await assertFails(get(ref(db, "/users")));
  });
});

/*
Creating and configuring a RulesTestEnvironment with a call to initializeTestEnvironment.
*/
