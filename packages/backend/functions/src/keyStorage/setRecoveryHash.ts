import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import client from '../../utlis/walletClient'
// const functions = fbFunctions.region('asia-northeast1')
const db = admin.firestore()

module.exports = functions.https.onCall(async (data, context) => {
  const authData = context.auth
  console.log(authData)
  if (!authData) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const userUid: string = authData.uid

  const docRefHash: any = await db.collection('regPassHashs').doc(userUid)
  const hashDoc = await docRefHash.get()

  const walletDoc: any = await db
  .collection('wallets')
  .doc(userUid)
  .get()

  const userDoc: any = await db
  .collection('users')
  .doc(userUid)
  .get()

  if (!userDoc.data() || !walletDoc.data() || !hashDoc.data()) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Not document.'
    )
  }

  const sigCosigner: any = data.sign
  const cosigner: string = data.cosigner
  const wallet: string = data.wallet
  const hash: string = data.hash
  const nonce: string = data.nonce
  const crypted = data.crypted.toString()
  const contract: any = client.getConfigData("contract")
  const keyStorage: string = contract.keyStorage

  //ユーザーの署名を復元
  const cosignerSenderPubKey: string = await client.web3.eth.accounts.recover(hash, sigCosigner.signature)

  if(cosigner === cosignerSenderPubKey) {
    //authKeyで署名を実行
    const sigAuthorized: any = client.signAuthorized(hash)
    const v: any = [sigAuthorized.v, sigCosigner.v]
    const r: any = [sigAuthorized.r, sigCosigner.r]
    const s: any = [sigAuthorized.s, sigCosigner.s]

　  //signedTxに含める関数の実行データを作成(encodeABI)
    const encodeABI = await client.contract.KeyStorage.methods.setStorage(
      v,
      r,
      s,
      nonce,
      wallet,
      crypted
    ).encodeABI()

    const sendData: any = await client.sendSignedTransaction(
      cosigner,
      keyStorage,
      encodeABI
    )

    await docRefHash.set({
      state: true
    })

    return sendData

  } else {
    console.log("error")
    return { states: "error"}
  }
})
