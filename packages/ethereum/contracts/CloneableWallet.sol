pragma solidity ^0.5.10;

import "./ERC721/ERC721Receivable.sol";
import "./ERC223/ERC223Receiver.sol";
import "./KeyStation.sol";

contract CloneableWallet is ERC721Receivable, ERC223Receiver {

	event Authorized(address _cosigner, address _recover, address _keyStation);
	event EmergencyRecovered(address _cosigner);
	event Received(address from, uint value);
	event InvocationSuccess(address _to, bytes _data, bool success);

	uint public constant AUTHORIZED = 1;
	uint public nonce;
	address public keyStation;
	address public cosigner;
  address public recover;
	bool public initialized;

	function() external payable {
		require(msg.data.length == 0, "Invalid transaction.");
		if (msg.value > 0) {
			emit Received(msg.sender, msg.value);
		}
	}

	function init(address _cosigner, address _recover, address _keyStation) external {
		require(!initialized, "must not already be initialized");
		require(_cosigner != _recover || _recover != KeyStation(_keyStation).addresses(AUTHORIZED) || KeyStation(_keyStation).addresses(AUTHORIZED) != _cosigner, "Do not use the authorized address as a cosigner.");
		require(_cosigner != address(0) && _recover != address(0) && _keyStation != address(0), "Initial all address must not be zero.");

		cosigner = _cosigner;
    recover = _recover;
		keyStation = _keyStation;
		initialized = true;

		emit Authorized(_cosigner, _recover, _keyStation);
	}

	function invoke(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, address _authorized, bytes calldata _data, address _to, uint _value) external {
		require(_nonce == nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0]");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1]");

	  bytes32 _operationHash = createHash(_nonce, _authorized, _data);
		address _signer = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _cosigner = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer != address(0) && _cosigner != address(0), "Invalid signature for signer and cosigner.");
		require(_signer == KeyStation(keyStation).addresses(AUTHORIZED) && _cosigner == cosigner, "authorized and cosigner addresses must be equal");

		nonce++;

		require(executeCall(_to, _value, _data));
	}

	function emergencyRecovery(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, address _cosigner, bytes calldata _data) external {
		require(nonce == _nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0]");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1]");
		require(_cosigner != KeyStation(keyStation).addresses(AUTHORIZED) || _cosigner != recover, "Do not use the authorized address or recover address as a cosigner.");
		require(_cosigner != address(0), "The cosigner must not be zero.");

		bytes32 _operationHash = createHash(_nonce, _cosigner, _data);
		address _signer = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _recover = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer != address(0) && _recover != address(0), "Invalid signature for signer and recover.");
		require(_signer == KeyStation(keyStation).addresses(AUTHORIZED) && _recover == recover, "Invalid authorization in signer and recover");

		cosigner = _cosigner;
		nonce++;

		emit EmergencyRecovered(_cosigner);
	}

  function createHash(uint _nonce, address _address, bytes memory _data) public view returns(bytes32) {
    bytes32 _hash = keccak256(
      abi.encodePacked(
        this,
        _nonce,
        _address,
        _data
      )
    );
    return keccak256(
      abi.encodePacked(
          "\x19Ethereum Signed Message:\n32",
          _hash
      )
    );
  }
  //createHashInvoke
  //createHashRecoveryの時は_dataに0xを代入する。

	function executeCall(address _to, uint256 _value, bytes memory _data) internal returns (bool success) {
		assembly {
			success := call(gas, _to, _value, add(_data, 0x20), mload(_data), 0, 0)
		}
		emit InvocationSuccess(_to, _data, success);
	}
}