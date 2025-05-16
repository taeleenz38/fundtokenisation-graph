import { store, Bytes, crypto } from "@graphprotocol/graph-ts"
import {
    MintRequested as MintRequestedEvent,
    PriceIdSetForDeposit as PriceIdSetForDepositEvent,
    ClaimableTimestampSet as ClaimableTimestampSetEvent,
    MintCompleted as MintCompletedEvent,
    RedemptionRequested as RedemptionRequestedEvent,
    RedemptionCompleted as RedemptionCompletedEvent,
    PriceIdSetForRedemption as PriceIdSetForRedemptionEvent,
    RedemptionApproved as RedemptionApprovedEvent
} from "../generated/AYFManager/AYFManager"
import {
    PendingDepositRequest,
    DepositTransactionHistory,
    PriceIdIndex,
    LatestPriceUpdated,
    RedemptionRequested,
    RedemptionCompleted,
    PriceIdSetForRedemption,
    RedemptionRequest,
    RedemptionApproved,
    MintCompleted,
    MintRequested,
    RedemptionTransactionHistory
} from "../generated/schema"

import { BigInt } from "@graphprotocol/graph-ts";
import { formatDate } from "./utills/utillServices";
const COLLATERAL_TYPE = crypto.keccak256(Bytes.fromUTF8("USDC"));

export function handleMintRequestedEvent(event: MintRequestedEvent): void {
    const requestTimeStamp = formatDate(event.block.timestamp);
    let entity = new MintRequested(event.params.depositId)
    entity.user = event.params.user
    entity.collateralAmountDeposited = event.params.collateralAmountDeposited
    entity.depositAmountAfterFee = event.params.depositAmountAfterFee
    entity.feeAmount = event.params.feeAmount
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.save()

    let pendingDepositRequestEntity = new PendingDepositRequest(event.params.depositId)
    pendingDepositRequestEntity.user = event.params.user
    pendingDepositRequestEntity.collateralAmountDeposited = event.params.collateralAmountDeposited
    pendingDepositRequestEntity.depositAmountAfterFee = event.params.depositAmountAfterFee
    pendingDepositRequestEntity.feeAmount = event.params.feeAmount
    pendingDepositRequestEntity.status = "REQUESTED"
    pendingDepositRequestEntity.requestTimestamp = requestTimeStamp
    pendingDepositRequestEntity.save()

    let transactionHistoryEntity = new DepositTransactionHistory(event.params.depositId)
    transactionHistoryEntity.collateralAmount = event.params.collateralAmountDeposited
    transactionHistoryEntity.user = event.params.user
    transactionHistoryEntity.type = "Invest"
    transactionHistoryEntity.currency = "AUDC"
    transactionHistoryEntity.status = "SUBMITTED"
    transactionHistoryEntity.stableAmount = event.params.depositAmountAfterFee
    transactionHistoryEntity.feeAmount = event.params.feeAmount
    transactionHistoryEntity.requestTime = requestTimeStamp
    transactionHistoryEntity.transactionDate = requestTimeStamp
    transactionHistoryEntity.save()
}

export function handlePriceIdSetForDepositEvent(event: PriceIdSetForDepositEvent): void {
    let depositId = event.params.depositIdSet;

    let pendingDepositRequestEntity = PendingDepositRequest.load(depositId);
    if (pendingDepositRequestEntity != null) {
        pendingDepositRequestEntity.priceId = event.params.priceIdSet;

        let priceIdIndex = PriceIdIndex.load(event.params.priceIdSet.toHex())
        if (priceIdIndex != null) {
            let latestPriceEntity = LatestPriceUpdated.load(priceIdIndex.latestPriceId)

            if (latestPriceEntity != null) {
                let price = latestPriceEntity.price;

                if (price && price.notEqual(BigInt.fromI32(0))) {
                    pendingDepositRequestEntity.price = price
                    let depositAmountAfterFee = pendingDepositRequestEntity.depositAmountAfterFee;

                    let scaledDepositAmount = depositAmountAfterFee.times(BigInt.fromI32(100));
                    let claimableAmount = scaledDepositAmount.div(price);

                    pendingDepositRequestEntity.claimableAmount = claimableAmount;
                    let transactionHistoryEntity = DepositTransactionHistory.load(depositId);
                    if (transactionHistoryEntity != null) {

                        transactionHistoryEntity.price = latestPriceEntity.price
                        transactionHistoryEntity.save()
                    }
                }
            }
        }
        pendingDepositRequestEntity.save();
    }
}

