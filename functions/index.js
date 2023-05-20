const { sendFriendRequestNotification } = require('./sendFriendRequestNotification');
const { sendSafetyRequestNotification } = require('./sendSafetyRequestNotification');
const { sendSafetyRequestResponseNotification } = require('./sendSafetyRequestResponseNotification');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendFriendRequestNotification = sendFriendRequestNotification;
exports.sendSafetyRequestNotification = sendSafetyRequestNotification;
exports.sendSafetyRequestResponseNotification = sendSafetyRequestResponseNotification;