import { useCalls } from "@usedapp/core";
import { Contract } from 'ethers';
import {POOLS_V1} from "../constants/poolsv1";
import CZFarmPool from "../abi/CZFarmPool.json";


function usePoolsV1Info(provider) {
  const calls = POOLS_V1.flatMap(pool=>{
    let poolSc = new Contract(pool.address,CZFarmPool,provider);
    return [
    {
      contract:poolSc,
      method:'timestampStart',
      args:[]
    },
    {
      contract:poolSc,
      method:'timestampEnd',
      args:[]
    },
    {
      contract:poolSc,
      method:'rewardPerSecond',
      args:[]
    }
  ]}) ?? [];
  const results = useCalls(calls) ?? [];
  results.forEach((result,idx)=>{
    if(result && result.error) {
      console.error(`ERROR calling 'balanceOf' on ${calls[idx]?.contract.address}`);
    }
  });
  return POOLS_V1.map((pool,index) => {
    const resultIndexTimestampStart = index * 3;
    const resultIndexTimestampEnd = resultIndexTimestampStart + 1;
    const resultIndexRewardPerSecond = resultIndexTimestampStart + 2;
    return {
      address:pool.address,
      timestampStart:results?.[resultIndexTimestampStart]?.value?.[0],
      timestampEnd:results?.[resultIndexTimestampEnd]?.value?.[0],
      rewardPerSecond:results?.[resultIndexRewardPerSecond]?.value?.[0],
    }
  });
}


export default usePoolsV1Info;