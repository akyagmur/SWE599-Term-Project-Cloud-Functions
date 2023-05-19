const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: '3e1bf9b3da58f3',
    pass: 'c3b36ce81e7ea7',
  },
});

exports.sendFriendRequest = functions.firestore
  .document("friendRequests/{requestId}")
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    const senderId = requestData.sender;
    const recipientEmail = requestData.recipient;
    const status = requestData.status;

    if (status !== "pending") {
      // Only send email for new pending friend requests
      return;
    }

    const [senderData, recipientData] = await Promise.all([
      db.collection("users").doc(senderId).get(),
      // get by recepient email
      db.collection("users").where("email", "==", recipientEmail).get(),
    ]);
    const senderEmail = senderData.get("email");
    //const recipientEmail = recipientData.get("email");

    if (recipientData.empty) {
      // Recipient user does not exist, send invitation email
      const mailOptions = {
        from: `Your App <${'test'}>`,
        to: recipientEmail,
        subject: "Invitation to join Your App",
        text: `You've been invited to join Your App! Click the following link to sign up: https://your-app.com/signup?email=${recipientEmail}`,
      };
      await transporter.sendMail(mailOptions);
    } else {
      // Recipient user exists, add friend request to their account
      const recipientId = recipientData.docs[0].id;
      const recipientRef = db.collection("users").doc(recipientId);
      await recipientRef.update({
        friendRequestsReceived: admin.firestore.FieldValue.arrayUnion(senderId),
      });
    }
  });
