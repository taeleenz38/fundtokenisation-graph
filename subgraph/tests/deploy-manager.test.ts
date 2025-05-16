import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { ERC1155ContractDeployed } from "../generated/schema"
import { ERC1155ContractDeployed as ERC1155ContractDeployedEvent } from "../generated/DeployManager/DeployManager"
import { handleERC1155ContractDeployed } from "../src/deploy-manager"
import { createERC1155ContractDeployedEvent } from "./deploy-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let erc1155Token = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let tokenType = "Example string value"
    let baseUri = "Example string value"
    let newERC1155ContractDeployedEvent = createERC1155ContractDeployedEvent(
      erc1155Token,
      tokenType,
      baseUri
    )
    handleERC1155ContractDeployed(newERC1155ContractDeployedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ERC1155ContractDeployed created and stored", () => {
    assert.entityCount("ERC1155ContractDeployed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ERC1155ContractDeployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "erc1155Token",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ERC1155ContractDeployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenType",
      "Example string value"
    )
    assert.fieldEquals(
      "ERC1155ContractDeployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "baseUri",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
