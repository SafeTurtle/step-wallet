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

  let count: number = 0
  const userUid: string = authData.uid
  const docRefWallet: any = await db.collection('wallets').doc(userUid)

  const walletDoc: any = await docRefWallet
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

  if (walletDoc.data()) {
    count = walletDoc.data().failureCount
  }

  if (count >= client.maxNumberOfRecovery) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The maximum number of recovery has been exceeded.'
    )
  } else {
    count += 1
    await docRefWallet.update({
      failureCount: count,
    })
  }

  // if(!walletDoc.data().recoveryPhoneAuth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated',
  //     'phone unauthenticated.'
  //   )
  // }

  const wallet: string = data.wallet
  const sigRecovery: any = data.sign
  const newAddress: string = data.new
  const hash: string = data.hash
  const nonce: string = data.nonce
  const recoveryDataEncodeABI: string = data.data
  const Wallet: any = client.getCloneableWallet(wallet)
  const recovery = await Wallet.methods.recover().call()
  const recoveryPublicKey: string = await client.web3.eth.accounts.recover(hash, sigRecovery.signature)

  if(recovery === recoveryPublicKey) {
    //authKeyで署名を実行
    const sigAuthorized: any = client.signAuthorized(hash)
    const v: any = [sigAuthorized.v, sigRecovery.v]
    const r: any = [sigAuthorized.r, sigRecovery.r]
    const s: any = [sigAuthorized.s, sigRecovery.s]

  　//signedTxに含める関数の実行データを作成(encodeABI)
    const encodeABI: string = await Wallet.methods.emergencyRecovery(
      v,
      r,
      s,
      nonce,
      newAddress,
      recoveryDataEncodeABI,
    ).encodeABI()

    const sendData: any = await client.sendSignedTransaction(
      recoveryPublicKey,
      wallet,
      encodeABI
    )
    sendData.wallet = wallet

    await docRefWallet.update({
      failureCount: 0,
    })

    return sendData

  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'invalid recovery signature.'
    )
  }
})
