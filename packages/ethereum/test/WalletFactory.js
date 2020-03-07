const BN = require("bn.js")
const abi = require("ethereumjs-abi")
const ethUtils = require("ethereumjs-util")

var KeyManager = artifacts.require('./KeyManager.sol')
var CloneableWallet = artifacts.require('./Wallet/CloneableWallet.sol')
var WalletFactory = artifacts.require('./WalletFactory/WalletFactory.sol')

var Web3 = require('web3')

require("chai").should();

contract('Wallet test', async function(accounts) {

    //0x1b79e951c8d78c2cf235535acf853a2733d4f7e1
    const authorizedPrivkey = "c741c9b826d385888c66cf7bc70a6ad05e47d0ca0812bdc946445064ccb5b49b"
    //0x32393e7c99dde0e1a776d681c2709d292494cf29
    const recoveryPrivkey = "151fb97207650afe268a77f5d2b000528ba9aaffa070296ca28f18bbcfcde57a"

    //0xb07cC51Ae9DC78aC3F9b9e4264025086d6f6339A
    const cosignerPrivkey = "069aed140703f75b72ad0d96c4518abec969dafe7e5fd5281d9ca0b37e1e31da"

    let authorizedAddress
    let recoveryAddress
    let wallet
    let walletAddress

    const getSha3ForConfirmationTx = (walletAddr, nonce, authorizedAddress, data) => {
        return abi.soliditySHA3(
          ['address', 'uint256', 'address', 'string'],
          [new BN(walletAddr.replace('0x', ''), 16), nonce, new BN(authorizedAddress.replace('0x', ''), 16), data]
        )
    }

    const numToBuffer = num => {
         return numToBufferWithN(num, 64);
    }

    const numToBufferWithN = (num, amt) => {
        return Buffer.from(
            new BN(web3.utils.toHex(num).replace("0x", ""), 16).toString(16, amt),
            "hex"
        )
    }

    const txData = (revert, to, amount, dataBuff) => {
        // revert_flag (1), to (20), value (32), data length (32), data
        let dataArr = []
        let revertBuff = Buffer.alloc(1)
        // don't revert for now
        revertBuff.writeUInt8(revert)
        dataArr.push(revertBuff)
        // 'to' is not padded (20 bytes)
        dataArr.push(Buffer.from(to.replace("0x", ""), "hex")) // address as string
        // value (32 bytes)
        dataArr.push(numToBuffer(amount))
        // data length (0)
        dataArr.push(numToBuffer(dataBuff.length));
        if (dataBuff.length > 0) {
          dataArr.push(dataBuff)
        }
        return Buffer.concat(dataArr);
    }

    const createFunctionABI = (data) => {
        const argument = splitByLength(data, 64)
        var dataArr = []
        dataArr.push(funcHashEncoded(data))
        argument.forEach((data) => {
          dataArr.push(numToBufferWithArgument(data))
        })
        return Buffer.concat(dataArr)
    }

    const splitSignatures = (sig1, sig2) => {
        if (sig2) {
          return [
            ["0x" + sig1.r.toString("hex"), "0x" + sig2.r.toString("hex")],
            ["0x" + sig1.s.toString("hex"), "0x" + sig2.s.toString("hex")],
            [
              "0x" + Buffer.from([sig1.v]).toString("hex"),
              "0x" + Buffer.from([sig2.v]).toString("hex")
            ]
          ];
        } else {
          return [
            ["0x" + sig1.r.toString("hex"), "0x00000000"],
            ["0x" + sig1.s.toString("hex"), "0x00000000"],
            ["0x" + Buffer.from([sig1.v]).toString("hex"), "0x0"]
          ];
        }
      };

    it('Setup', async function() {
        const authorized = await web3.eth.accounts.privateKeyToAccount("0x" + authorizedPrivkey)
        const recovery = await web3.eth.accounts.privateKeyToAccount("0x" + recoveryPrivkey)
        authorizedAddress = authorized.address
        recoveryAddress = recovery.address
        keyManager = await KeyManager.new(authorizedAddress, recoveryAddress)
        cloneableWallet = await CloneableWallet.new()
        walletFactory = await WalletFactory.new(cloneableWallet.address, keyManager.address)
        console.log(walletFactory.address)
    })

    it('WalletFactory: Deploy CloneableWallet', async function() {
        const cosignerAddress = await web3.eth.accounts.privateKeyToAccount("0x" + cosignerPrivkey)

        const result = await walletFactory.deployCloneWallet(cosignerAddress.address)
        result.logs
        .filter(log => log.event === "WalletCreated")
        .forEach(log => {
            let result = false
            if(log.args.wallet) result = true
            walletAddress = log.args.wallet
            wallet = CloneableWallet.at(log.args.wallet)
            assert.equal(true, result)
        })
    })
})