import React, { Component, useEffect, useState, memo, useRef, useMemo } from 'react';
import { utils, Contract, constants } from 'ethers';
import { ADDRESS_OBR } from '../../constants/addresses';
import OneBadRabbitAbi from "../../abi/OneBadRabbit.json";
import { getIpfsUrl, getIpfsJson } from '../../utils/getIpfsJson';
import useOutsideAlerter from '../../hooks/useOutsideAlerter';
import CZFarmPoolAbi from "../../abi/CZFarmPool.json";
import IERC20Abi from "../../abi/IERC20.json";
import { SLOTTABLE_POOLS } from "../../constants/slottableObrPools";
import { useEthers, shortenAddress, useCall, useContractFunction, useTokenAllowance } from '@usedapp/core';
import useCountdown from '../../hooks/useCountdown';
import { tokenAmtToShortString } from '../../utils/bnDisplay';
import useSlottableObrPools from '../../hooks/useSlottableObrPools';
const { formatEther, parseEther, Interface } = utils;


const ObrCard = memo(({ nftId, slottedTo }) => {

  const { account, library, chainId } = useEthers();

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => { setIsDropdownOpen(false) });

  const [style, setStyle] = useState();
  const [scene, setScene] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [hasImageError, setHasImageError] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const slottedPoolContract = useMemo(() => {
    if (!slottedTo) return null;
    try {
      return new Contract(slottedTo, CZFarmPoolAbi);
    } catch (e) {
      return null;
    }
  }, [slottedTo]);

  const poolInfo = useMemo(() => {
    if (!slottedTo) return null;
    try {
      return SLOTTABLE_POOLS.find(p => p.address?.toLowerCase() === slottedTo?.toLowerCase()) || null;
    } catch (e) {
      return null;
    }
  }, [slottedTo]);

  const poolDisplayName = useMemo(() => {
    if (!poolInfo) return null;
    return `${poolInfo.baseAssetName}-${poolInfo.rewardAssetName} ${poolInfo.feeBasis / 100}% (${poolInfo.index})`;
  }, [poolInfo]);

  const { value: slottedInfo } = useCall(
    slottedPoolContract && account
      ? {
        contract: slottedPoolContract,
        method: 'getSlottedNft',
        args: [account, ADDRESS_OBR]
      }
      : undefined
  ) ?? {};

  const { value: nftLockPeriodValue } = useCall(
    slottedPoolContract
      ? {
        contract: slottedPoolContract,
        method: 'nftLockPeriod',
        args: []
      }
      : undefined
  ) ?? {};

  const slottedTimestamp = slottedInfo?.[1];
  const nftLockPeriod = nftLockPeriodValue?.[0];
  const unlockEpoch = (!!slottedTimestamp && !!nftLockPeriod) ? slottedTimestamp.add(nftLockPeriod) : null;
  const unslotCountdown = useCountdown(unlockEpoch, 'UNSLOT');

  // Pools that already have an OBR slotted for this account
  const slottableObrPoolsAccountInfo = useSlottableObrPools(library, account);
  const slottedPoolAddrSet = useMemo(() => {
    const set = new Set();
    if (slottableObrPoolsAccountInfo) {
      slottableObrPoolsAccountInfo.forEach((info) => {
        if (info?.slottedObr && info.slottedObr.gt(0)) set.add(info.address.toLowerCase());
      });
    }
    return set;
  }, [slottableObrPoolsAccountInfo]);

  // Fetch wallet balances for pools that expose receipt tokens (direct calls to avoid multicall aggregate reverts)
  const [receiptBalances, setReceiptBalances] = useState({});
  useEffect(() => {
    let isStale = false;
    (async () => {
      try {
        if (!account || !library) {
          if (!isStale) setReceiptBalances({});
          return;
        }
        const entries = await Promise.all(
          SLOTTABLE_POOLS.map(async (pool) => {
            if (pool.hasReceipt === false) return [pool.address, undefined];
            try {
              const erc20 = new Contract(pool.address, IERC20Abi, library);
              const bal = await erc20.balanceOf(account);
              return [pool.address, bal];
            } catch (e) {
              return [pool.address, undefined];
            }
          })
        );
        if (!isStale) {
          const map = entries.reduce((acc, [addr, bal]) => { acc[addr] = bal; return acc; }, {});
          setReceiptBalances(map);
        }
      } catch (e) {
        if (!isStale) setReceiptBalances({});
      }
    })();
    return () => { isStale = true; };
  }, [account, library, chainId]);

  // Build enriched pool list with wallet balances and decimals, then sort by receipt support and balance desc
  const sortedPools = useMemo(() => {
    const enriched = SLOTTABLE_POOLS.map((pool) => {
      const amount = receiptBalances?.[pool.address];
      const supportsReceipt = pool.hasReceipt !== false && amount !== undefined;
      const decimals = 18; // pool receipt tokens use 18 decimals
      return { pool, amount, decimals, supportsReceipt };
    });
    return enriched.sort((a, b) => {
      if (a.supportsReceipt !== b.supportsReceipt) return a.supportsReceipt ? -1 : 1;
      const aAmt = a.amount ?? constants.Zero;
      const bAmt = b.amount ?? constants.Zero;
      if (bAmt.gt(aAmt)) return 1;
      if (bAmt.lt(aAmt)) return -1;
      return 0;
    });
  }, [receiptBalances]);

  useEffect(() => {
    (async () => {
      const metadata = await getIpfsJson(`ipfs://QmYeWi4DVNiGatPsVf4zNFebgM3NnhkMvAMzaiaXj85sCo/obr-dat/${nftId}.json`);
      setStyle(metadata?.attributes?.[0]?.value);
      setScene(metadata?.attributes?.[1]?.value);
      !!metadata?.image && setImageUrl(getIpfsUrl(metadata?.image));
    })();
  }, [nftId])
  
  useEffect(() => {
    // Reset error state when the image URL changes
    setHasImageError(false);
  }, [imageUrl]);
  return (
    <div className="container m-2 has-text-primary" style={{ display: "inline-block", border: "solid 2px", maxWidth: "260px", position: "relative" }}>
      {!!slottedTo ? (<>
        {unslotCountdown === 'UNSLOT' ? (
          <button className={`button is-dark is-small mt-0 m-2 ${isDropdownOpen ? "is-active" : ""}`} style={{ position: "absolute", zIndex: "1", top: "210px", right: "0px" }} onClick={async () => {
            const PoolSlottableInterface = new Interface(CZFarmPoolAbi);
            const PoolSlottable = new Contract(slottedTo, PoolSlottableInterface, library.getSigner());
            await PoolSlottable.unslotNft(ADDRESS_OBR);
          }}>Unslot</button>
        ) : (
          <div className={`button is-dark is-small mt-0 m-2 ${isDropdownOpen ? "is-active" : ""}`} style={{ position: "absolute", zIndex: "1", top: "210px", right: "0px", cursor: "default" }}>
            {unslotCountdown ?? '...'}
          </div>
        )}
      </>) : (<>
        <div ref={wrapperRef} className={`dropdown is-right mt-0 m-2 ${isDropdownOpen ? "is-active" : ""}`} style={{ position: "absolute", zIndex: "1", top: "210px", right: "0px" }}>
          <div className="dropdown-trigger">
            <button className="button is-dark is-small" aria-haspopup="true" aria-controls="dropdown-menu" onClick={() => { setIsDropdownOpen(!isDropdownOpen) }}>
              <span>Assign</span>
              <span className="icon is-small">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div className="dropdown-menu is-outlined is-dark" id="dropdown-menu" role="menu">
            <div className="dropdown-content is-dark has-background-primary-dark has-text-left">
              {sortedPools.map(({ pool, amount, decimals, supportsReceipt }, index) => {
                const alreadySlottedInPool = slottedPoolAddrSet.has(pool.address.toLowerCase());
                return (
                  <button key={pool.address} className="dropdown-item has-text-white" disabled={alreadySlottedInPool} style={{ background: "transparent", border: "none", cursor: alreadySlottedInPool ? "not-allowed" : "pointer", opacity: alreadySlottedInPool ? 0.5 : 1 }} onClick={async () => {
                    if (alreadySlottedInPool) return;
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
                    {pool.baseAssetName}-{pool.rewardAssetName} {pool.feeBasis / 100}% ({pool.index}){" "}
                    {supportsReceipt ? (() => {
                      try {
                        const display = tokenAmtToShortString(amount, decimals, 1);
                        return ` — Deposited: ${display}`;
                      } catch (e) {
                        return '';
                      }
                    })() : ''}
                  </button>)
              })

              }

            </div>
          </div>
        </div>
      </>)
      }
      <div style={{ width: "256px", height: "256px", display: "inline-block" }}>
        {(!hasImageError && !!imageUrl) ? (
          <a href={imageUrl} target="_blank" rel="noreferrer">
            <img
              src={imageUrl}
              alt={`OBR ${nftId}`}
              onError={() => setHasImageError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </a>
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Image unavailable
          </div>
        )}
      </div>
      <p className='mt-0 mb-1 has-text-white' style={{ maxWidth: "256px" }}>
        {nftId} <br /> {style} | {scene}
        {!!slottedTo && !!poolDisplayName ? (<><br />Assigned to {poolDisplayName}</>) : null}
      </p>
    </div>
  )
});

export default ObrCard;