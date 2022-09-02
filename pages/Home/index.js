
import React, { Component, useState, useEffect } from 'react';
import Web3ModalButton from '../../components/Web3ModalButton';
import Footer from '../../components/Footer';
import "./index.module.scss";
import { useEthers, useToken, useContractFunction, useCall, useTokenBalance, useTokenAllowance, useEtherBalance  } from '@usedapp/core'
import { utils, Contract, constants } from 'ethers';
import useCountdown from "../../hooks/useCountdown";
import useCurrentEpoch from "../../hooks/useCurrentEpoch";
import Logo from '../../public/static/assets/logo.png';
import CZCashLogo from '../../public/static/assets/images/czcash.png';
import { shortenAddress, useLookupAddress} from '@usedapp/core'
import IERC20Abi from "../../abi/IERC20.json";
import OneBadRabbitAbi from "../../abi/OneBadRabbit.json";
import OneBadRabbitRecruiterAbi from "../../abi/OneBadRabbitRecruiter.json";
import { SOCIAL_TWITTER, SOCIAL_TELEGRAM, SOCIAL_GITHUB} from '../../constants/social';
import {deltaCountdown} from '../../utils/timeDisplay';
import {weiToShortString, tokenAmtToShortString, weiToFixed, weiToUsdWeiVal, toShortString} from '../../utils/bnDisplay';
import { ADDRESS_ZERO, ADDRESS_OBR, ADDRESS_OBR_RECRUITER, ADDRESS_LRT} from '../../constants/addresses';
import { czCashBuyLink } from '../../utils/dexBuyLink';
const { formatEther, parseEther, Interface } = utils;

const OneBadRabbitInterface = new Interface(OneBadRabbitAbi);
//const CONTRACT_OBR = new Contract(ADDRESS_OBR,OneBadRabbitInterface);

const OneBadRabbitRecruiterInterface = new Interface(OneBadRabbitRecruiterAbi);
//const CONTRACT_OBR_RECRUITER = new Contract(ADDRESS_OBR,OneBadRabbitRecruiterInterface);

const Ierc20Interface = new Interface(IERC20Abi);
const CONTRACT_LRT = new Contract(ADDRESS_LRT,Ierc20Interface);


const displayWad = (wad)=>!!wad ? Number(formatEther(wad)).toFixed(2) : "...";


function Home() {
  
  const { account, library, chainId } = useEthers();
  
  const accLrtBal = useTokenBalance(ADDRESS_LRT, account);

  const currentEpoch = useCurrentEpoch();

  return (<>
  <div id="top" className="has-background-gradient is-dark has-text-centered" style={{width:"100%",minHeight:"100vh"}}>
      <div className='pb-3 pt-3'>
        <img src={Logo} className="" style={{maxWidth:"15em"}} />
        <h1 className='is-size-3 has-text-white'>ONE BAD RABBIT</h1>
      </div>
        

        <Web3ModalButton className="auto-centered mb-0" /><br/>

        
      <div>
        <button className="button is-dark is-large is-rounded mt-3" style={{width:"12em"}}><img src={Logo} style={{height:"1em",marginRight:"0.3em"}} alt="OBR" />RECRUIT 1</button>
        <p className="has-text-white">
          Fee: 25 LRT<br/>
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
            Can Recruit? 
          </div>
          <div className='column has-text-left'>
            {!!account ? shortenAddress(account) : "..."}<br/>
            {!!account ? (chainId == 56 ? (<span className="has-text-success">✓ BSC</span>) : <span className="has-text-error has-text-danger">❌NOT BSC</span>) : "..."}<br/>
            {!!accLrtBal ? weiToShortString(accLrtBal,2) : "..."}<br/>
            ...<br/>
            NO <br/>
            NO 
          </div>
        </div>
    </div>
  </div>
    
    
    <Footer />
    
  </>);
}

export default Home
