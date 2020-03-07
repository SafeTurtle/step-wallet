pragma solidity ^0.5.10;

contract KeyStation {

	event Initialized(address _authorized, address _signer1, address _signer2);
	event Reset(address _previous, address _new, uint _target);

	uint public AUTHORIZED = 1;
  uint public SIGNER1 = 2;
  uint public SIGNER2 = 3;
	uint public nonce;

	mapping (uint => address) public addresses;

	constructor (address _authorized, address _signer1, address _signer2) public {
    require(_authorized != _signer1 && _signer1 != _signer2 && _signer2 != _authorized, "Do not use the recovery address as an authorized address.");
		require(_authorized != address(0) || _signer1 != address(0) || _signer2 != address(0), "Authorized address must not be zero.");

		addresses[AUTHORIZED] = _authorized;
    addresses[SIGNER1] = _signer1;
		addresses[SIGNER2] = _signer2;

		emit Initialized(_authorized, _signer1, _signer2);
	}

	function update(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, uint _target, address _new) external {
		require(_nonce == nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0]");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1]");
		require(_target == AUTHORIZED || _target == SIGNER1 || _target == SIGNER2, "Target mush be authorized address.");
		require(_new != address(0), "Authorized addresse must not be zero.");
		require(_new != addresses[AUTHORIZED] && _new != addresses[SIGNER1] && _new != addresses[SIGNER2], "New Address must differ from previous addresses.");

		bytes32 _operationHash = createHash(_nonce, _target, _new);
		address _signer1 = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _signer2 = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer1 != address(0) && _signer2 != address(0), "Invalid signature for signer1 and signer2.");
		require(_signer1 == addresses[SIGNER1] && _signer2 == addresses[SIGNER2], "Signature must be signed by signer1 address and signer2 address");

		address _previous;
		_previous = addresses[_target];
		addresses[_target] = _new;
		nonce++;

		emit Reset(_previous, _new, _target);
	}

	function createHash(uint _nonce, uint _target, address _new) public view returns(bytes32){
		bytes32 _hash = keccak256(
			abi.encodePacked(
				this,
				_nonce,
				_target,
				_new
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
