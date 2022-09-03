import React, { Component, useEffect, useState, memo } from 'react';
import { ADDRESS_OBR} from '../../constants/addresses';
import {getIpfsUrl,getIpfsJson} from '../../utils/getIpfsJson';
import { useEthers, shortenAddress, useCall, useContractFunction, useTokenAllowance  } from '@usedapp/core'

const ObrCard = memo(({nftId})=>{

  const [style,setStyle] = useState();
  const [scene,setScene] = useState();
  const [imageUrl,setImageUrl] = useState();

  useEffect(()=>{
    (async ()=>{
      const metadata = await getIpfsJson(`ipfs://QmYeWi4DVNiGatPsVf4zNFebgM3NnhkMvAMzaiaXj85sCo/obr-dat/${nftId}.json`);
      console.log(metadata);
      setStyle(metadata?.attributes?.[0]?.value);
      setScene(metadata?.attributes?.[1]?.value);
      !!metadata?.image && setImageUrl(getIpfsUrl(metadata?.image));
    })();
  },[nftId])
  return(
    <div className="container m-2 has-text-primary" style={{display:"inline-block",border:"solid 2px"}}>
      <a href={imageUrl} target="_blank">
        <figure className="image is-256x256 mb-0" style={{width:"256px",display:"inline-block"}}>
            <img src={imageUrl} />
        </figure>
      </a>
      <p className='mt-0 mb-1 has-text-white' style={{maxWidth:"256px"}}>
        {nftId} <br/> {style} | {scene}
      </p>

    </div>
  )
});

export default ObrCard;