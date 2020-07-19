import {
  Approval,
  Transfer,
  TokenHolder,
  Governance,
  TokenStaking,
  TransactionStaking,
  Member
} from "../../generated/schema";

import { DEFAULT_DECIMALS } from "./decimals";

import {
  ZERO_ADDRESS,
  BIGINT_ZERO,
  BIGINT_ONE,
  BIGDECIMAL_ZERO,
  BIGINT_SUPPLY,
  KEEP_CONTRACT
} from "./contants";
import { Bytes, Address } from "@graphprotocol/graph-ts";

export function getOrCreateApproval
  (id: string): Approval {
  let approval = Approval.load(id);
  if (approval == null) {
    approval = new Approval(id);
    approval.timestamp = BIGINT_ZERO;
    approval.blockNumber = BIGINT_ZERO;
    approval.value = BIGINT_ZERO;
  }
  approval.save();
  return approval as Approval;
}

export function getOrCreateTransfer
  (id: string): Transfer {
  let transfer = Transfer.load(id);
  if (transfer == null) {
    transfer = new Transfer(id);
    transfer.timestamp = BIGINT_ZERO;
    transfer.blockNumber = BIGINT_ZERO;
    transfer.value = BIGDECIMAL_ZERO;
    transfer.gasUsed = BIGINT_ZERO;
    transfer.gasPrice = BIGDECIMAL_ZERO;
  }
  return transfer as Transfer; 
}

export function getOrCreateTokenHolder(
  id: String,
  createIfNotFound: boolean = true,
  save: boolean = true
): TokenHolder {
  let tokenHolder = TokenHolder.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new TokenHolder(id);
    tokenHolder.tokenBalanceRaw = BIGINT_ZERO;
    tokenHolder.tokenBalance = BIGDECIMAL_ZERO;
    tokenHolder.totalTokensHeldRaw = BIGINT_ZERO;
    tokenHolder.totalTokensHeld = BIGDECIMAL_ZERO;

    if (id != ZERO_ADDRESS) {
      let governance = getGovernanceEntity();
      governance.totalTokenHolders = governance.totalTokenHolders.plus(BIGINT_ONE);
      governance.save();
    }

    if (save) {
      tokenHolder.save();
    }
  }

  return tokenHolder as TokenHolder;
}

export function getGovernanceEntity(): Governance {
  let governance = Governance.load("GOVERNANCE");

  if (governance == null) {
    governance = new Governance("GOVERNANCE");
    governance.totalTokenHolders = BIGINT_ZERO;
    governance.currentTokenHolders = BIGINT_ZERO;
    governance.decimals = DEFAULT_DECIMALS;
    governance.name = "KEEP Network";
    governance.symbol = "KEEP";
    governance.maxSupply = BIGINT_SUPPLY;
    governance.contractAddress = KEEP_CONTRACT;
  }

  return governance as Governance;
}

export function getTokenStaking(): TokenStaking{
  let tokenStaking = TokenStaking.load("TokenStaking");
  if(tokenStaking == null){
    tokenStaking = new TokenStaking("TokenStaking");
    tokenStaking.contractAddress = Address.fromString("0x6D1140a8c8e6Fac242652F0a5A8171b898c67600");
    tokenStaking.initializationPeriod = BIGINT_ZERO;
    tokenStaking.maximumLockDuration = BIGINT_ZERO;
    tokenStaking.minimumStake = BIGINT_ZERO;
    tokenStaking.minimumStakeSchedule = BIGINT_ZERO;
    tokenStaking.minimumStakeScheduleStart = BIGINT_ZERO;
    tokenStaking.minimumStakeSteps = BIGINT_ZERO;
    tokenStaking.totalStaker = BIGINT_ZERO;
    tokenStaking.totalTokenSlash = BIGDECIMAL_ZERO;
    tokenStaking.totalTokenStaking = BIGDECIMAL_ZERO;
  }
  return tokenStaking as TokenStaking;
}

export function getOrCreateMember(id: string): Member {
  let member = Member.load(id);
  if(member == null){
    member = new Member(id);
    member.amount = BIGDECIMAL_ZERO;
    member.stakingState = "STAKED";
    member.until = BIGINT_ZERO;
    member.tokenStaking = getTokenStaking().id;
    member.undelegatedAt = BIGINT_ZERO;
  }
  return member as Member;
}

export function getOrCreateTransactionStaking(id: string): TransactionStaking {
  let transactionStaking = TransactionStaking.load(id);
  if(transactionStaking == null){
    transactionStaking = new TransactionStaking(id);
    transactionStaking.timestamp = BIGINT_ZERO;
    transactionStaking.blockNumber = BIGINT_ZERO;
  }
  return transactionStaking as TransactionStaking;
}
