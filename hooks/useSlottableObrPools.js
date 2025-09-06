import { useCalls } from "@usedapp/core";
import { useMemo } from 'react';
import { Contract } from 'ethers';
import { SLOTTABLE_POOLS } from "../constants/slottableObrPools";
import CZFarmPool from "../abi/CZFarmPool.json";
import { ADDRESS_OBR } from "../constants/addresses";


function useSlottableObrPools(provider, account) {
  const calls = useMemo(() => {
    // If provider isn't ready yet, skip making calls this render
    if (!provider || !account) return [];
    return SLOTTABLE_POOLS.map(pool => {
      const poolSc = new Contract(pool.address, CZFarmPool);
      return {
        contract: poolSc,
        method: 'getSlottedNft',
        args: [account, ADDRESS_OBR]
      };
    });
  }, [provider, account]) ?? [];
  const results = useCalls(calls) ?? [];
  results.forEach((result, idx) => {
    if (result && result.error) {
      console.error(`ERROR calling 'getSlottedNft' on ${calls[idx]?.contract.address}`);
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