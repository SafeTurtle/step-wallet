
import { Expo } from 'expo-server-sdk'
const expo = new Expo()

const sendPushNotification = async (_pushToken: string, _title: string, _body: string, _data: any) => {
	// {
	// 	"sound": "default",
	// 	"title": "hello",
	// 	"body": "証明書を受信しました。"
	// },
	let messages:any = []
	messages.push({
		to: _pushToken,
		sound: "default",
		title: _title,
		body: _body,
		data: _data,
	})
	let chunks = expo.chunkPushNotifications(messages)
	let tickets:any = [];
	(async () => {
	for (let chunk of chunks) {
		try {
			let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
			tickets.push(...ticketChunk)
		} catch (error) {
			console.error(error)
		}
	}
	})();
	let receiptIds = []
	for (let ticket of tickets) {
		if (ticket.id) {
			receiptIds.push(ticket.id)
		}
	}
	let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
	(async () => {
	for (let chunk of receiptIdChunks) {
		try {
			let receipts: any = await expo.getPushNotificationReceiptsAsync(chunk)
			for (let receipt of receipts) {
				if (receipt.status === 'ok') {
					continue
				} else if (receipt.status === 'error') {
					console.error(`There was an error sending a notification: ${receipt.message}`)
					if (receipt.details && receipt.details.error) {
						console.error(`The error code is ${receipt.details.error}`)
					}
				}
			}
		} catch (error) {
		console.error(error)
		}
	}
	})();

  return messages
}

export default {
  sendPushNotification: sendPushNotification
}