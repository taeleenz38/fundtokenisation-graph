import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  ERC1155ContractDeployed,
  ERC20ContractDeployed
} from "../generated/DeployManager/DeployManager"

export function createERC1155ContractDeployedEvent(
  erc1155Token: Address,
  tokenType: string,
  baseUri: string
): ERC1155ContractDeployed {
  let erc1155ContractDeployedEvent = changetype<ERC1155ContractDeployed>(
    newMockEvent()
  )

  erc1155ContractDeployedEvent.parameters = new Array()

  erc1155ContractDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "erc1155Token",
      ethereum.Value.fromAddress(erc1155Token)
    )
  )
  erc1155ContractDeployedEvent.parameters.push(
    new ethereum.EventParam("tokenType", ethereum.Value.fromString(tokenType))
  )
  erc1155ContractDeployedEvent.parameters.push(
    new ethereum.EventParam("baseUri", ethereum.Value.fromString(baseUri))
  )

  return erc1155ContractDeployedEvent
}

export function createERC20ContractDeployedEvent(
  erc20Token: Address,
  tokenName: string,
  tokenSymbol: string
): ERC20ContractDeployed {
  let erc20ContractDeployedEvent = changetype<ERC20ContractDeployed>(
    newMockEvent()
  )

  erc20ContractDeployedEvent.parameters = new Array()

  erc20ContractDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "erc20Token",
      ethereum.Value.fromAddress(erc20Token)
    )
  )
  erc20ContractDeployedEvent.parameters.push(
    new ethereum.EventParam("tokenName", ethereum.Value.fromString(tokenName))
  )
  erc20ContractDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenSymbol",
      ethereum.Value.fromString(tokenSymbol)
    )
  )

  return erc20ContractDeployedEvent
}
