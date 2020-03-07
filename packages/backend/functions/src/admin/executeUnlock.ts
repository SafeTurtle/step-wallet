import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import client from '../../utlis/walletClient'
// const functions = fbFunctions.region('asia-northeast1')

const db = admin.firestore()

module.exports = functions.pubsub.topic('executeUnlock').onPublish(async (message:any) => {
  const deleteCollection = async (db:any, collectionPath:string, batchSize:number) => {
    let collectionRef = db.collection(collectionPath);
    let query = collectionRef.orderBy('__name__').limit(batchSize)
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, batchSize, resolve, reject)
    })
  }

  const deleteQueryBatch = async (db:any, query:any, batchSize:number, resolve:any, reject:any) => {
    query.get()
      .then((snapshot:any) => {
        if (snapshot.size == 0) {
          return 0
        }
        let batch = db.batch()
        snapshot.docs.forEach((doc:any) => {
          batch.delete(doc.ref)
        })
        return batch.commit().then(() => {
          return snapshot.size
        })
      }).then((numDeleted:number) => {
        if (numDeleted === 0) {
          resolve()
          return
        }
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject)
        })
      })
      .catch(reject)
  }

  console.log('executeUnlock: START')
  await deleteCollection(db, client.deleteCollectionPath, client.deleteCollectionBatchSize)
  console.log('executeUnlock: DONE')
})
