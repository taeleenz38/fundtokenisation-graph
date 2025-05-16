import { BigInt, dataSource, log } from "@graphprotocol/graph-ts"
import { ERC20Burn, ERC20Mint, ERC20Paused, ERC20Transfer, ERC20Unpaused, UserERC20TokenBalance } from "../generated/schema"
import {
  Burn as BurnEvent,
  Mint as MintEvent, 
  Paused as PausedEvent,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent
} from "../generated/templates/ERC20Token/ERC20Token"

const SEPARATOR = "-"

export function handleBurn(event: BurnEvent): void {
  let entity = new ERC20Burn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMint(event: MintEvent): void {
  let entity = new ERC20Mint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new ERC20Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new ERC20Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Check the tranfer single
  if (event.params.from.toHex() != "0x0000000000000000000000000000000000000000" 
    && event.params.to.toHex() != "0x0000000000000000000000000000000000000000") {
    
    log.info("Transfer {} ", ["From and To are not zero"])
    // Load the UserToken Balance for the From user 
    let fromUserBalanceEntity = UserERC20TokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.from.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (fromUserBalanceEntity == null) {
      fromUserBalanceEntity = new UserERC20TokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.from.toHex())
      )
      fromUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    fromUserBalanceEntity.balance = fromUserBalanceEntity.balance.minus(event.params.value);
    fromUserBalanceEntity.owner = event.params.from;
    log.info("ERC20 Transfer from {} balance {} ", [fromUserBalanceEntity.id, fromUserBalanceEntity.balance.toString()])
    assignUserERC20BalanceEntityValues(fromUserBalanceEntity, event) 

    // Load the UserToken Balance of the To user
    let toUserBalanceEntity = UserERC20TokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.to.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (toUserBalanceEntity == null) {
      toUserBalanceEntity = new UserERC20TokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.to.toHex())
      )
      toUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    toUserBalanceEntity.balance = toUserBalanceEntity.balance.plus(event.params.value)
    toUserBalanceEntity.owner = event.params.to;
    log.info("ERC20 Transfer to {} balance {} ", [toUserBalanceEntity.id, toUserBalanceEntity.balance.toString()])
    assignUserERC20BalanceEntityValues(toUserBalanceEntity, event)

    // Check the Mint
  } else if (event.params.to.toHex() != "0x0000000000000000000000000000000000000000") {
    log.info("ERC 20 Mint {} ", ["To is not zero"])
    // Load the UserToken Balance of the To user
    let toUserBalanceEntity = UserERC20TokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.to.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (toUserBalanceEntity == null) {
      toUserBalanceEntity = new UserERC20TokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.to.toHex())
      )
      toUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    toUserBalanceEntity.balance = toUserBalanceEntity.balance.plus(event.params.value)
    toUserBalanceEntity.owner = event.params.to;
    log.info("ERC 20 Mint {} balance {} ", [toUserBalanceEntity.id, toUserBalanceEntity.balance.toString()])
    assignUserERC20BalanceEntityValues(toUserBalanceEntity, event)

    // Check the Burn function
  } else if (event.params.from.toHex() != "0x0000000000000000000000000000000000000000") {
    log.info("ERC20 Burn {} ", ["From is not zero"])
    // Load the UserToken Balance for the From user 
    let fromUserBalanceEntity = UserERC20TokenBalance.load(
      event.address.toHex().concat(SEPARATOR).concat(event.params.from.toHex())
    )
    // Check the To user exist in UserTokenBalance entity
    if (fromUserBalanceEntity == null) {
      fromUserBalanceEntity = new UserERC20TokenBalance(
        event.address.toHex().concat(SEPARATOR).concat(event.params.from.toHex())
      )
      fromUserBalanceEntity.balance = BigInt.zero();
    }
    // Update the balance
    fromUserBalanceEntity.balance = fromUserBalanceEntity.balance.minus(event.params.value);
    fromUserBalanceEntity.owner = event.params.from;
    log.info("ERC20 Burn {} balance {} ", [fromUserBalanceEntity.id, fromUserBalanceEntity.balance.toString()])
    assignUserERC20BalanceEntityValues(fromUserBalanceEntity, event) 
  }
}

export function assignUserERC20BalanceEntityValues(userBalanceEntity : UserERC20TokenBalance, event: TransferEvent): void {

  let context = dataSource.context()

  userBalanceEntity.contractAddress = event.address
  userBalanceEntity.tokenName = context.getString('tokenName')
  userBalanceEntity.tokenSymbol = context.getString('tokenSymbol')
  userBalanceEntity.tokenDecimal = BigInt.fromString(context.getString('tokenDecimal'))

  userBalanceEntity.blockNumber = event.block.number
  userBalanceEntity.blockTimestamp = event.block.timestamp
  userBalanceEntity.transactionHash = event.transaction.hash

  userBalanceEntity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new ERC20Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
