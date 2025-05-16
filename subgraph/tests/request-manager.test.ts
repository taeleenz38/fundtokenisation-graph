import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { RequestApproved } from "../generated/schema"
import { RequestApproved as RequestApprovedEvent } from "../generated/RequestManager/RequestManager"
import { handleRequestApproved } from "../src/request-manager"
import { createRequestApprovedEvent } from "./request-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let requestId = BigInt.fromI32(234)
    let seller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let admin = Address.fromString("0x0000000000000000000000000000000000000001")
    let uri = "Example string value"
    let quantity = BigInt.fromI32(234)
    let newRequestApprovedEvent = createRequestApprovedEvent(
      requestId,
      seller,
      admin,
      uri,
      quantity
    )
    handleRequestApproved(newRequestApprovedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("RequestApproved created and stored", () => {
    assert.entityCount("RequestApproved", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "RequestApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "requestId",
      "234"
    )
    assert.fieldEquals(
      "RequestApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "RequestApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "admin",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "RequestApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "uri",
      "Example string value"
    )
    assert.fieldEquals(
      "RequestApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "quantity",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
