// test/transfers.test.js

const { expect } = require('chai');
const { ethers } = require('hardhat');
const fs = require('fs');
const { getERC20TransfersWithTimeout } = require('../index.js');

describe('ERC20 Token Transfer Analyzer', function () {
  let tokenContract;
  let accounts;

  before(async function () {
    // Deploy the ERC20 token contract
    const Token = await ethers.getContractFactory('BAR');
    tokenContract = await Token.deploy("BAR Token", "BAR", 18);

    // Get accounts
    accounts = await ethers.getSigners();
  });

  it('should record transfers and generate transfers.json file', async function () {
    // Make transfers between accounts
    await tokenContract.transfer(accounts[1].address, 100);
    await tokenContract.transfer(accounts[2].address, 200);
    await tokenContract.transfer(accounts[3].address, 300);

    // Mine blocks to include transactions
    await network.provider.send('evm_mine', []);

    // Run your script to analyze transfers and generate transfers.json
    const providerUrl = 'http://localhost:8545';
    const addressesList = [accounts[1].address, accounts[2].address];
    const blocksCount = 10;

    await getERC20TransfersWithTimeout(providerUrl, tokenContract.target, addressesList, blocksCount);

    // Read transfers.json file and check the number of transfers recorded
    const transfersData = fs.readFileSync('transfers.json', 'utf8');
    const transfers = JSON.parse(transfersData);
    console.log(transfers)
    expect(transfers).to.be.an('array');
    expect(transfers).to.have.lengthOf(2); // expect two transfers are recorded
  });
});