export function handleClaimableTimestampSetEvent(event: ClaimableTimestampSetEvent): void {
    let depositId = event.params.depositId;
    const claimTimestampFormatted = formatDate(event.params.claimTimestamp);

    let pendingDepositRequestEntity = PendingDepositRequest.load(depositId);
    if (pendingDepositRequestEntity != null) {
        pendingDepositRequestEntity.claimableTimestamp = claimTimestampFormatted;

        let price = pendingDepositRequestEntity.price;

        if (price && price.notEqual(BigInt.fromI32(0))) {
            let depositAmountAfterFee = pendingDepositRequestEntity.depositAmountAfterFee;

            let scaledDepositAmount = depositAmountAfterFee.times(BigInt.fromI32(10).pow(18));
            let claimableAmount = scaledDepositAmount.div(price);

            pendingDepositRequestEntity.claimableAmount = claimableAmount;
        }

        pendingDepositRequestEntity.save();
    }
}

export function handleMintCompletedEvent(event: MintCompletedEvent): void {
    let depositId = event.params.depositId;
    const mintTimestamp = formatDate(event.block.timestamp);

    let entity = new MintCompleted(depositId)
    entity.user = event.params.user
    entity.rwaAmountOut = event.params.rwaAmountOut
    entity.collateralAmountDeposited = event.params.collateralAmountDeposited
    entity.price = event.params.price
    entity.priceId = event.params.priceId
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.save()

    let pendingDepositRequestEntity = PendingDepositRequest.load(depositId);
    if (pendingDepositRequestEntity != null) {
        store.remove("PendingDepositRequest", depositId.toHex());
    }

    let transactionHistoryEntity = DepositTransactionHistory.load(depositId);
    if (transactionHistoryEntity != null) {
        transactionHistoryEntity.status = "COMPLETED"

        let priceIdIndex = PriceIdIndex.load(event.params.priceId.toHex())
        if (priceIdIndex != null) {
            let latestPriceEntity = LatestPriceUpdated.load(priceIdIndex.latestPriceId)

            if (latestPriceEntity != null) {
                transactionHistoryEntity.price = latestPriceEntity.price
            }
        }
        transactionHistoryEntity.transactionDate = mintTimestamp
        transactionHistoryEntity.completedTime = mintTimestamp

        let rwaAmountOut = event.params.rwaAmountOut;
        //let rwaAmountOutConverted = rwaAmountOut.div(BigInt.fromI32(10).pow(16));

        transactionHistoryEntity.tokenAmount = rwaAmountOut
        transactionHistoryEntity.save()
    }
}

export function handleRedemptionRequestedEvent(event: RedemptionRequestedEvent): void {
        const requestTimeStamp = formatDate(event.block.timestamp);
        let cType= 'USDC'
        let entity = new RedemptionRequested(
        event.transaction.hash.concatI32(event.logIndex.toI32())
        )
    
        entity.user = event.params.user
        entity.redemptionId = event.params.redemptionId
        entity.rwaAmountIn = event.params.rwaAmountIn
        if (COLLATERAL_TYPE.equals(event.params.collateralType)) {
            cType = 'USDC';
        } else {
            cType = 'AUDC';
        }
        entity.collateralType = cType
        entity.blockNumber = event.block.number
        entity.blockTimestamp = event.block.timestamp
        entity.transactionHash = event.transaction.hash

        entity.save()

        let displayId = event.params.redemptionId.toHexString() + '-'+ cType

        let redemptionId = event.params.redemptionId.toHex();
        let collateralType = event.params.collateralType.toString();
        
        let combinedKeyString = redemptionId + "-" + collateralType;
        let combinedKey = Bytes.fromUTF8(combinedKeyString);
        let pendingRedemption = new RedemptionRequest(
            combinedKey
        )
        pendingRedemption.user = event.params.user
        pendingRedemption.rwaAmountIn = event.params.rwaAmountIn
        pendingRedemption.redemptionId = event.params.redemptionId
        pendingRedemption.collateralType = cType
        pendingRedemption.requestTimestamp = requestTimeStamp
        pendingRedemption.blockTimestamp = event.block.timestamp
        pendingRedemption.status = 'REQUESTED'
        pendingRedemption.claimApproved = false
        pendingRedemption.displayId = displayId
                
        pendingRedemption.save()
        
        let transactionHistoryEntity = new RedemptionTransactionHistory(event.params.redemptionId)
        transactionHistoryEntity.user = event.params.user
        transactionHistoryEntity.type = "Redemption"
        transactionHistoryEntity.currency = cType
        transactionHistoryEntity.status = "SUBMITTED"
        transactionHistoryEntity.tokenAmount = event.params.rwaAmountIn
        transactionHistoryEntity.collateralType = cType
        transactionHistoryEntity.requestTime = requestTimeStamp
        transactionHistoryEntity.transactionDate = requestTimeStamp
        transactionHistoryEntity.displayId = displayId
        transactionHistoryEntity.save()

}

