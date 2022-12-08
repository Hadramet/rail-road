# Railroad


This project consists of two parts: a smart contract folder and a frontend folder.

## Prerequisis
- NodeJs : 18.2
- Yarn : for the commands

## Smart contract

The smart contract folder contains all the contracts for the app. In order to use it, you need to have [Node.js 18](https://nodejs.org/en/download/) installed on your system. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node versions.

Once you have Node.js 18 installed, run the following command to init a local hardhat network:

In the terminal, go to the smart contract folder from the root:

```
cd smart-contracts
yarn && npx hardhat node
```

This will start the local network on **'127.0.0.1:8545'**.

To deploy the contracts on the local network, run the following command:

```
yarn deploy_local
```

This will deploy the contracts and copy the ABI files to the frontend folder.

## Frontend
The frontend folder contains a [Next.js](https://nextjs.org/) app. To compile an optimized version of the app, run the following command:

```
cd frontend
yarn && yarn build
```

To start the app, run the following command:

```
yarn start
```

Once the app is started, you can visit it at [http://localhost:3000](http://localhost:3000).

To make transactions, you will need to have the MetaMask extension installed on your browser. Add your local network (follow the instructions in MetaMask to do this).

Sometimes there are transaction errors due to the MetaMask account. To fix this, go to the MetaMask advanced settings and click on "Reset account".


## Tests (optional)
You can run tests before deploying the app with the command:

```
cd smart-contract
yarn && yarn test
```

## Coverage (optional)
You can run tests before deploying the app with the command:

```
cd smart-contract
yarn coverage
```
The coverage results will be prompted in the command line, or you can view a HTML version of it by opening the file at `railroad/smart-contract/coverage/index.html`.
