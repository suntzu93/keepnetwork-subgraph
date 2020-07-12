import {
  Approval,
  Transfer,
  TokenHolder,
  Governance
} from "../../generated/schema";

import { DEFAULT_DECIMALS } from "./decimals";

import {
  ZERO_ADDRESS,
  BIGINT_ZERO,
  BIGINT_ONE,
  BIGDECIMAL_ZERO,
  BIGINT_SUPPLY
} from "./contants";
import { Bytes } from "@graphprotocol/graph-ts";

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
  }
  transfer.save();
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
    governance.totalSupply = BIGINT_SUPPLY;
  }

  return governance as Governance;
}