export function handleRedemptionCompletedEvent(event: RedemptionCompletedEvent): void {
    let redemptionId = event.params.redemptionId;
    const redemptionTimestamp = formatDate(event.block.timestamp);
    let entity = new RedemptionCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    entity.user = event.params.user
    entity.redemptionId = redemptionId
    entity.rwaAmountRequested = event.params.rwaAmountRequested
    entity.collateralAmountReturned = event.params.collateralAmountReturned
    entity.price = event.params.price
    if (COLLATERAL_TYPE.equals(event.params.collateralType)) {
        entity.collateralType = 'USDC';
    } else {
        entity.collateralType = 'AUDC';
    }    
    
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
    let rId = event.params.redemptionId.toHex();
    let collateralType = event.params.collateralType.toString();
    
    let combinedKeyString = rId + "-" + collateralType;
    let combinedKey = Bytes.fromUTF8(combinedKeyString);

    let redemptionRequestEntity = RedemptionRequest.load(
        combinedKey
    )   
    if(redemptionRequestEntity!=null){
       store.remove("RedemptionRequest", combinedKey.toHex());
    }

    let transactionHistoryEntity = RedemptionTransactionHistory.load(redemptionId);
    if (transactionHistoryEntity != null) {
        transactionHistoryEntity.status = "COMPLETED"

        transactionHistoryEntity.price = event.params.price
        transactionHistoryEntity.transactionDate = redemptionTimestamp
        transactionHistoryEntity.completedTime = redemptionTimestamp

        let rwaAmountRequested = event.params.rwaAmountRequested;
        //let rwaAmountOutConverted = rwaAmountRequested.div(BigInt.fromI32(10).pow(16));

        transactionHistoryEntity.tokenAmount = rwaAmountRequested
        let stableAmount = rwaAmountRequested.times(event.params.price);
        let stableAmountConverted = stableAmount.div(BigInt.fromI32(10).pow(18));
        transactionHistoryEntity.stableAmount = stableAmountConverted
        transactionHistoryEntity.save()
    }
}

export function handleRedemptionApproved(event: RedemptionApprovedEvent): void{
    let entity = new RedemptionApproved(
        event.transaction.hash.concatI32(event.logIndex.toI32())
        )
        entity.redemptionIdSet = event.params.redemptionId
        if (COLLATERAL_TYPE.equals(event.params.collateralType)) {
            entity.collateralType = 'USDC';
        } else {
            entity.collateralType = 'AUDC';
        }    

        let redemptionId = event.params.redemptionId.toHex();
        let collateralType = event.params.collateralType.toString();
        
        let combinedKeyString = redemptionId + "-" + collateralType;
        let combinedKey = Bytes.fromUTF8(combinedKeyString);        
    let redemptionRequestEntity = RedemptionRequest.load(
        combinedKey
    )   
    if(redemptionRequestEntity!=null){
        redemptionRequestEntity.claimApproved = true
        redemptionRequestEntity.save()
    }
    
}

export function handlePriceIdSetForRedemption(event: PriceIdSetForRedemptionEvent): void {
    let entity = new PriceIdSetForRedemption(
    event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.redemptionIdSet = event.params.redemptionIdSet
    entity.priceIdSet = event.params.priceIdSet
    entity.collateralType = event.params.collateralType
    
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
    let redemptionId = event.params.redemptionIdSet.toHex();
    let collateralType = event.params.collateralType.toString();
    
    let combinedKeyString = redemptionId + "-" + collateralType;
    let combinedKey = Bytes.fromUTF8(combinedKeyString);
    let redemptionRequestEntity = RedemptionRequest.load(
        combinedKey
    )       
    if(redemptionRequestEntity!=null){
        redemptionRequestEntity.priceId = event.params.priceIdSet
        redemptionRequestEntity.tokenAmount = redemptionRequestEntity.rwaAmountIn
        let priceIdIndex = PriceIdIndex.load(event.params.priceIdSet.toHex())
        if (priceIdIndex != null) {
            let latestPriceEntity: LatestPriceUpdated | null = LatestPriceUpdated.load(priceIdIndex.latestPriceId)

            if (latestPriceEntity != null) {
                redemptionRequestEntity.price = latestPriceEntity.price
                let redeemAmount = redemptionRequestEntity.rwaAmountIn.times(latestPriceEntity.price);
                let redeemAmountConverted = redeemAmount.div(BigInt.fromI32(10).pow(18));
                redemptionRequestEntity.redeemAmount = redeemAmountConverted
                let transactionHistoryEntity = RedemptionTransactionHistory.load(event.params.redemptionIdSet);
                if (transactionHistoryEntity != null) {

                    transactionHistoryEntity.price = latestPriceEntity.price
                    transactionHistoryEntity.save()
                }

            }
        }
        redemptionRequestEntity.save()
    }    
}