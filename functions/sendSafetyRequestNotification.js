const functions = require('firebase-functions');
const OneSignal = require('onesignal-node');
const admin = require('firebase-admin');

var client = new OneSignal.Client('e28e6d35-d7b4-41eb-a860-5da4fdc923ea', 'NmU1MDllOWUtMDdlOC00MjJlLTk0NzgtMWU2ZDhmMmE4MDRm');

exports.sendSafetyRequestNotification = functions.firestore
  .document('users/{userId}/safetyRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    const recipientId = context.params.userId;
    const senderId = request.senderId;

    // Get the recipient user's device token
    const recipientSnapshot = await admin.firestore().collection('users').doc(recipientId).get();
    const recipient = recipientSnapshot.data();
    const recipientDeviceToken = recipient.oneSignalId;

    // Get the sender user's name
    const senderSnapshot = await admin.firestore().collection('users').doc(senderId).get();
    const sender = senderSnapshot.data();
    const senderName = sender.name;

    // Prepare the push notification payload
    const notification = {
      contents: {
        'en': `${senderName} sent you a safety request`
      },
      include_player_ids: [recipientDeviceToken],
      data: {
        type: 'safetyRequest',
        senderId: senderId,
        senderName: senderName,
        requestId: context.params.requestId
      }
    };

    // Send the push notification
    client.createNotification(notification)

    console.log('Safety request notification sent successfully');
  });
