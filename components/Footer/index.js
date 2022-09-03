import React from 'react';
import { SOCIAL_TWITTER, SOCIAL_TELEGRAM, SOCIAL_GITHUB} from '../../constants/social';
import CZPower from '../../public/static/assets/images/czpower.png';

function Footer() {
    return(<footer id="footer" className="footer pb-7 mt-5 has-text-white" style={{position:"relative"}}>
    <div className="content has-text-centered">
      <div>
        <a className="m-2" href={SOCIAL_TELEGRAM} target="_blank">
          <span className="icon"><i className="fa-brands fa-telegram"></i></span>
        </a>
        <a className="m-2" href={SOCIAL_TWITTER} target="_blank">
          <span className="icon"><i className="fa-brands fa-twitter"></i></span>
        </a>
        <a className="m-2" href={SOCIAL_GITHUB} target="_blank">
          <span className="icon"><i className="fa-brands fa-github"></i></span>
        </a>
      </div>  
      <p className='pb-6'>
        v0.1.2
      </p>
      <p>
        AS WITH ANY BLOCKCHAIN PROJECT: <b>Do your own research before using this website or buying One Bad Rabbit (OBR) NFTs.</b><br/>
        Nothing on this site or on related channels should be considered a promise by anyone, including but not limited to the developers and promoters of this site, to perform work to generate profits for anyone including but not limited to the following: the users of this site; One Bad Rabbit community members; CZodiac community members; OBR holders; or anyone using any of the sites, smart contracts, social media channels, and any other media or tech related to OBR, One Bad Rabbit, and CZodiac or any of the community members. 
        One Bad Rabbit, OBR, CZodiac, and related technologies plus media are all experimental and must be used according to your personal financial situation and risk profile. 
        <br/><br/>There are no guarantees of profits, but the smart contracts are guaranteed to deliver remove pool taxes for cz.farm pools that have NFT slotting available when so written on BNB Chain (BSC).
      </p>
      <a href="https://czodiac.com"><img src={CZPower} alt="Powered by CZodiac" style={{width:"360px",maxWidth:"75%"}} /></a> 
    </div>
  </footer>);
}

export default Footer;