# README
# Pre-requisites
+ Create Account in https://dashboard.alchemy.com/
+  Use Subgraphs under Data services
+ Node.js: You must have Node.js version 18 or higher installed on your system. If you do not have Node.js installed, or if your version is lower than 18, you can download the latest version from the official website.
+  Run ```node -v``` to verify.
+ Install the Graph CLI (graph-cli) NPM package globally by running ```npm i -g @graphprotocol/graph-cli@0.73.0```
+  Run ```graph``` to verify you have this package installed

# Run the Subgraph CLI Wizard
+ Navigate to a directory (/graph) where you want to initialize your project
+ Run ```graph init``` to initialize the package's CLI wizard and select the following options:
+ Protocol: ```ethereum```
+ Product for which to initialize: ```rwa```
+ Subgraph name: ```graph/rwa```
+ Directory to create the subgraph in: ```rwa```
+ Ethereum network: ```mainnet```
+ Contract address: ```0x51b4AC2092b76843322De03796705cb3368565cB```
+ ABI: ABI will be fetched automatically or Can add file path ```./abis/Pricer.json```
+ Start block: The wizard should fill in a start block automatically, ```12876179```, press Enter! (this is the start block where the Pudgy Penguins NFT contract was first deployed - indexing from block 0 would be unnecessary and wasteful)
+ Contract name: ```Pricer```
+ Index contract events as entities (Y/n): ```y (press Enter)```
+ Once the wizard process begins, you will be asked if you want to add another contract: ```n```

# Build Your Subgraph
+ In your project's root folder ```graph/rwa```, run ```graph codegen```
+ run ```graph build```

# Deploy Your Subgraph to Alchemy Subgraphs
+ Acquire your unique deploy-key from the Alchemy Subgraphs Dashboard (you will need to log in with your Alchemy account)
You can use the default key provided to you or hit + Create Query Key to create a new one.
+ Plug in your deploy-key where it says COPY_PASTE_YOUR_DEPLOY_KEY_HERE and then run the following in your terminal (paste it all as one command!):

```
graph deploy pudgy-penguins-transfers \
  --version-label v0.0.1-new-version \
  --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
  --deploy-key COPY_PASTE_YOUR_DEPLOY_KEY_HERE \
  --ipfs https://ipfs.satsuma.xyz
```
