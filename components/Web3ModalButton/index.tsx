import React, { useEffect, useState } from 'react'
import type { ChainId } from '@usedapp/core'
import { useEthers, BSC  } from '@usedapp/core'
import styled from 'styled-components'
import { AccountModal } from '../AccountModal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { parseEther, formatEther } from '@ethersproject/units'
import MetamaskLogo from '../../public/static/assets/images/metamask.svg';
import WalletConnectLogo from '../../public/static/assets/images/walletconnect.svg';
import { getInjectedProvider } from '@usedapp/core/src/helpers/injectedProvider'
import { WalletConnectV2Connector } from '@usedapp/wallet-connect-v2-connector'

const INJECTED_STATE = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  NONE: 'NONE'
};

const Web3ModalButton = ({className}) => {
  const { account, activate, activateBrowserWallet, deactivate, chainId } = useEthers();

  const [injectedState,setInjectedState] = useState(INJECTED_STATE.PENDING);

  const [activateError, setActivateError] = useState('');
  const [isLoadingWalletConnect, setIsLoadingWalletConnect] = useState(false);
  const { error } = useEthers();

  useEffect(()=>{
    if(!!window?.ethereum?.networkVersion || !!window?.web3) {
      setInjectedState(INJECTED_STATE.ACTIVE);
    } else {
      setInjectedState(INJECTED_STATE.NONE);
    }
  },[])

  useEffect(() => {
    if (error) {
      console.log(error);
      setActivateError(error.message)
    }
  }, [error])

  const activateProvider = async (providerId: string) => {
    setIsLoadingWalletConnect(true);
    try {
      deactivate();
      if(providerId == 'injected') {
        await activateBrowserWallet();
      } else {
        await activate(new WalletConnectV2Connector({
          projectId: '733b62687a642698bb939c8b193a60a9',
          chains: [BSC],
          rpcMap:{
            56:'https://rpc.ankr.com/bsc'
          }
        }))
      }
      setActivateError('')
    } catch (error: any) {
      setActivateError(error.message)
    }
    setIsLoadingWalletConnect(false);
  }

  return (
    <>
    <div className={"field has-addons "+className} style={{width:"18em"}}>
    {!account ? (<>
    {(injectedState == INJECTED_STATE.ACTIVE) && (<>
      <p className="control is-inline-block">
        <button title="Connect your browser wallet" className="button is-dark is-rounded is-large" style={{width:"6em"}} onClick={()=>activateProvider("injected")} >
          <span className="icon is-small p-1" >
            <img src={MetamaskLogo} />
          </span>
        </button>
      </p>
      <p className="control is-inline-block">
        <button title="Connect with WalletConnect" className="button is-dark is-rounded is-large" style={{width:"6em"}} onClick={()=>activateProvider("walletconnect")}>
          <span className="icon is-small">
            <img src={WalletConnectLogo} />
          </span>
        </button>
      </p>    
    </>)}
    {(injectedState == INJECTED_STATE.NONE) && (<>
      <p className="control">
        <button title="Connect with WalletConnect" className="button is-dark is-rounded is-large" style={{width:"12em"}} onClick={()=>activateProvider("walletconnect")}>
          <span className="icon is-small">
            <img src={WalletConnectLogo} />
          </span>
        </button>
      </p>    
    </>)}
    {(injectedState == INJECTED_STATE.PENDING) && (<>
      <p className="control">
        <button title="Connect with WalletConnect" className="button is-dark is-rounded is-large" style={{width:"12em"}} onClick={()=>activateProvider("walletconnect")}>
            <span className='is-size-6'>STATUS: <span className='has-text-warning'>CONNECTING...</span></span>
        </button>
      </p>  
    </>)}
    </>) : (<>
    <p className="control">
      <button title="Disconnect your wallet" className="button is-dark is-rounded is-large" style={{width:"12em"}} onClick={() => {console.log("deactivate"); deactivate();}}>
        <span className='is-size-6'>STATUS: {!!chainId ? <span className='has-text-success'>CONNECTED</span> : <span className='has-text-danger'>WRONG NETWORK</span>}</span>
      </button>
    </p></>

    )}
  </div>
  {!!isLoadingWalletConnect && (
    <p className="has-text-white">loading wallet connection...</p>
  )

  }
  
  </>
  )
}

export default Web3ModalButton;