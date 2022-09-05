import React, { Component, useEffect, useState, memo, useRef} from 'react';
import { ADDRESS_OBR} from '../../constants/addresses';
import {getIpfsUrl,getIpfsJson} from '../../utils/getIpfsJson';
import useOutsideAlerter from '../../hooks/useOutsideAlerter';
import { useEthers, shortenAddress, useCall, useContractFunction, useTokenAllowance  } from '@usedapp/core'

const ObrCard = memo(({nftId})=>{

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef,()=>{setIsDropdownOpen(false)});

  const [style,setStyle] = useState();
  const [scene,setScene] = useState();
  const [imageUrl,setImageUrl] = useState();

  const [isDropdownOpen,setIsDropdownOpen] = useState(false);

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
    <div  className="container m-2 has-text-primary" style={{display:"inline-block",border:"solid 2px",maxWidth:"260px",position:"relative"}}>
      <div class={`dropdown is-right mt-0 m-2 ${isDropdownOpen&&"is-active"}`} style={{position:"absolute",zIndex:"1",top:"210px",right:"0px"}}>
        <div class="dropdown-trigger">
          <button ref={wrapperRef} class="button is-dark is-small" aria-haspopup="true" aria-controls="dropdown-menu" onClick={()=>{setIsDropdownOpen(!isDropdownOpen)}}>
            <span>Assign</span>
            <span class="icon is-small">
              <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
          <div class="dropdown-content is-dark has-background-primary-dark has-text-left">

            <a href="#" class="dropdown-item has-text-white">
              Coming Soon!
            </a>
          </div>
        </div>
      </div>
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