import { connect } from 'packages/mongo';

const db = await connect('mongodb://localhost:3001');
const bulk = db.users.initializeOrderedBulkOp();

const users = db.users
  .find({ 'services.email.verificationTokens.0': { $exists: true } })
  .toArray();

for (const user of users) {
  const tokens = {};

  // Meteor can hold multiple tokens for a single email, we only need the last
  for (const token of user.services.email.verificationTokens) {
    tokens[token.address] = token.token;
  }

  // store the verification tokens under 'doc.emails.$.token'
  for (const email of Object.keys(tokens)) {
    bulk
      .find({ _id: user._id, 'emails.address': email })
      .updateOne({ $set: { 'emails.$.token': tokens[email] } });
  }

  // and remove the 'services.email.verificationTokens' property
  bulk
    .find({ _id: user._id })
    .updateOne({ $unset: { 'services.email.verificationTokens': true } });
}

// only execute the bulk when there are operations.
if (bulk.nUpdateOps) {
  await bulk.execute();
}
