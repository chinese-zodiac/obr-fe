import React, { Component, useEffect, useState, memo, useRef } from 'react';
import { utils, Contract, constants } from 'ethers';
import { ADDRESS_OBR } from '../../constants/addresses';
import OneBadRabbitAbi from "../../abi/OneBadRabbit.json";
import { getIpfsUrl, getIpfsJson } from '../../utils/getIpfsJson';
import useOutsideAlerter from '../../hooks/useOutsideAlerter';
import CZFarmPoolAbi from "../../abi/CZFarmPool.json";
import { SLOTTABLE_POOLS } from "../../constants/slottableObrPools";
import { useEthers, shortenAddress, useCall, useContractFunction, useTokenAllowance } from '@usedapp/core';
const { formatEther, parseEther, Interface } = utils;


const ObrCard = memo(({ nftId, slottedTo }) => {

  const { account, library, chainId } = useEthers();

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => { setIsDropdownOpen(false) });

  const [style, setStyle] = useState();
  const [scene, setScene] = useState();
  const [imageUrl, setImageUrl] = useState();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const metadata = await getIpfsJson(`ipfs://QmYeWi4DVNiGatPsVf4zNFebgM3NnhkMvAMzaiaXj85sCo/obr-dat/${nftId}.json`);
      setStyle(metadata?.attributes?.[0]?.value);
      setScene(metadata?.attributes?.[1]?.value);
      !!metadata?.image && setImageUrl(getIpfsUrl(metadata?.image));
    })();
  }, [nftId])
  return (
    <div className="container m-2 has-text-primary" style={{ display: "inline-block", border: "solid 2px", maxWidth: "260px", position: "relative" }}>
      {!!slottedTo ? (<>
        <button class={`button is-dark is-small mt-0 m-2 ${isDropdownOpen && "is-active"}`} style={{ position: "absolute", zIndex: "1", top: "210px", right: "0px" }} onClick={async () => {
          console.log(slottedTo)
          const PoolSlottableInterface = new Interface(CZFarmPoolAbi);
          const PoolSlottable = new Contract(slottedTo, PoolSlottableInterface, library.getSigner());
          await PoolSlottable.unslotNft(ADDRESS_OBR);
        }}>Unslot</button>
      </>) : (<>
        <div ref={wrapperRef} class={`dropdown is-right mt-0 m-2 ${isDropdownOpen && "is-active"}`} style={{ position: "absolute", zIndex: "1", top: "210px", right: "0px" }}>
          <div class="dropdown-trigger">
            <button class="button is-dark is-small" aria-haspopup="true" aria-controls="dropdown-menu" onClick={() => { setIsDropdownOpen(!isDropdownOpen) }}>
              <span>Assign</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu is-outlined is-dark" id="dropdown-menu" role="menu">
            <div class="dropdown-content is-dark has-background-primary-dark has-text-left">
              {SLOTTABLE_POOLS.map((pool, index) => {
                return (
                  <button key={pool.address} class="dropdown-item has-text-white" style={{ background: "transparent", border: "none", cursor: "pointer" }} onClick={async () => {
                    console.log("Clicked")
                    const OneBadRabbitInterface = new Interface(OneBadRabbitAbi);
                    const CONTRACT_OBR = new Contract(ADDRESS_OBR, OneBadRabbitInterface, library.getSigner());
                    const isApprove = await CONTRACT_OBR.isApprovedForAll(account, pool.address);
                    if (!isApprove) {
                      await CONTRACT_OBR.setApprovalForAll(pool.address, true);
                    }
                    const PoolSlottableInterface = new Interface(CZFarmPoolAbi);
                    const PoolSlottable = new Contract(pool.address, PoolSlottableInterface, library.getSigner());
                    await PoolSlottable.slotNft(ADDRESS_OBR, nftId);
                  }}>
                    {pool.baseAssetName}-{pool.rewardAssetName} {pool.feeBasis / 100}% ({pool.index})
                  </button>)
              })

              }

            </div>
          </div>
        </div>
      </>)
      }
      <a href={imageUrl} target="_blank">
        <figure className="image is-256x256 mb-0" style={{ width: "256px", display: "inline-block" }}>
          <img src={imageUrl} />
        </figure>
      </a>
      <p className='mt-0 mb-1 has-text-white' style={{ maxWidth: "256px" }}>
        {nftId} <br /> {style} | {scene}
      </p>
    </div>
  )
});

export default ObrCard;