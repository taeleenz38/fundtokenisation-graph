import { Bytes } from "@graphprotocol/graph-ts"
import {
    AccountStatusSetByAdmin as AccountStatusSetByAdminEvent,
} from "../generated/AllowlistUpgradeable/AllowlistUpgradeable"
import {
    AccountStatusSetByAdmin,
    AccountStatusSetByIndex,
    LatestUniqueAccountStatusSetByAdmin,
} from "../generated/schema"
import { formatDate } from "./utills/utillServices";

export function handleAccountStatusSetByAdmin(event: AccountStatusSetByAdminEvent): void {
    const date = formatDate(event.block.timestamp);
    let entityId = event.transaction.hash.concatI32(event.logIndex.toI32())
    let entity = new AccountStatusSetByAdmin(entityId)

      entity.account = event.params.account
      entity.termIndex = event.params.termIndex
      entity.status = event.params.status
      entity.date = date
      entity.blockNumber = event.block.number
      entity.blockTimestamp = event.block.timestamp
      entity.transactionHash = event.transaction.hash

      entity.save()

      let account = event.params.account.toHex();

      let accountStatusIndex = AccountStatusSetByIndex.load(account)
      if (accountStatusIndex == null) {
        accountStatusIndex = new AccountStatusSetByIndex(account)
        accountStatusIndex.accountStatusSetByAdmin = Bytes.empty() 
      }

      
      let existingEntity = LatestUniqueAccountStatusSetByAdmin.load(accountStatusIndex.accountStatusSetByAdmin)

      if (existingEntity != null) {
        if(existingEntity.blockTimestamp < event.block.timestamp){

            existingEntity.termIndex = event.params.termIndex
            existingEntity.status = event.params.status
            existingEntity.date = date
            existingEntity.blockNumber = event.block.number
            existingEntity.blockTimestamp = event.block.timestamp
            existingEntity.transactionHash = event.transaction.hash
        
            existingEntity.save()      

        }
      }else{
        let newEntity = new LatestUniqueAccountStatusSetByAdmin(
            entityId
          )
          newEntity.termIndex = event.params.termIndex
          newEntity.account = event.params.account
          newEntity.status = event.params.status
          newEntity.date = date

          newEntity.blockNumber = event.block.number
          newEntity.blockTimestamp = event.block.timestamp
          newEntity.transactionHash = event.transaction.hash
       
          newEntity.save()          

          accountStatusIndex.accountStatusSetByAdmin = entityId
          accountStatusIndex.save()
      }

}