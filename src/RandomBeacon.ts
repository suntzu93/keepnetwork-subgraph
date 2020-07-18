import { BigInt,log } from "@graphprotocol/graph-ts"
import {
  RandomBeaconContract,
  ExpiredLockReleased,
  LockReleased,
  RecoveredStake,
  StakeLocked,
  Staked,
  TokensSeized,
  TokensSlashed,
  Undelegated
} from "../generated/RandomBeaconContract/RandomBeaconContract"
import {
  getTokenStaking,
  getOrCreateMember,
  getOrCreateTransactionStaking
} from "./utils/helpers";

import { BIGINT_ONE } from "./utils/contants";

export function handleStaked(event: Staked): void {
  let tokenStaking = getTokenStaking();
  let member = getOrCreateMember(event.params.from.toHex());
  member.amount = event.params.value;
  member.tokenStaking = tokenStaking.id;
  member.stakingState = "STAKED";

  let contract = RandomBeaconContract.bind(event.address);
  tokenStaking.initializationPeriod = contract.initializationPeriod();
  tokenStaking.maximumLockDuration = contract.maximumLockDuration();
  tokenStaking.minimumStake = contract.minimumStake();
  tokenStaking.minimumStakeSchedule = contract.minimumStakeSchedule();
  tokenStaking.minimumStakeScheduleStart = contract.minimumStakeScheduleStart();
  tokenStaking.minimumStakeSteps = contract.minimumStakeSteps();
  tokenStaking.totalStaker = tokenStaking.totalStaker.plus(BIGINT_ONE);
  tokenStaking.totalTokenStaking = tokenStaking.totalTokenStaking.plus(event.params.value);

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;

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
  transactionStaking.save()
}

export function handleRecoveredStake(event: RecoveredStake): void{
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "STAKED";
  member.recoveredAt = event.params.recoveredAt;
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
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
  transactionStaking.save()
}

export function handleTokensSlashed(event: TokensSlashed): void {
  let tokenStaking = getTokenStaking();
  tokenStaking.totalTokenSlash = tokenStaking.totalTokenSlash.plus(event.params.amount);
  let contract = RandomBeaconContract.bind(event.address);
  tokenStaking.initializationPeriod = contract.initializationPeriod();
  tokenStaking.maximumLockDuration = contract.maximumLockDuration();
  tokenStaking.minimumStake = contract.minimumStake();
  tokenStaking.minimumStakeSchedule = contract.minimumStakeSchedule();
  tokenStaking.minimumStakeScheduleStart = contract.minimumStakeScheduleStart();
  tokenStaking.minimumStakeSteps = contract.minimumStakeSteps();
  tokenStaking.save()

  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "SLASHED";
  member.amount = event.params.amount;
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.save()
}

export function handleTokensSeized(event: TokensSeized): void {
  let tokenStaking = getTokenStaking();
  tokenStaking.totalTokenSlash = tokenStaking.totalTokenSlash.plus(event.params.amount);
  let contract = RandomBeaconContract.bind(event.address);
  tokenStaking.initializationPeriod = contract.initializationPeriod();
  tokenStaking.maximumLockDuration = contract.maximumLockDuration();
  tokenStaking.minimumStake = contract.minimumStake();
  tokenStaking.minimumStakeSchedule = contract.minimumStakeSchedule();
  tokenStaking.minimumStakeScheduleStart = contract.minimumStakeScheduleStart();
  tokenStaking.minimumStakeSteps = contract.minimumStakeSteps();
  tokenStaking.save()

  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "SEIZED";
  member.amount = event.params.amount;
  member.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.save()
}


export function handleUndelegated(event: Undelegated): void {
  let member = getOrCreateMember(event.params.operator.toHex());
  member.stakingState = "UNDELEGATED";
  member.undelegatedAt = event.params.undelegatedAt;
  member.save()

  let tokenStaking = getTokenStaking();
  tokenStaking.totalTokenStaking = tokenStaking.totalTokenStaking.minus(member.amount);
  tokenStaking.totalStaker = tokenStaking.totalStaker.minus(BIGINT_ONE);
  tokenStaking.save()

  let transactionStaking = getOrCreateTransactionStaking(event.transaction.hash.toHex());
  transactionStaking.timestamp = event.block.timestamp;
  transactionStaking.blockNumber = event.block.number;
  transactionStaking.member = member.id;
  transactionStaking.save()
}
