import { BigInt,log, Address } from "@graphprotocol/graph-ts"
import {
  StakingContract,
  ExpiredLockReleased,
  LockReleased,
  OperatorStaked,
  RecoveredStake,
  StakeDelegated,
  StakeLocked,
  StakeOwnershipTransferred,
  TokensSeized,
  TokensSlashed,
  TopUpCompleted,
  TopUpInitiated,
  Undelegated
} from "../generated/StakingContract/StakingContract"
import {
  getTokenStaking,
  getOrCreateMember,
  getOrCreateTransactionStaking
} from "./utils/helpers";

import { 
  Contract as MainContract } from "../generated/Contract/Contract"

import { BIGINT_ONE, KEEP_CONTRACT } from "./utils/contants";
import { toDecimal } from "./utils/decimals";

export function handleOperatorStaked(event: OperatorStaked): void {
  let tokenStaking = getTokenStaking();
  let member = getOrCreateMember(event.params.operator.toHex());
  member.amount = toDecimal(event.params.value);
  member.tokenStaking = tokenStaking.id;
  member.stakingState = "STAKED";

  let contract = StakingContract.bind(event.address);
  let mainContract = MainContract.bind(Address.fromString(KEEP_CONTRACT));
  tokenStaking.initializationPeriod = contract.initializationPeriod();
  tokenStaking.minimumStake = contract.minimumStake();
  tokenStaking.undelegationPeriod = contract.undelegationPeriod();
  tokenStaking.totalStaker = tokenStaking.totalStaker.plus(BIGINT_ONE);
  tokenStaking.totalTokenStaking = toDecimal(mainContract.balanceOf(event.address));

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.value = toDecimal(event.params.value);
  transactionStaking.transactionType = member.stakingState;

  tokenStaking.save()
  member.save()
  transactionStaking.save()
}

export function handleStakeLocked(event: StakeLocked): void {
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "STAKED_LOCK";
  member.until = event.params.until;
  member.lockCreater =  event.params.lockCreator;
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}

export function handleLockReleased(event: LockReleased): void {
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "LOCK_RELEASED";
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}

export function handleRecoveredStake(event: RecoveredStake): void{
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "STAKED";
  member.recoveredAt = event.block.timestamp;
  member.save()

  let mainContract = MainContract.bind(Address.fromString(KEEP_CONTRACT));
  let tokenStaking = getTokenStaking();
  tokenStaking.totalStaker = tokenStaking.totalStaker.minus(BIGINT_ONE);
  tokenStaking.totalTokenStaking = toDecimal(mainContract.balanceOf(event.address));
  tokenStaking.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = "RECOVERED_STAKED";
  transactionStaking.save()
}


export function handleExpiredLockReleased(event: ExpiredLockReleased): void {
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "EXPIRED_LOCK_RELEASED";
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}

export function handleTokensSlashed(event: TokensSlashed): void {
  let tokenStaking = getTokenStaking();
  tokenStaking.totalTokenSlash = tokenStaking.totalTokenSlash.plus(toDecimal(event.params.amount));
  let contract = StakingContract.bind(event.address);
  tokenStaking.initializationPeriod = contract.initializationPeriod();
  tokenStaking.minimumStake = contract.minimumStake();
  tokenStaking.undelegationPeriod = contract.undelegationPeriod();
  tokenStaking.save()

  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "SLASHED";
  member.amount = toDecimal(event.params.amount);
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}

export function handleTokensSeized(event: TokensSeized): void {
  let tokenStaking = getTokenStaking();
  tokenStaking.totalTokenSlash = tokenStaking.totalTokenSlash.plus(toDecimal(event.params.amount));
  let contract = StakingContract.bind(event.address);
  tokenStaking.initializationPeriod = contract.initializationPeriod();
  tokenStaking.minimumStake = contract.minimumStake();
  tokenStaking.undelegationPeriod = contract.undelegationPeriod();
  tokenStaking.save()

  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "SEIZED";
  member.amount = toDecimal(event.params.amount);
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}


export function handleUndelegated(event: Undelegated): void {
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "UNDELEGATED";
  member.undelegatedAt = event.params.undelegatedAt;
  member.save()

  let mainContract = MainContract.bind(Address.fromString(KEEP_CONTRACT));
  let tokenStaking = getTokenStaking();
  tokenStaking.totalStaker = tokenStaking.totalStaker.minus(BIGINT_ONE);
  tokenStaking.totalTokenStaking = toDecimal(mainContract.balanceOf(event.address));
  tokenStaking.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.value = member.amount
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}


export function handleStakeDelegated(event: StakeDelegated): void {
  let tokenStaking = getTokenStaking();
  let member = getOrCreateMember(event.params.operator.toHex());
  member.tokenStaking = tokenStaking.id;
  member.stakingState = "DELEGATED";
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.from = event.transaction.from.toHex();
  transactionStaking.to = event.transaction.to.toHex();
  transactionStaking.gasUsed = event.transaction.gasUsed;
  transactionStaking.gasPrice = event.transaction.gasPrice;
  transactionStaking.transactionType = member.stakingState;
  transactionStaking.save()
}

export function handleStakeOwnershipTransferred(
  event: StakeOwnershipTransferred
): void {}

export function handleTopUpCompleted(event: TopUpCompleted): void {
  let member = getOrCreateMember(event.params.operator.toHex());
  member.amount = toDecimal(event.params.newAmount);
  member.save()
}

export function handleTopUpInitiated(event: TopUpInitiated): void {
  
}