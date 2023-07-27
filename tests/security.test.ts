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
import { describe, beforeEach, before } from "mocha";
import { ref, set, get } from "firebase/database";
import { readFileSync, createWriteStream } from "node:fs";
import { async } from "@firebase/util";

describe("earth security rules tests", () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    //uses .env variable for FIREBASE_EMULATOR_HOST
    testEnv = await initializeTestEnvironment({
      projectId: "homearthnet",
      database: {
        host: "127.0.0.1",
        port: 4001,
        rules: readFileSync("database.rules.json", "utf8"),
      },
    });
  });

  it("should not allow read access to users data for unauthenticated user", async () => {
    const unAuthDb = testEnv.unauthenticatedContext().database();
    await assertFails(get(ref(unAuthDb, "/users")));
  });

  it("should  allow read access to user data for authenticated user", async () => {
    const authDb = testEnv
      .authenticatedContext("0rrYgiTiCPVPK6jrW16eZE8MDvl2")
      .database();
    await assertSucceeds(
      get(ref(authDb, "/users/0rrYgiTiCPVPK6jrW16eZE8MDvl2"))
    );
  });

  //Todo add tests for write access to users data

  it("should  allow read access to permission data for authenticated user", async () => {
    const authDb = testEnv
      .authenticatedContext("0rrYgiTiCPVPK6jrW16eZE8MDvl2")
      .database("http://127.0.0.1:4001/?ns=homeearthnet");
    const result = (
      await get(ref(authDb, "/permissions/0rrYgiTiCPVPK6jrW16eZE8MDvl2"))
    ).val();
    console.log("result:", result);
    await assertSucceeds(
      get(ref(authDb, "/permissions/0rrYgiTiCPVPK6jrW16eZE8MDvl2"))
    );
  });
  it("should  not allow read access to permission data for unauthenticated user", async () => {
    const unAuthDb = testEnv
      .unauthenticatedContext()
      .database("http://127.0.0.1:4001/?ns=homeearthnet");
    await assertFails(
      get(ref(unAuthDb, "/permissions/0rrYgiTiCPVPK6jrW16eZE8MDvl2"))
    );
  });
  it("should  not allow read access to permission data for different authenticated user", async () => {
    const authDb = testEnv
      .authenticatedContext("0rrYgiTiCPVPK6jrW16eZE8MDvl")
      .database("http://127.0.0.1:4001/?ns=homeearthnet");
    await assertFails(
      get(ref(authDb, "/permissions/0rrYgiTiCPVPK6jrW16eZE8MDvl2"))
    );
  });

  it("should not allow write access to permission data for unauthenticated user", async () => {
    const unAuthDb = testEnv
      .unauthenticatedContext()
      .database("http://127.0.0.1:4001/?ns=homeearthnet");
    await assertFails(
      set(ref(unAuthDb, "/permissions/0rrYgiTiCPVPK6jrW16eZE8MDvl2"), true)
    );
  });
  it("should not allow write access to permission data for authenticated user", async () => {
    const authDb = testEnv
      .authenticatedContext("0rrYgiTiCPVPK6jrW16eZE8MDvl2")
      .database("http://127.0.0.1:4001/?ns=homeearthnet");
    await assertFails(
      set(ref(authDb, "/permissions/0rrYgiTiCPVPK6jrW16eZE8MDvl2"), true)
    );
  });

  it("should allow read access to property only for permitted users", async () => {
    const authDb = testEnv
      .authenticatedContext("0rrYgiTiCPVPK6jrW16eZE8MDvl2")
      .database("http://127.0.0.1:4001/?ns=homeearthnet");
    const value = (await get(ref(authDb, "/properties/"))).val();
    console.log("value:", value);
    await assertSucceeds(get(ref(authDb, "/properties")));
  });
});
