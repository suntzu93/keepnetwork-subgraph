import { BigDecimal, BigInt, Bytes, Address } from "@graphprotocol/graph-ts";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const KEEP_CONTRACT = "0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC";
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let BIGINT_SUPPLY = BigInt.fromI32(1000000000);