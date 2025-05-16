import { DataSourceContext } from "@graphprotocol/graph-ts/common/datasource"
import {
  ERC1155ContractDeployed as ERC1155ContractDeployedEvent,
  ERC20ContractDeployed as ERC20ContractDeployedEvent
} from "../generated/DeployManager/DeployManager"
import {
  ERC1155ContractDeployed,
  ERC20ContractDeployed,
  TokenDeployed
} from "../generated/schema"
import { ERC1155Token, ERC20Token } from "../generated/templates"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleERC1155ContractDeployed(
  event: ERC1155ContractDeployedEvent
): void {
  let entity = new ERC1155ContractDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.erc1155Token = event.params.tokenAddress
  entity.tokenName = event.params.tokenName
  entity.tokenSymbol = event.params.tokenSymbol
  entity.baseUri = event.params.baseUri
  entity.metaDataUri = event.params.metaDataUri

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let context = new DataSourceContext()
  context.setString('tokenName', event.params.tokenName)
  context.setString('tokenSymbol', event.params.tokenSymbol)
  ERC1155Token.createWithContext(event.params.tokenAddress, context)

  entity.save()

  let tokenEntity = new TokenDeployed(
    event.params.tokenAddress.toHex()
  )
  tokenEntity.tokenName = event.params.tokenName
  tokenEntity.tokenSymbol = event.params.tokenSymbol
  tokenEntity.tokenAddress = event.params.tokenAddress
  tokenEntity.metaDataUri = event.params.metaDataUri
  tokenEntity.tokenType = "ERC1155"

  tokenEntity.blockNumber = event.block.number
  tokenEntity.blockTimestamp = event.block.timestamp
  tokenEntity.transactionHash = event.transaction.hash

  tokenEntity.save()
}

export function handleERC20ContractDeployed(
  event: ERC20ContractDeployedEvent
): void {
  let entity = new ERC20ContractDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.erc20Token = event.params.tokenAddress
  entity.tokenName = event.params.tokenName
  entity.tokenSymbol = event.params.tokenSymbol
  entity.tokenDecimal = BigInt.fromI32(event.params.tokenDecimal)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let context = new DataSourceContext()
  context.setString('tokenName', event.params.tokenName)
  context.setString('tokenSymbol', event.params.tokenSymbol)
  context.setString('tokenDecimal', event.params.tokenDecimal.toString())

  ERC20Token.createWithContext(event.params.tokenAddress, context)

  entity.save()

  let tokenEntity = new TokenDeployed(
    event.params.tokenAddress.toHex()
  )
  tokenEntity.tokenName = event.params.tokenName
  tokenEntity.tokenSymbol = event.params.tokenSymbol
  tokenEntity.tokenAddress = event.params.tokenAddress
  tokenEntity.tokenDecimal = BigInt.fromI32(event.params.tokenDecimal)
  tokenEntity.tokenType = "ERC20"

  tokenEntity.blockNumber = event.block.number
  tokenEntity.blockTimestamp = event.block.timestamp
  tokenEntity.transactionHash = event.transaction.hash

  tokenEntity.save()
}
