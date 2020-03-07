var KeyManager = artifacts.require('KeyManager')
var Web3 = require('web3')

contract('KeyManager', async function(accounts) {

    const AUTHORIZED = 1
    const RECOVERY = 2

    //0x1b79e951c8d78c2cf235535acf853a2733d4f7e1
    var authorizedPrivkey = "0xc741c9b826d385888c66cf7bc70a6ad05e47d0ca0812bdc946445064ccb5b49b"
    //0x32393e7c99dde0e1a776d681c2709d292494cf29
    var recoveryPrivkey = "0x151fb97207650afe268a77f5d2b000528ba9aaffa070296ca28f18bbcfcde57a"

    var authorizedAddress
    var recoveryAddress

    const newAuthorizedAddress = "0x0eC2c76f1317113a29BA804a235b052214fbc02A"
    const newRecoveryAddress = "0xfde048c9870307C661338f232989EbA558B4EEDE"

    const hash = (_address, _nonce, _target, _newAddress) => {
        return  web3.utils.soliditySha3(
            _address,
            _nonce,
            _target,
            _newAddress
        )
    }

    it('Setup', async function() {
        const authorized = await web3.eth.accounts.privateKeyToAccount(authorizedPrivkey)
        const recovery = await web3.eth.accounts.privateKeyToAccount(recoveryPrivkey)
        authorizedAddress = authorized.address
        recoveryAddress = recovery.address
        KeyManager = await KeyManager.new(authorizedAddress, recoveryAddress)
        const resultAuthorizedAddress = await KeyManager.addresses(AUTHORIZED)
        const resultRecoveryAddress = await KeyManager.addresses(RECOVERY)
        assert.equal(authorizedAddress, resultAuthorizedAddress)
        assert.equal(recoveryAddress, resultRecoveryAddress)
    })

    it('Method: createOperationHash', async function() {
        const nonce = await KeyManager.nonce()
        const nonceString = nonce.toString("hex")
        const data = hash(KeyManager.address, nonceString, AUTHORIZED, newAuthorizedAddress)
        const result = await KeyManager.createOperationHash(nonceString, AUTHORIZED, newAuthorizedAddress)
        assert.equal(data, result)
    })

    it('Method: update - authorized address', async function() {
        const nonce = await KeyManager.nonce()
        const nonceString = nonce.toString("hex")
        const data = await KeyManager.createOperationHash(nonceString, AUTHORIZED, newAuthorizedAddress)
        const authorizedSignature = web3.eth.accounts.sign(data, authorizedPrivkey).signature
        const recoverySignature = web3.eth.accounts.sign(data,recoveryPrivkey).signature
        await KeyManager.update(authorizedSignature, recoverySignature, AUTHORIZED, newAuthorizedAddress)
        const resultAuthorizedAddress = await KeyManager.addresses(AUTHORIZED)
        assert.equal(resultAuthorizedAddress, newAuthorizedAddress)
    })

})