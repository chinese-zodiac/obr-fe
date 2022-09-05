import { useEffect, useState } from "react";
import { utils, Contract, constants } from 'ethers';
import { useEthers, useCall } from '@usedapp/core'
import { Contract as ContractEthCall, Provider as ProviderEthCall} from "ethcall";
import { ADDRESS_BURN, ADDRESS_OBR} from '../constants/addresses';
import OneBadRabbitAbi from "../abi/OneBadRabbit.json";
const { formatEther, parseEther, Interface } = utils;


const OneBadRabbitInterface = new Interface(OneBadRabbitAbi);
const CONTRACT_OBR = new Contract(ADDRESS_OBR,OneBadRabbitInterface);

export default function useAccountObr() {
  const { account, library } = useEthers();
  
  const [accountNftIdArray, setAccountNftIdArray] = useState([]);

  const { value: [obrCount], error: obrCountError } = useCall({
     contract: CONTRACT_OBR,
     method: 'balanceOf',
     args: [account ?? ADDRESS_BURN]
   }) ?? {value:[]}

  useEffect(()=>{
    if(!account) return;
    if(!obrCount) return;
    if(obrCount.eq(0)) return;
    (async ()=>{
      const multicallProvider = new ProviderEthCall();
      await multicallProvider.init(library);
      const obrScMulticallable = new ContractEthCall(ADDRESS_OBR,OneBadRabbitAbi);
      try{
        console.log((new Array(obrCount.toNumber()).fill(0)))
        const multicallResults = await multicallProvider.all(
          (new Array(obrCount.toNumber()).fill(0)).map((item,index)=>obrScMulticallable.tokenOfOwnerByIndex(account,index))
        )
        console.log(multicallResults)
        setAccountNftIdArray(multicallResults.map(item=>item?.toNumber()));
      } catch(err) {
        console.log("Failed to multicall one bad rabbit ids for",account);
      }
    })();
  },[account,obrCount?.toString()]);

  return {accountNftIdArray,accountObrCount:Number(obrCount?.toString())}
}