import { BigInt, store } from "@graphprotocol/graph-ts"
import {
  MarketItemListed as MarketItemListedEvent,
  MarketItemPurchased as MarketItemPurchasedEvent,
  MarketItemRemoved as MarketItemRemovedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../generated/MarketPlace/MarketPlace"
import {
  ERC1155TokenMint,
  MarketItemListed,
  MarketItemPurchased,
  MarketItemRemoved,
  MarketPlaceItem,
  TokenDeployed
} from "../generated/schema"
import { log } from "matchstick-as"

export function handleMarketItemListed(event: MarketItemListedEvent): void {
  let entity = new MarketItemListed(
    event.params.listingId.toString()
  )
  entity.listingId = event.params.listingId
  entity.erc1155Address = event.params.erc1155Address
  entity.erc20Address = event.params.erc20Address
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.unitPrice = event.params.unitPrice
  entity.quantity = event.params.quantity

  let tokenDeployed = TokenDeployed.load(event.params.erc20Address.toHex())
  if (tokenDeployed == null) {
    tokenDeployed = new TokenDeployed(event.params.erc20Address.toHex())
  }
  let mintedEntity = ERC1155TokenMint.load(
    event.params.erc1155Address.toHex().concat("-").concat(event.params.tokenId.toString())
  )
  if (mintedEntity == null) {
    mintedEntity = new ERC1155TokenMint(
      event.params.erc1155Address.toHex().concat("-").concat(event.params.tokenId.toString())
    )
  }
  entity.erc20TokenName = tokenDeployed.tokenName
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  //event.address.toHex().concat(SEPARATOR).concat(event.params.id.toString()).concat(SEPARATOR).concat(event.params.from.toHex()
  let marketPlaceItem = MarketPlaceItem.load(event.params.tokenId.toString().concat("-").concat(event.params.erc1155Address.toHex()))
  if (marketPlaceItem == null) {
    marketPlaceItem = new MarketPlaceItem(event.params.tokenId.toString().concat("-").concat(event.params.erc1155Address.toHex()))
    marketPlaceItem.tokenId = event.params.tokenId
    marketPlaceItem.tokenName = mintedEntity.tokenName
    marketPlaceItem.tokenSymbol = mintedEntity.tokenSymbol
    marketPlaceItem.metaDataUri = mintedEntity.uri
    marketPlaceItem.tokenAddress = event.params.erc1155Address
    marketPlaceItem.listingCounter = BigInt.fromI32(0).plus(BigInt.fromI32(1));
    marketPlaceItem.owner = event.params.seller;

    marketPlaceItem.blockNumber = event.block.number
    marketPlaceItem.blockTimestamp = event.block.timestamp
    marketPlaceItem.transactionHash = event.transaction.hash

  } else {
    marketPlaceItem.listingCounter = marketPlaceItem.listingCounter.plus(BigInt.fromI32(1));
    marketPlaceItem.blockTimestamp = event.block.timestamp
  }
  marketPlaceItem.save()
}

export function handleMarketItemPurchased(
  event: MarketItemPurchasedEvent
): void {
  let entity = new MarketItemPurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.listingId = event.params.listingId
  entity.erc1155Address = event.params.erc1155Address
  entity.erc20Address = event.params.erc20Address
  entity.tokenId = event.params.tokenId
  entity.buyer = event.params.buyer
  entity.seller = event.params.seller
  entity.unitPrice = event.params.unitPrice
  entity.quantity = event.params.quantity
  entity.totalPrice = event.params.totalPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let marketItemListed = MarketItemListed.load(event.params.listingId.toString())
  if (marketItemListed == null) {
    log.info("marketItemListed is null {} , ", ["True"])
    marketItemListed = new MarketItemListed(event.params.listingId.toString())
    marketItemListed.quantity = BigInt.zero()
  }
  
  log.info("event.params.listingId {} , ", [event.params.listingId.toString()])
  log.info("marketItemListed id {} , ", [marketItemListed.listingId.toString()])
  log.info("event.params.quantity balance {} ", [event.params.quantity.toString()])
  log.info("marketItemListed quantity balance {} ", [marketItemListed.quantity.toString()])
  marketItemListed.quantity = marketItemListed.quantity.minus(event.params.quantity)

  marketItemListed.save()

  let marketPlaceItem = MarketPlaceItem.load(event.params.tokenId.toString().concat("-").concat(event.params.erc1155Address.toHex()))
  if (marketPlaceItem == null) {
    marketPlaceItem = new MarketPlaceItem(event.params.tokenId.toString().concat("-").concat(event.params.erc1155Address.toHex()))
  }
  
  if (marketItemListed.quantity == BigInt.fromI32(0)) {
    marketPlaceItem.listingCounter = marketPlaceItem.listingCounter.minus(BigInt.fromI32(1))
    marketPlaceItem.blockTimestamp = event.block.timestamp
    marketPlaceItem.save()
  }
}

export function handleMarketItemRemoved(event: MarketItemRemovedEvent): void {
  let entity = new MarketItemRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.listingId = event.params.listingId
  entity.erc1155Address = event.params.erc1155Address
  entity.erc20Address = event.params.erc20Address
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.removedType = event.params.removedType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let marketItemListed = MarketItemListed.load(event.params.listingId.toString())
  if (marketItemListed == null) {
    marketItemListed = new MarketItemListed(event.params.listingId.toString())
  }
  log.info("marketItemListed id {} , ", [event.params.listingId.toString()])
  //store.remove("MarketItemListed", event.params.listingId.toString())
}