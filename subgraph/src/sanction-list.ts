import {
  AddSanction as AddSanctionEvent,
  RemoveSanction as RemoveSanctionEvent,
} from "../generated/SanctionList/SanctionList"
import {
  AddSanction,
  RemoveSanction,
} from "../generated/schema"

export function handleAddSanction(event: AddSanctionEvent): void {
  let entity = new AddSanction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._address = event.params._address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveSanction(event: RemoveSanctionEvent): void {
  let entity = new RemoveSanction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._address = event.params._address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}