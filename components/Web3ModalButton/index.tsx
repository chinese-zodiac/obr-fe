import React, { useEffect, useState } from 'react'
import type { ChainId } from '@usedapp/core'
import { useEthers, shortenAddress, useLookupAddress, useEtherBalance, useTokenBalance  } from '@usedapp/core'
import styled from 'styled-components'
import Web3Modal from 'web3modal'
import { AccountModal } from '../AccountModal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { parseEther, formatEther } from '@ethersproject/units'
import MetamaskLogo from '../../public/static/assets/images/metamask.svg';
import WalletConnectLogo from '../../public/static/assets/images/walletconnect.svg';

const INJECTED_STATE = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  NONE: 'NONE'
};

const Web3ModalButton = ({className}) => {
  const { account, activate, deactivate, chainId } = useEthers();

  const [injectedState,setInjectedState] = useState(INJECTED_STATE.PENDING);

  const [activateError, setActivateError] = useState('');
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
    const providerOptions = {
      injected: {
        display: {
          name: 'Metamask',
          description: 'Connect with the provider in your Browser',
        },
        package: null,
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          bridge: 'https://bridge.walletconnect.org',
          rpc: {
            56: "https://rpc.ankr.com/bsc"
          }
        },
      },
    }

    const web3Modal = new Web3Modal({
      network:"",
      cacheProvider: false,
      providerOptions,
    });
    try {
      web3Modal.clearCachedProvider();
      const provider = await web3Modal.connectTo(providerId);
      await activate(provider)
      setActivateError('')
    } catch (error: any) {
      setActivateError(error.message)
    }
  }

  return (
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
  )
}

export default Web3ModalButton;