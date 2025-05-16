import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { PriceAdded } from "../generated/schema"
import { PriceAdded as PriceAddedEvent } from "../generated/Pricer/Pricer"
import { handlePriceAdded } from "../src/pricer"
import { createPriceAddedEvent } from "./pricer-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let priceId = BigInt.fromI32(234)
    let price = BigInt.fromI32(234)
    let timestamp = BigInt.fromI32(234)
    let newPriceAddedEvent = createPriceAddedEvent(priceId, price, timestamp)
    handlePriceAdded(newPriceAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("PriceAdded created and stored", () => {
    assert.entityCount("PriceAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PriceAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "priceId",
      "234"
    )
    assert.fieldEquals(
      "PriceAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )
    assert.fieldEquals(
      "PriceAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
