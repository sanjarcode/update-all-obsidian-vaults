## Update all obsidian vaults

Step 1: Run `npm install`

Step 2: Set the master vault in constants.js

Step 2: Run `node index`

Note: the operation is idempotent (since git-add existing files does not thing, neither does commiting empty staging area)
