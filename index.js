const ethers = require('ethers');
const fs = require('fs');
const { Command } = require('commander');

const program = new Command();
program.option('-c, --contract <address>', 'ERC20 contract address');
program.option('-a, --addresses <list>', 'List of addresses separated by commas');
program.option('-b, --blocks <count>', 'Number of blocks to search');
program.option('-p, --provider <url>', 'JSON RPC provider URL');
program.parse(process.argv);


async function getERC20TransfersWithTimeout(providerUrl, contractAddress, addressesList, blocksCount) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      clearTimeout(timeout);
      reject(new Error('Function timed out'));
    }, 20000); // 20 seconds
  });

  try {
    const result = await Promise.race([
      timeoutPromise,
      getAllERC20Transfers(providerUrl, contractAddress)
    ]);
    clearTimeout(timeout);
    const filteredTransfers = await filterTransfersByAddressesAndBlocks(providerUrl, result, addressesList, blocksCount);

    if (filteredTransfers.length === 0) {
      console.log('No transfers found matching the specified criteria.');
      return
    }

    // Extract relevant transfer information
    const extractedTransfers = await extractTransferInfo(providerUrl, filteredTransfers);
    // Write transfers to file
    writeTransfersToFile(extractedTransfers);

    return extractedTransfers;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function getAllERC20Transfers(providerUrl, contractAddress) {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const contractABI = ['event Transfer(address indexed from, address indexed to, uint256 value)'];
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const filter = contract.filters.Transfer();

  const events = await contract.queryFilter(filter);
  return events;
}

async function filterTransfersByAddressesAndBlocks(providerUrl, transfers, addressesList, blocksCount) {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const latestBlockNumber = await provider.getBlockNumber();
  const filteredTransfers = transfers.filter(transfer => {
    const blockNumber = transfer.blockNumber
    const fromAddress = transfer.args.from;
    const toAddress = transfer.args.to;

    const isIncluded = addressesList.includes(fromAddress) || addressesList.includes(toAddress);
    const isInBlocksRange = blockNumber >= (latestBlockNumber - blocksCount);

    return isIncluded && isInBlocksRange;
  });

  return filteredTransfers;
}

async function extractTransferInfo(providerUrl, transfers) {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const contractABI = ['event Transfer(address indexed from, address indexed to, uint256 value)'];
  const contract = new ethers.Contract(transfers[0].address, contractABI, provider);

  return Promise.all(transfers.map(async transfer => {
    const parsedLogs = contract.interface.parseLog(transfer);

    return {
      from: parsedLogs.args.from,
      to: parsedLogs.args.to,
      value: parsedLogs.args.value.toString(),
      blockNumber: transfer.blockNumber
    };
  }));
}

function writeTransfersToFile(transfers) {
  const fileName = 'transfers.json';
  const formattedTransfers = JSON.stringify(transfers, null, 2);

  fs.writeFileSync(fileName, formattedTransfers);
  console.log(`Transfers written to ${fileName}`);
}

// Check if program options are provided
if (Object.keys(program.opts()).length > 0) {
  const providerUrl = program.opts().provider;
  const contractAddress = program.opts().contract;
  const addressesList = program.opts().addresses.split(',');
  const blocksCount = program.opts().blocks;

  getERC20TransfersWithTimeout(providerUrl, contractAddress, addressesList, blocksCount)
    .then(transfers => {
      // Gracefully exit the program
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1); // Halt the application
    });
}

module.exports = {
  getERC20TransfersWithTimeout
};