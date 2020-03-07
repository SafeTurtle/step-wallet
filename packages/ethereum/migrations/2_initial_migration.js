const KeyStation = artifacts.require("KeyStation")
const CloneableWallet = artifacts.require("CloneableWallet")
const WalletFactory = artifacts.require("WalletFactory")
const KeyStorage = artifacts.require("KeyStorage")

//"0x951D94319cF3bC6B4BFF5A33779C5a723b0B0c4e", "0x46Bfe6f8492e30D8465Cfb8E71AC7b9C320E20e3"
module.exports = (deployer) => {
  deployer.deploy(KeyStation, "0x6E773b93eeA8E4333eFEA4d847a8F2eb29dcF7a4", "0x65CAb099B26E45C007BEcdb30e5ca592e85987Cf", "0x516A4a99735A68B87dB4BF90b4c1cE70d319D38F").then(async (station) => {
    console.log(station.address)
    await deployer.deploy(CloneableWallet).then(async (cloneable) => {
      console.log(cloneable.address)
      await deployer.deploy(WalletFactory, cloneable.address, station.address).then(async (factory) => {
        console.log(factory.address)
        await deployer.deploy(KeyStorage, station.address).then(async (storage) => {
          console.log(storage.address)
        })
      })
    })
  })
}

