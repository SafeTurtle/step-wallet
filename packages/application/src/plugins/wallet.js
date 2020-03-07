import { PROJECT_ENV } from 'react-native-dotenv'
const project = PROJECT_ENV

import client from './ethereum-client.js'
import crypto from 'crypto'
import * as SecureStore from 'expo-secure-store'

import firebase from './firebase'
require('firebase/functions')
const functions = firebase.functions()

const createWallet = async (_user) => {
	console.log("start: createWallet")
	const pushToken = _user.pushToken
	// if(await getWalletAddress()) return
	// if (!await getCosignerPrivateKey()){
	const cosignerPrivateKey = await client.createAccount()
	const recoverPrivateKey = await client.createAccount()
	await setCosignerPrivateKey(cosignerPrivateKey)
	await setRecoverPrivateKey(recoverPrivateKey)
	// }

	const cosigner = await getCosignerAddress()
	const recover = await getRecoverAddress()
	const _createWalletResult = await functions.httpsCallable('createWallet')({
		cosigner: cosigner,
		recover: recover,
		pushToken: pushToken
	}).catch((error) => {
		console.log(error)　//登録されていた時はrecoveryを実行させる。
		throw new Error("invalid-argument")
	})
	const data = _createWalletResult.data
	if(data.unregistered){
		await setWallet(data.wallet)
		return data
	} else {
		throw new Error("invalid-argument")
	}
}

const executeWallet = async (_to, _encodeABI, _value) => {
	console.log("start: executeWallet")

 	let toWeiValue= await client.web3.utils.toWei(_value, 'ether')
	if(toWeiValue != 0) {
		toWeiValue = toWeiValue
	} else {
		toWeiValue = 0
	}

	const wallet = await getWalletAddress()
	const data = await getWalletData(wallet)
	const nonce = data.nonce
	const authorized = data.authorized
	const hash = await client.web3.utils.soliditySha3(
		wallet,
		nonce,
		authorized,
		_encodeABI
	)
	const cosignerPrivateKey = await getCosignerPrivateKey()
	const sign = client.web3.eth.accounts.sign(
		hash,
		cosignerPrivateKey
	)
	const cosigner = await getCosignerAddress()
	const executeWalletResult = await functions.httpsCallable('executeWallet')({
		cosigner: cosigner,
		wallet: wallet,
		data: _encodeABI,
		sign: sign,
		hash: hash,
		authorized: authorized,
		nonce: nonce,
		to: _to,
		value: toWeiValue,
	}).catch((error) => {
		console.log(error)
	})
	console.log(executeWalletResult.data)
	return executeWalletResult.data
}

const recoveryWallet = async (_user, _encodeABI, _password) => {
	console.log("start: recoveryWallet")

	const getRecoverKeyHashResult = await functions.httpsCallable('getRecoveryHash')({})
	.catch((error) => {
		console.log(error)
	})
	const data = getRecoverKeyHashResult.data
	const wallet = data.wallet

	if(data.unregistered) return

	const crypted = data.crypted
	const decipher = crypto.createDecipher('aes-256-cbc', _password)
	let dec = decipher.update(crypted, 'hex', 'utf-8')
	const recoverPrivateKey = dec + decipher.final('utf-8')
	const cosignerPrivateKey = await client.createAccount()
	await setCosignerPrivateKey(cosignerPrivateKey)

	const cosignerAddress = await getCosignerAddress()
	const _data = await getWalletData(wallet)
	const nonce = _data.nonce

	const hash = await client.web3.utils.soliditySha3(
		wallet,
		nonce,
		cosignerAddress,
		_encodeABI
	)
	const sign = client.web3.eth.accounts.sign(
		hash,
		recoverPrivateKey
	)

	const recoveryWalletResult = await functions.httpsCallable('recoveryWallet')({
		new: cosignerAddress,
		wallet: wallet,
		sign: sign,
		hash: hash,
		nonce: nonce,
		data: _encodeABI
	}).catch((error) => {
		console.log(error)
		throw new functions.https.HttpsError(
      'unauthenticated',
      'phone unauthenticated.'
    )
	})
	setWallet(recoveryWalletResult.data.wallet)
	return recoveryWalletResult.data
}

