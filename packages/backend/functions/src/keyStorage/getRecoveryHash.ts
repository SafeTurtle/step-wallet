import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import client from '../../utlis/walletClient'
// const functions = fbFunctions.region('asia-northeast1')

const db = admin.firestore()

module.exports = functions.https.onCall(async (data, context) => {
  const authData = context.auth
  if (!authData) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const userUid: string = authData.uid

  const walletDoc: any = await db
  .collection('wallets')
  .doc(userUid)
  .get()

  const userDoc: any = await db
  .collection('users')
  .doc(userUid)
  .get()

  if (!userDoc.data() || !walletDoc.data()) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called while authenticated.'
    )
  }

  const wallet: string = walletDoc.data().address
  const contract: any = client.getConfigData("contract")
  const keyStorage: string = contract.keyStorage
  const hashWord: string = client.hashWord
  const nonce: string = await client.contract.KeyStorage.methods.nonce().call()

  //署名用のハッシュの作成
  const hash: string = await client.getSoliditySha3Hash(
    keyStorage,
    nonce,
    wallet,
    hashWord
  )

  //authKeyで署名を実行
  const sign: any = client.signAuthorized(hash)

  const v = sign.v
  const r = sign.r
  const s = sign.s

  //ユーザーの署名を復元
  const crypted = await client.contract.KeyStorage.methods.getStorage(
    v,
    r,
    s,
    nonce,
    wallet,
    hashWord
  ).call()

  const sendData = {
    wallet: wallet,
    crypted: crypted,
    unregistered: false
  }

  return sendData
})
