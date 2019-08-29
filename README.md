## Fluree Authority Demo

This demo is designed for the downloadable Fluree versions 0.9.5 or above. It is an over-simplified, demonstration of how an actor in a network might use the authority feature.

### Requisites

- [FlureeDB](https://fluree-releases-public.s3.amazonaws.com/fluree-latest.zip)
- Java 8 or above
- Node
- NPM

### Set-up

1. Start up a downloadable version of Fluree, 0.9.5 or above. 
2. Create a new database.
3. Update `./appConfig.js` to match you IP address, network, and database.
4. Issue the body of `./data/schema.json` to create the schema.
5. Issue the body of `./data/seed.json` to add the seed data.
6. Run `npm install` in the `authority-demo` directory to install all depended-on packages.
7. Run `npm start`.

### Demo

The demo shows a situation where users `hr1`, `hr2`, and `hr3` do not manage their own private keys, rather they have given `sysadmin` authority to sign transactions on their behalf. `hr1`, `hr2`, and `hr3` are the auth records for any transactions they initiate, but `sysadmin` is the authority. 

In the demo, `hr1`, `hr2`, and `hr3` must log in, which is how `sysadmin` confirms that they are who they claim to be. The decision of how to verify user identities depends on the authority. The video about this demo talks in greater detail about the pros and cons of this arrangement.

When `hr1`, `hr2`, or `hr3` submit a new `todo`, the `todo` is added to the list, and the transaction creating that `todo` records that `sysadmin` is the `authority` that signed the transaction, but `hr1`, `hr2`, or `hr3` were the auth record that initiated the transaction. 
