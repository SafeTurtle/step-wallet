import { PROJECT_ENV } from 'react-native-dotenv'
import config from'../../config.json'
import '../../global'
import crypto from 'crypto'
import randomBytes from 'randombytes'

const project = PROJECT_ENV

global.Web3  = require('web3')
global.web3  = new Web3(
  new Web3.providers.HttpProvider(config.node[project].https)
)
const web3 = global.web3

const contract = {
  WalletFactory: new web3.eth.Contract(
    config.abi.walletFactory,
    config.contract[project].walletFactory
  ),
  KeyStation: new web3.eth.Contract(
    config.abi.keyStation,
    config.contract[project].keyStation
  ),
  KeyStorage: new web3.eth.Contract(
    config.abi.keyStorage,
    config.contract[project].keyStorage
  )
}

const account = {
  address: null,
  balance: null
}

const activate = async address => {
  try{
    setInterval(async () => {
      account.balance = await web3.eth.getBalance(address)
    }, 1000)
  } catch (err) {
    alert(err)
  }
}

const ownedTokens = async (name ,address)=> {
  const balance = await contract[name].methods.balanceOf(address).call()
  if (balance == 0) {
    return []
  }
  const promises = []
  for (var i = 0; i < balance; i++) {
    promises.push(contract[name].methods.tokenOfOwnerByIndex(address, i).call())
  }
  const result = await Promise.all(promises)
  return result
}

const createAccount = async () => {
  var x = await web3.eth.accounts.create(web3.utils.randomHex(32))
  return x.privateKey.substring(2)
}

const getAccountMetaData = async (_privateKey) => {
  return await web3.eth.accounts.privateKeyToAccount(_privateKey)
}

const getCloneableWallet = (_to) => {
  return new web3.eth.Contract(
    config.abi.cloneableWallet,
    _to
  )
}

const client = {
  web3: web3,
  config: config,
  contract: contract,
  account: account,
  activate: activate,
  ownedTokens: ownedTokens,
  createAccount: createAccount,
  getAccountMetaData: getAccountMetaData,
  getCloneableWallet: getCloneableWallet
}

export default client
