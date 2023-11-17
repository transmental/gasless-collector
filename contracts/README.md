# WIP Hardhat Project

The contract sets the OWNER, ADMIN, AND RELAYER roles to the deployer address.

For production use, it is recommended to change each of these to unique addresses.

For local development, it is comfy to keep them all on the same PK.

## Role Definitions

# Owner

- ROLE MANAGEMENT

# Admin

- setMaxSupply
- withdraw

# Relayer

- mint

I recommend playing with the FoundnoneCollect.ts test file to understand the contract (Hardhat makes this really easy)

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
