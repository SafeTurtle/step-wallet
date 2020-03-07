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

  // const docRefTransactions: any = await db.collection('transactions').doc(userUid)

  const docRefExecutions: any = await db.collection('executions').doc(userUid)
  const executionsDoc: any = await docRefExecutions.get()
  let count: number = 0

  if (executionsDoc.data()) {
    count = executionsDoc.data().count
  }

  if (count >= client.maxNumberOfExecution) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The maximum number of executions has been exceeded.'
    )
  }

  const cosigner: string = data.cosigner
  const wallet: string = data.wallet
  const sigCosigner: any = data.sign
  const hash: string = data.hash
  const executeDataEncodeABI: string = data.data
  const authorized: string = data.authorized
  const nonce: string = data.nonce
  const to: string = data.to
  const value: string = data.value || '0'
  const Wallet: any = client.getCloneableWallet(wallet)
  const cosignerSenderPubKey: string = await client.web3.eth.accounts.recover(hash, sigCosigner.signature)

  if(cosigner === cosignerSenderPubKey) {
    //authKeyで署名を実行
    const sigAuthorized: any = client.signAuthorized(hash)
    const v: any = [sigAuthorized.v, sigCosigner.v]
    const r: any = [sigAuthorized.r, sigCosigner.r]
    const s: any = [sigAuthorized.s, sigCosigner.s]

  　//signedTxに含める関数の実行データを作成(encodeABI)
    const encodeABI: string = await Wallet.methods.invoke(
      v,
      r,
      s,
      nonce,
      authorized,
      executeDataEncodeABI,
      to,
      value
    ).encodeABI()

    const sendData: any = await client.sendEtherSignedTransaction(
      userUid,
      cosigner,
      wallet,
      encodeABI,
      value
    )
    count += 1
    await docRefExecutions.set({
      count: count,
    })

    return sendData

  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'invalid cosigner signature.'
    )
  }
})
