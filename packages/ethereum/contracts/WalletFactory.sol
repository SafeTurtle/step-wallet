pragma solidity ^0.5.10;

import "./KeyStation.sol";
import "./CloneableWallet.sol";

contract WalletFactory {

	uint public constant AUTHORIZED = 1;
	uint public nonce;
	address public cloneableWallet;
	address public keyStation;

	event WalletCreated(address wallet, address keyStation, bool full);

	constructor(address _cloneableWallet, address _keyStation) public {
		cloneableWallet = _cloneableWallet;
		keyStation = _keyStation;
	}

	function deployCloneWallet(uint8 v, bytes32 r, bytes32 s, uint _nonce, address _cosigner, address _recover) external returns (address payable){
		require(nonce == _nonce, "invalid nonce");
		require(v == 27 || v == 28, "invalid signature version");

		bytes32 _operationHash = createHash(_nonce, _cosigner, _recover);

		require(KeyStation(keyStation).addresses(AUTHORIZED) == ecrecover(_operationHash, v, r, s), "Signature must be signed by authorized address");

		address payable clone = createClone(cloneableWallet);
		CloneableWallet(clone).init(_cosigner, _recover, keyStation);
		nonce++;

		emit WalletCreated(clone, keyStation, false);
		return clone;
	}

	function createHash(uint _nonce, address _cosigner, address _recover) public view returns(bytes32){
		bytes32 _hash = keccak256(
			abi.encodePacked(
				this,
				_nonce,
				_cosigner,
				_recover
			)
		);
		return keccak256(
			abi.encodePacked(
					"\x19Ethereum Signed Message:\n32",
					_hash
			)
		);
	}

	function createClone(address target) internal returns (address payable result) {
		bytes20 targetBytes = bytes20(target);
		assembly {
			let clone := mload(0x40)
			mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
			mstore(add(clone, 0x14), targetBytes)
			mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
			result := create(0, clone, 0x37)
		}
	}


}