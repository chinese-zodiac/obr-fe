import { useCalls } from "@usedapp/core";
import { Contract } from 'ethers';
import { SLOTTABLE_POOLS } from "../constants/slottableObrPools";
import CZFarmPool from "../abi/CZFarmPool.json";
import { ADDRESS_OBR } from "../constants/addresses";


function useSlottableObrPools(provider, account) {
  const calls = SLOTTABLE_POOLS.flatMap(pool => {
    let poolSc = new Contract(pool.address, CZFarmPool, provider);
    return [
      {
        contract: poolSc,
        method: 'getSlottedNft',
        args: [account, ADDRESS_OBR]
      }
    ]
  }) ?? [];
  const results = useCalls(calls) ?? [];
  results.forEach((result, idx) => {
    if (result && result.error) {
      console.error(`ERROR calling 'balanceOf' on ${calls[idx]?.contract.address}`);
    }
  });
  return SLOTTABLE_POOLS.map((pool, index) => {
    return {
      address: pool.address,
      slottedObr: results?.[index]?.value?.[0]
    }
  });
}


export default useSlottableObrPools;