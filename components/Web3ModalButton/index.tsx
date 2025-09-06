import React, { useEffect, useState } from 'react'
import { useEthers, BSC  } from '@usedapp/core'
import MetamaskLogo from '../../public/static/assets/images/metamask.svg';
import WalletConnectLogo from '../../public/static/assets/images/walletconnect.svg';
import { WalletConnectV2Connector } from '@usedapp/wallet-connect-v2-connector'
import { BSC_RPC_URLS } from '../../constants/bscRpc'
import { providers } from 'ethers'

// Removed injected state gating; always allow connecting to any browser wallet

const Web3ModalButton = ({className}) => {
  const { account, activate, activateBrowserWallet, deactivate, chainId } = useEthers();

  // No injected state; we check for provider presence on connect

  const [activateError, setActivateError] = useState('');
  const [isLoadingWalletConnect, setIsLoadingWalletConnect] = useState(false);
  const { error } = useEthers();

  // Removed injected provider detection; avoid MetaMask install popups

  useEffect(() => {
    if (error) {
      console.log(error);
      setActivateError(error.message)
    }
  }, [error])

  const probeRpc = async (urls: string[]): Promise<string | null> => {
    for (const url of urls) {
      try {
        const provider = new providers.StaticJsonRpcProvider(url, 56);
        await provider.getBlockNumber();
        return url;
      } catch (e) {
        // try next
      }
    }
    return null;
  }

  const activateProvider = async (providerId: string) => {
    setIsLoadingWalletConnect(true);
    try {
      deactivate();
      if(providerId == 'injected') {
        if(!!(window as any)?.ethereum || !!(window as any)?.web3) {
          await activateBrowserWallet();
        } else {
          setActivateError('No browser wallet detected');
        }
      } else {
        const workingRpc = await probeRpc(BSC_RPC_URLS);
        await activate(new WalletConnectV2Connector({
          projectId: '733b62687a642698bb939c8b193a60a9',
          chains: [BSC],
          rpcMap:{
            56: workingRpc ?? 'https://bsc-dataseed.bnbchain.org'
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