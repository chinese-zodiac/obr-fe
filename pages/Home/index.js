
import React, { Component, useState, useEffect } from 'react';
import Web3ModalButton from '../../components/Web3ModalButton';
import Footer from '../../components/Footer';
import "./index.module.scss";
import { useEthers, useToken, useContractFunction, useCall, useTokenBalance, useTokenAllowance, useEtherBalance  } from '@usedapp/core'
import { utils, Contract, constants } from 'ethers';
import useCountdown from "../../hooks/useCountdown";
import useCurrentEpoch from "../../hooks/useCurrentEpoch";
import Logo from '../../public/static/assets/logo.png';
import ObrCallVid from '../../public/static/assets/vids/obr-call.mp4';
import CZCashLogo from '../../public/static/assets/images/czcash.png';
import { shortenAddress, useLookupAddress} from '@usedapp/core'
import IERC20Abi from "../../abi/IERC20.json";
import OneBadRabbitAbi from "../../abi/OneBadRabbit.json";
import OneBadRabbitRecruiterAbi from "../../abi/OneBadRabbitRecruiter.json";
import { SOCIAL_TWITTER, SOCIAL_TELEGRAM, SOCIAL_GITHUB} from '../../constants/social';
import {deltaCountdown} from '../../utils/timeDisplay';
import {weiToShortString, tokenAmtToShortString, weiToFixed, weiToUsdWeiVal, toShortString} from '../../utils/bnDisplay';
import { ADDRESS_BURN, ADDRESS_OBR, ADDRESS_OBR_RECRUITER, ADDRESS_LRT} from '../../constants/addresses';
import { czCashBuyLink } from '../../utils/dexBuyLink';
const { formatEther, parseEther, Interface } = utils;

const OneBadRabbitInterface = new Interface(OneBadRabbitAbi);
const CONTRACT_OBR = new Contract(ADDRESS_OBR,OneBadRabbitInterface);

const OneBadRabbitRecruiterInterface = new Interface(OneBadRabbitRecruiterAbi);
const CONTRACT_OBR_RECRUITER = new Contract(ADDRESS_OBR_RECRUITER,OneBadRabbitRecruiterInterface);

const Ierc20Interface = new Interface(IERC20Abi);
const CONTRACT_LRT = new Contract(ADDRESS_LRT,Ierc20Interface);


const displayWad = (wad)=>!!wad ? Number(formatEther(wad)).toFixed(2) : "...";


