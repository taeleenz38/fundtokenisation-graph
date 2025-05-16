import { Address, BigInt, bigInt, dataSource, log, store } from "@graphprotocol/graph-ts"
import {
  ERC1155BurnBatch,
  ERC1155MintBatch,
  ERC1155TokenBurn,
  ERC1155TokenMint,
  ERC1155TokenPaused,
  ERC1155TokenUnpaused,
  ERC1155TokenUpgraded,
  ERC1155TransferBatch,
  ERC1155TransferSingle,
  URI,
  UserTokenBalance,

} from "../generated/schema"
import {
  Burn as BurnEvent,
  BurnBatch as BurnBatchEvent,
  Mint as MintEvent,
  MintBatch as MintBatchEvent,
  Paused as PausedEvent,
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  URI as URIEvent,
  Unpaused as UnpausedEvent,
  Upgraded as UpgradedEvent
} from "../generated/templates/ERC1155Token/ERC1155Token"

const SEPARATOR = "-"

export function handleERC1155Burn(event: BurnEvent): void {
  let entity = new ERC1155TokenBurn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.tokenId = event.params.tokenId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

}

export function handleBurnBatch(event: BurnBatchEvent): void {
  let entity = new ERC1155BurnBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.tokenIds = event.params.tokenIds
  entity.amounts = event.params.amounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleERC1155Mint(event: MintEvent): void {
  let entity = new ERC1155TokenMint(
    event.address.toHex().concat(SEPARATOR).concat(event.params.tokenId.toString())
  )
  entity.to = event.params.to
  entity.tokenName = event.params.tokenName
  entity.tokenSymbol = event.params.tokenSymbol
  entity.tokenVersion = event.params.tokenVersion
  entity.uri = event.params.uri
  entity.tokenId = event.params.tokenId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  
}

export function handleMintBatch(event: MintBatchEvent): void {
  let entity = new ERC1155MintBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.to = event.params.to
  entity.tokenName = event.params.tokenName
  entity.tokenSymbol = event.params.tokenSymbol
  entity.tokenVersion = event.params.tokenVersion
  entity.uris = event.params.uris
  entity.tokenIds = event.params.tokenIds
  entity.amounts = event.params.amounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new ERC1155TokenPaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let entity = new ERC1155TransferBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.ids = event.params.ids
  entity.values = event.params.values

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let entity = new ERC1155TransferSingle(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.ERC1155Token_id = event.params.id
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Load the URI 
  let entityURI = URI.load(event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()))
  if (entityURI == null) {
    entityURI = new URI(event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()));
    entityURI.value = "";
  }
  log.info("URI : id {} value {} ", [entityURI.id, entityURI.value])

  // Check the tranfer single
  if (event.params.from.toHex() != "0x0000000000000000000000000000000000000000" 
    && event.params.to.toHex() != "0x0000000000000000000000000000000000000000") {
    
    log.info("Transfer {} ", ["From and To are not zero"])
    // Load the UserToken Balance for the From user 
    let fromUserBalanceEntity = UserTokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.from.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (fromUserBalanceEntity == null) {
      fromUserBalanceEntity = new UserTokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.from.toHex())
      )
      fromUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    fromUserBalanceEntity.balance = fromUserBalanceEntity.balance.minus(event.params.value);
    fromUserBalanceEntity.owner = event.params.from;
    log.info("Transfer from {} balance {} ", [fromUserBalanceEntity.id, fromUserBalanceEntity.balance.toString()])
    assignUserBalanceEntityValues(fromUserBalanceEntity, event, entityURI) 

    // Load the UserToken Balance of the To user
    let toUserBalanceEntity = UserTokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.to.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (toUserBalanceEntity == null) {
      toUserBalanceEntity = new UserTokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.to.toHex())
      )
      toUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    toUserBalanceEntity.balance = toUserBalanceEntity.balance.plus(event.params.value)
    toUserBalanceEntity.owner = event.params.to;
    log.info("Transfer to {} balance {} ", [toUserBalanceEntity.id, toUserBalanceEntity.balance.toString()])
    assignUserBalanceEntityValues(toUserBalanceEntity, event, entityURI)

    // Check the Mint
  } else if (event.params.to.toHex() != "0x0000000000000000000000000000000000000000") {
    log.info("Mint {} ", ["To is not zero"])
    // Load the UserToken Balance of the To user
    let toUserBalanceEntity = UserTokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.to.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (toUserBalanceEntity == null) {
      toUserBalanceEntity = new UserTokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.to.toHex())
      )
      toUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    toUserBalanceEntity.balance = toUserBalanceEntity.balance.plus(event.params.value)
    toUserBalanceEntity.owner = event.params.to;
    log.info("Mint {} balance {} ", [toUserBalanceEntity.id, toUserBalanceEntity.balance.toString()])
    assignUserBalanceEntityValues(toUserBalanceEntity, event, entityURI)

    // Check the Burn function
  } else if (event.params.from.toHex() != "0x0000000000000000000000000000000000000000") {
    log.info("Burn {} ", ["From is not zero"])
    // Load the UserToken Balance for the From user 
    let fromUserBalanceEntity = UserTokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.from.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (fromUserBalanceEntity == null) {
      fromUserBalanceEntity = new UserTokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.from.toHex())
      )
      fromUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    fromUserBalanceEntity.balance = fromUserBalanceEntity.balance.minus(event.params.value);
    fromUserBalanceEntity.owner = event.params.from;
    log.info("Burn {} balance {} ", [fromUserBalanceEntity.id, fromUserBalanceEntity.balance.toString()])
    assignUserBalanceEntityValues(fromUserBalanceEntity, event, entityURI) 
  }
}

export function assignUserBalanceEntityValues(userBalanceEntity : UserTokenBalance, event: TransferSingleEvent, uriEntity: URI): void {

  let context = dataSource.context()

  userBalanceEntity.contractAddress = event.address
  userBalanceEntity.tokenId = event.params.id
  userBalanceEntity.tokenName = context.getString('tokenName')
  userBalanceEntity.tokenSymbol = context.getString('tokenSymbol')
  userBalanceEntity.metaDataUri = uriEntity.value;

  userBalanceEntity.blockNumber = event.block.number
  userBalanceEntity.blockTimestamp = event.block.timestamp
  userBalanceEntity.transactionHash = event.transaction.hash

  userBalanceEntity.save()
}

export function handleURI(event: URIEvent): void {
  let entity = new URI(event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()))
  entity.value = event.params.value
  entity.ERC1155Token_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new ERC1155TokenUnpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new ERC1155TokenUpgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
