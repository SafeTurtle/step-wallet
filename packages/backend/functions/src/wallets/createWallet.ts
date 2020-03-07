import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import client from '../../utlis/walletClient'
// const functions = fbFunctions.region('asia-northeast1')

const db = admin.firestore()

module.exports = functions.https.onCall(async (data, context) => {
  console.log(context)
  const authData = context.auth
  if (!authData) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }
  const userUid: string = authData.uid

  const userDoc = await db
  .collection('users')
  .doc(userUid)
  .get()

  const walletDoc = await db
  .collection('wallets')
  .doc(userUid)
  .get()

  if (userDoc.data() || walletDoc.data()) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called while authenticated.'
    )
  }

  const cosigner: string = data.cosigner
  const recover: string = data.recover
  const contract: any = client.getConfigData("contract")
  const walletFactory: string = contract.walletFactory

  const nonce: string = await client.contract.WalletFactory.methods.nonce().call()

  //署名用のハッシュの作成
  const hash: string = await client.getSoliditySha3Hash(
    walletFactory,
    nonce,
    cosigner,
    recover
  )

  //authKeyで署名を実行
  const sign: any = client.signAuthorized(hash)

　//signedTxに含める関数の実行データを作成(encodeABI)
  const encodeABI: string = client.contract.WalletFactory.methods.deployCloneWallet(
    sign.v,
    sign.r,
    sign.s,
    nonce,
    cosigner,
    recover
  ).encodeABI()

  const sendData: any = await client.sendSignedTransaction(
    cosigner,
    walletFactory,
    encodeABI
  )
  const wallet: string = sendData.receipt.logs[0].address
  sendData.wallet = wallet

  const pushToken: string = data.pushToken
  const userData: any  = {
    pushToken: pushToken,
    authData: authData
  }

  const batch = db.batch()
  batch.set(db.collection('users').doc(userUid), userData)
  batch.set(db.collection('wallets').doc(userUid), {
    address: wallet,
    failureCount: 0,
    recoveryPhoneAuth: false
  })
  batch.set(db.collection('regPassHashs').doc(userUid),{
    state: false
  })
　await batch.commit()

  return sendData
})