const setRecoveryHash = async (_password) => {
	console.log("start: setRecoveryHash")

	const _cipher = crypto.createCipher('aes-256-cbc', _password)
	let crypted = _cipher.update(await getRecoverPrivateKey(), 'utf-8', 'hex')
	crypted += _cipher.final('hex')
	await setRecoverPassword(_password)
	await deleteRecoverKey()

	const wallet = await getWalletAddress()
	const keyStorageAddress = client.config.contract[project].keyStorage
	const KeyStorage = client.contract.KeyStorage
	const nonce = await KeyStorage.methods.nonce().call()
	const hash = await client.web3.utils.soliditySha3(
		keyStorageAddress,
		nonce,
		wallet,
		crypted
	)
	const cosignerPrivateKey = await getCosignerPrivateKey()
	const sign = client.web3.eth.accounts.sign(
		hash,
		cosignerPrivateKey
	)
	const cosigner = await getCosignerAddress()

	const setRecoveryHashResult = await functions.httpsCallable('setRecoveryHash')({
		cosigner: cosigner,
		wallet: wallet,
		nonce: nonce,
		crypted: crypted,
		hash: hash,
		sign: sign
	}).catch((error) => {
		console.log(error)
		throw new functions.https.HttpsError(
      'unauthenticated',
      'phone unauthenticated.'
    )
	})
	return setRecoveryHashResult
}

const getWalletData = async (_wallet) => {
	const CloneableWallet = client.getCloneableWallet(_wallet)
	const nonce = await CloneableWallet.methods.nonce().call()
	const KeyStation = client.contract.KeyStation
	const AUTHORIZED = await KeyStation.methods.AUTHORIZED().call()
	const authorized = await KeyStation.methods.addresses(AUTHORIZED).call()
  return { nonce: nonce, authorized: authorized }
}

const getCosignerAddress = async () => {
	if(!await SecureStore.getItemAsync('CosignerPrivateKey')) return
	const result = await SecureStore.getItemAsync('CosignerPrivateKey')
	return client.web3.eth.accounts.privateKeyToAccount("0x" + result).address
}

const getCosignerPrivateKey = async () => {
	const result = await SecureStore.getItemAsync('CosignerPrivateKey')
	if(!result) return result
  return "0x" + result
}

const getRecoverAddress = async () => {
	if(!await SecureStore.getItemAsync('RecoverPrivateKey')) return
	const result = await SecureStore.getItemAsync('RecoverPrivateKey')
	return client.web3.eth.accounts.privateKeyToAccount("0x" + result).address
}

const getRecoverPrivateKey = async () => {
	const result = await SecureStore.getItemAsync('RecoverPrivateKey')
	if(!result) return result
  return "0x" + result
}

const getWalletAddress = async () => {
  return await SecureStore.getItemAsync('wallet')
}

const getWalletBalance = async () => {
	const wallet = await getWalletAddress()
	const balance = await web3.eth.getBalance(wallet)
	const fromWeiBalance = await web3.utils.fromWei(balance, 'ether')
	const result = Math.floor(fromWeiBalance* 100000) / 100000
	return result.toFixed(2)
}

const setCosignerPrivateKey = async (_privateKey) => {
  await SecureStore.setItemAsync("CosignerPrivateKey", _privateKey);
}

const setRecoverPrivateKey = async (_privateKey) => {
  await SecureStore.setItemAsync("RecoverPrivateKey", _privateKey);
}

const setRecoverPassword = async (_password) => {
  await SecureStore.setItemAsync('RecoverPassword', _password);
}

const setWallet = async (_wallet) => {
  await SecureStore.setItemAsync('wallet', _wallet)
}

const deleteRecoverKey = async () => {
	await SecureStore.deleteItemAsync("RecoverPrivateKey")
}

const deleteWallet = async () => {
	await SecureStore.deleteItemAsync("wallet")
	await SecureStore.deleteItemAsync("CosignerPrivateKey")
}

// deleteWallet()

const Wallet = {
	web3: client.web3,
	createWallet: createWallet,
	recoveryWallet: recoveryWallet,
	setRecoveryHash: setRecoveryHash,
	executeWallet: executeWallet,
	getWalletAddress: getWalletAddress,
	getWalletBalance: getWalletBalance,
	getCosignerAddress: getCosignerAddress,
	getCosignerPrivateKey: getCosignerPrivateKey
}

export default Wallet
