const functions = require('firebase-functions');
const OneSignal = require('onesignal-node');
const admin = require('firebase-admin');

var client = new OneSignal.Client('e28e6d35-d7b4-41eb-a860-5da4fdc923ea', 'NmU1MDllOWUtMDdlOC00MjJlLTk0NzgtMWU2ZDhmMmE4MDRm');

exports.sendFriendRequestNotification = functions.firestore
    .document('users/{userId}/contacts/{contactId}')
    .onCreate(async (snap, context) => {
        // send a notification to receiver, if contact.type === 'received'
        const contact = snap.data();
        if (contact.type === 'received') {
            const receiverId = context.params.userId;
            const senderId = context.params.contactId;
            const receiverDoc = await admin.firestore().collection('users').doc(receiverId).get();
            const senderDoc = await admin.firestore().collection('users').doc(senderId).get();

            const receiver = receiverDoc.data();
            const sender = senderDoc.data();

            const receiverPlayerId = receiver.oneSignalId;
            const senderName = sender.name;

            const notification = {
                contents: {
                    'en': `${senderName} sent you a friend request`
                },
                include_player_ids: [receiverPlayerId],
                data: {
                    type: 'friendRequest',
                    senderId: senderId,
                    senderName: senderName
                }
            };

            client.createNotification(notification)
        }
    });