const functions = require('firebase-functions');
const OneSignal = require('onesignal-node');
const admin = require('firebase-admin');

var client = new OneSignal.Client('e28e6d35-d7b4-41eb-a860-5da4fdc923ea', 'NmU1MDllOWUtMDdlOC00MjJlLTk0NzgtMWU2ZDhmMmE4MDRm');

exports.sendSafetyRequestResponseNotification = functions.firestore
  .document('users/{userId}/safetyResponses/{responseId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    const senderId = context.params.userId;
    const senderUser = await admin.firestore().collection('users').doc(senderId).get();
    const senderName = senderUser.data().name;

    // find pending safetyRequests in user's safetyRequests collection
    const pendingSafetyRequests = await admin.firestore().collection('users').doc(senderId).collection('safetyRequests').where('status', '==', 'pending').get();
    // get unique senderIds from pending safetyRequests
    const senderIds = pendingSafetyRequests.docs.map(doc => doc.data().senderId);
    // set all pending safetyRequests to 'responded'
    pendingSafetyRequests.forEach(doc => {
      doc.ref.update({ status: 'responded' });
    });

    // send push notifications to all senders
    senderIds.forEach(async (recipientId) => {
      const recipientUser = await admin.firestore().collection('users').doc(recipientId).get();
      const recipientUserOneSignalId = recipientUser.data().oneSignalId;
      // Get the recipient user's device token
      const recipientSnapshot = await admin.firestore().collection('users').doc(recipientId).get();
      const recipient = recipientSnapshot.data();

      const notification = {
        heading: {
          'en': `${senderName} responded to your safety request`,
          'tr': '${senderName} guvende misin isteğinize yanıt verdi'
        },
        contents: {
          'en': `${senderName}'s status: ${request.status}`,
          'tr': `${senderName}'nin durumu: ${request.status}`
        },
        include_player_ids: [recipientUserOneSignalId],
        data: {
          type: 'safetyRequest',
          senderId: senderId,
          senderName: senderName
        }
      };
      client.createNotification(notification)
    });

    console.log('Safety request notification sent successfully');
  });