function Home() {
  
  const { account, library, chainId } = useEthers();
  
  const { state: stateLrtApprove, send: sendLrtApprove } = useContractFunction(CONTRACT_LRT, 'approve');
  const { state: stateRecruitBadRabbit, send: sendRecruitBadRabbit } = useContractFunction(CONTRACT_OBR_RECRUITER, 'recruitBadRabbit');
  
  const accLrtBal = useTokenBalance(ADDRESS_LRT, account);
  const accLrtAllow = useTokenAllowance(ADDRESS_LRT, account, ADDRESS_OBR_RECRUITER);

  const { value: [globalRecruitmentCap], error: globalRecruitmentCapError } = useCall({
     contract: CONTRACT_OBR_RECRUITER,
     method: 'globalRecruitmentCap',
     args: []
   }) ?? {value:[]}
  const { value: [totalRecruited], error: totalRecruitedError } = useCall({
     contract: CONTRACT_OBR_RECRUITER,
     method: 'totalRecruited',
     args: []
   }) ?? {value:[]}
  const { value: [whitelistStartEpoch], error: whitelistStartEpochError } = useCall({
     contract: CONTRACT_OBR_RECRUITER,
     method: 'whitelistStartEpoch',
     args: []
   }) ?? {value:[]}
  const { value: [publicStartEpoch], error: publicStartEpochError } = useCall({
     contract: CONTRACT_OBR_RECRUITER,
     method: 'publicStartEpoch',
     args: []
   }) ?? {value:[]}
  const { value: [whitelist], error: whitelistError } = useCall({
     contract: CONTRACT_OBR_RECRUITER,
     method: 'whitelist',
     args: [account ?? ADDRESS_BURN]
   }) ?? {value:[]}
  const { value: [accountRecruited], error: accountRecruitedError } = useCall({
     contract: CONTRACT_OBR_RECRUITER,
     method: 'accountRecruited',
     args: [account ?? ADDRESS_BURN]
   }) ?? {value:[]}
  const { value: [obrCount], error: obrCountError } = useCall({
     contract: CONTRACT_OBR,
     method: 'balanceOf',
     args: [account ?? ADDRESS_BURN]
   }) ?? {value:[]}

  const whitelistCountdown = useCountdown(whitelistStartEpoch,"OPEN");
  const publicCountdown = useCountdown(publicStartEpoch,"OPEN");

  return (<>
  <div id="top" className="has-background-gradient is-dark has-text-centered" style={{width:"100%",minHeight:"100vh"}}>
      <div className='pb-3 pt-3'>
        <img src={Logo} className="" style={{maxWidth:"15em"}} />
        <p className='is-size-1 has-text-white m-0'>{totalRecruited?.toString() ?? 0} / {globalRecruitmentCap?.toString() ?? 0}</p>
        <h1 className='m-0 is-size-5 has-text-white'>ONE BAD RABBIT</h1>
        <div className='columns is-mobile mb-0 has-text-white auto-centered ' style={{maxWidth:"360px"}}>
          <div className='column has-text-right is-two-fifths'>
            Whitelist:<br/>
            Public:
          </div>
          <div className='column has-text-left'>
            {whitelistCountdown}<br/>
            {publicCountdown}
          </div>
        </div>
      </div>

      <Web3ModalButton className="auto-centered mb-0" /><br/>
        
      <div>
        {accLrtAllow?.gt(parseEther("25")) ? (
          <button className="button is-dark is-large is-rounded mt-3" style={{width:"12em"}} onClick={()=>{
            sendRecruitBadRabbit();
          }}><img src={Logo} style={{height:"1em",marginRight:"0.3em"}} alt="OBR" />RECRUIT 1</button>
        ) : (
          <button className="button is-dark is-large is-rounded mt-3" style={{width:"12em"}} onClick={()=>{
            sendLrtApprove(ADDRESS_OBR_RECRUITER,constants.MaxUint256);
          }}>APPROVE LRT</button>
        )}
        
        <p className="has-text-white">
           <span className='ml-2 mr-2'></span> Fee: 25 LRT<br/>
          <a className='button is-rounded is-dark is-small' href={czCashBuyLink(ADDRESS_LRT)} >Get LRT on <img src={CZCashLogo} style={{height:"1em",marginLeft:"0.4em"}} alt="CZ.Cash" /></a>
        </p>
      </div>
      <div className='has-text-white mt-0'>
      <h2 className='is-size-4 mt-5'>Your Wallet</h2>
        <div className='has-background-white auto-centered mb-2' style={{height:"2px",width:"360px", maxWidth:"75%"}}></div>
        <div className='columns is-mobile mb-0'>
          <div className='column has-text-right'>
            Wallet: <br/>
            Network: <br/>
            LRT Balance: <br/>
            OBR Count: <br/>
            Whitelist? <br/>
            {/*Can Recruit?*/}
          </div>
          <div className='column has-text-left'>
            {!!account ? shortenAddress(account) : "..."}<br/>
            {!!account ? (chainId == 56 ? (<span className="has-text-success">✓ BSC</span>) : <span className="has-text-error has-text-danger">❌NOT BSC</span>) : "..."}<br/>
            {!!accLrtBal ? weiToShortString(accLrtBal,2) : "..."}<br/>
            {obrCount?.toString() ?? 0}<br/>
            {!!whitelist ? "YES" : "NO"} <br/>
            {/*whitelistCountdown!="OPEN" ? (
              <>Whitelist not open</>
            ) : (<>{
              publicCountdown=="OPEN" && totalRecruited?.lt(globalRecruitmentCap) ? (<>YES</>) : (<>
                {!whitelist ? (<>Not whitelisted</>) : (<>
                  {accountRecruited.lt(2) ? (<>YES</>) : (<>Already recruited whitelist max</>)}
                </>)}
              </>)
            }</>)

          */} 
          </div>
        </div>
    </div>
      <video preload="none" autoPlay loop muted className='mt-5 mb-0' style={{position:"relative",top:"1em",width:"100%"}}>
        <source src={ObrCallVid} type="video/mp4" />
      </video>
  </div>
    
    
    <Footer />
    
  </>);
}

export default Home
