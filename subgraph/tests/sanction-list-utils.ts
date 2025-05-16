import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  AddSanction,
  RemoveSanction,
} from "../generated/SanctionList/SanctionList"

export function createAddSanctionEvent(_address: Address): AddSanction {
  let addSanctionEvent = changetype<AddSanction>(newMockEvent())

  addSanctionEvent.parameters = new Array()

  addSanctionEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  )

  return addSanctionEvent
}

export function createRemoveSanctionEvent(_address: Address): RemoveSanction {
  let removeSanctionEvent = changetype<RemoveSanction>(newMockEvent())

  removeSanctionEvent.parameters = new Array()

  removeSanctionEvent.parameters.push(
    new ethereum.EventParam("_address", ethereum.Value.fromAddress(_address))
  )

  return removeSanctionEvent
}
