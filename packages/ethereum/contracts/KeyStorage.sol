pragma solidity ^0.5.10;

import "./KeyStation.sol";
import "./CloneableWallet.sol";

contract KeyStorage {

	event Initialized(address _keyStation);
	event Set(address indexed _target, string _new);

  uint public constant AUTHORIZED = 1;
	uint public nonce;
  address public keyStation;

	mapping (address => string) private storages;
	mapping (address => bool) private registrations;

	constructor (address _keyStation) public {
		require(_keyStation != address(0), "KeyStation address must not be zero.");

    keyStation = _keyStation;

		emit Initialized(_keyStation);
	}

  function setStorage(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, address payable _target, string calldata _new) external {
		require(!registrations[_target], "invalid nonce");
		require(_nonce == nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0].");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1].");
		require(_target != address(0), "Target addresse must not be zero.");

		bytes32 _operationHash = createHash(_nonce, _target, _new);
		address _signer1 = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _signer2 = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer1 != address(0) && _signer2 != address(0), "Invalid signature for signer1 and signer2.");
		require(_signer1 == KeyStation(keyStation).addresses(AUTHORIZED) && _signer2 == CloneableWallet(_target).cosigner(), "Signature must be signed by signer1 address and signer2 address.");

    storages[_target] = _new;
		registrations[_target] = true;
		nonce++;

		emit Set(_target, _new);
	}

	function getStorage(uint8 v, bytes32 r, bytes32 s, uint _nonce, address payable _target, string calldata _word) external view returns(string memory){
		if(_nonce != nonce) return "1";
		if (v != 27 && v != 28 ) return "2";

		bytes32 _operationHash = createHash(_nonce, _target, _word);
		address _signer = ecrecover(_operationHash, v, r, s);

		if(_signer == address(0)) return "3";
		if(_signer != KeyStation(keyStation).addresses(AUTHORIZED)) return "4";

		return storages[_target];
	}

	function createHash(uint _nonce, address payable _target, string memory _string) public view returns(bytes32){
		bytes32 _hash = keccak256(
			abi.encodePacked(
				this,
				_nonce,
				_target,
				_string
			)
		);
		return keccak256(
			abi.encodePacked(
				"\x19Ethereum Signed Message:\n32",
				_hash
			)
		);
	}
}
