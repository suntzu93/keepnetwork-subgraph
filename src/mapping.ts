import { BigInt , 
  log} from "@graphprotocol/graph-ts"
import { 
  Contract, 
  Approval, 
  Transfer  } from "../generated/Contract/Contract"
import { 
  Approval  as ApprovalEvent,
  Transfer as TransferEvent , 
  Governance, 
  TokenHolder} from "../generated/schema"

import {
  ZERO_ADDRESS,
  BIGINT_ONE,
  BIGINT_ZERO
} from "./utils/contants";

import {
  getOrCreateApproval,
  getOrCreateTransfer,
  getOrCreateTokenHolder,
  getGovernanceEntity
} from "./utils/helpers";
import { toDecimal } from "./utils/decimals";


export function handleApproval(event: Approval): void {
  let id = event.transaction.hash.toHex()
  let approval = getOrCreateApproval(id)
  approval.owner = event.params.owner
  approval.spender = event.params.spender
  approval.value = event.params.value
  approval.timestamp = event.block.timestamp
  approval.blockNumber = event.block.number
  approval.save()
}

export function handleTransfer(event: Transfer): void {
  let id = event.transaction.hash.toHex()
  let transfer = getOrCreateTransfer(id)
  let fromHolder = getOrCreateTokenHolder(event.params.from.toHexString());
  let toHolder = getOrCreateTokenHolder(event.params.to.toHexString());
  let governance = getGovernanceEntity();

  //Transfer
  transfer.blockNumber = event.block.number;
  transfer.timestamp = event.block.timestamp;
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.value = toDecimal(event.params.value);
  transfer.save()

  // fromHolder
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    let fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw =
    fromHolder.tokenBalanceRaw.minus(event.params.value);
    fromHolder.tokenBalance = toDecimal(fromHolder.tokenBalanceRaw);

    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error("Negative balance on holder {} with balance {}", [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString()
      ]);
    }

    if (
      fromHolder.tokenBalanceRaw == BIGINT_ZERO &&
      fromHolderPreviousBalance > BIGINT_ZERO
    ) {
      governance.currentTokenHolders =
        governance.currentTokenHolders.minus(BIGINT_ONE);
      governance.save();
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO &&
      fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders =
        governance.currentTokenHolders.plus(BIGINT_ONE);
      governance.save();
    }

    fromHolder.save();
  }
  // toHolder
  let toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw.plus(event.params.value);
  toHolder.tokenBalance = toDecimal(toHolder.tokenBalanceRaw);
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw.plus(event.params.value);
  toHolder.totalTokensHeld = toDecimal(toHolder.totalTokensHeldRaw);

  if (
    toHolder.tokenBalanceRaw == BIGINT_ZERO &&
    toHolderPreviousBalance > BIGINT_ZERO
  ) {
    governance.currentTokenHolders =
      governance.currentTokenHolders.minus(BIGINT_ONE);
    governance.save();
  } else if (
    toHolder.tokenBalanceRaw > BIGINT_ZERO &&
    toHolderPreviousBalance == BIGINT_ZERO
  ) {
    governance.currentTokenHolders =
      governance.currentTokenHolders.plus(BIGINT_ONE);
    governance.save();
  }

  toHolder.save();
}
