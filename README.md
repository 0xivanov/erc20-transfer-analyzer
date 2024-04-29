# ERC20 Token Transfer Analyzer

This Node.js script allows you to analyze ERC20 token transfers on the Ethereum blockchain based on specific criteria such as addresses and block range.

## Features

- Fetches ERC20 token transfer events from the Ethereum blockchain using JSON RPC.
- Filters transfers based on specified addresses and a block range.
- Handles timeout to prevent the function from hanging indefinitely.
- Writes the filtered transfer data to a JSON file.

## Usage

### Prerequisites

- Node.js installed on your machine.
- Access to an Ethereum JSON RPC provider.

### Installation

1. Install dependencies:

```bash
npm install
```

### Configuration

Before running the script, you need to configure the following options:

- Provider URL (`-p, --provider`): The JSON RPC provider URL for the Ethereum network you want to connect to.
- Contract Address (`-c, --contract`): The address of the ERC20 token contract you want to analyze.
- Addresses List (`-a, --addresses`): A list of Ethereum addresses separated by commas. Transfers involving these addresses will be included in the analysis.
- Blocks Count (`-b, --blocks`): The number of recent blocks to search for token transfers.

### Running the Script

Run the script with the following command:

```bash
node index.js --provider <provider-url> --contract <contract-address> --addresses <addresses-list> --blocks <blocks-count>
```

Replace `<provider-url>`, `<contract-address>`, `<addresses-list>`, and `<blocks-count>` with your desired values.
Example `<contract-address>` is `0x943498b40d90c1000ca36f06010d970ccc47197f`

### Tests

The project includes unit tests to ensure the functionality of the script. You can run the tests using the following command:

```bash
npm run test
```