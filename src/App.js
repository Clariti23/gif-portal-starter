import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = 'GrantFerowich';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const DUMMY_GIFS = [
  'https://media.giphy.com/media/DvbEI4LAFaZaw/giphy.gif',
  'https://media.giphy.com/media/3oriOi8MuvRXzz3tHG/giphy.gif',
  'https://media.giphy.com/media/UFXi3FSeGtKq4/giphy.gif',
  'https://media.giphy.com/media/l2SpNtHdgOA9s1qNy/giphy.gif',
  'https://media.giphy.com/media/3qj3VtNL2nhmw/giphy.gif',
  'https://media.giphy.com/media/3o6vXOloJUr5dFQmQ0/giphy.gif',
  'https://media.giphy.com/media/l2RnnnALPxrKmQq1q/giphy.gif',
  'https://media.giphy.com/media/3oEhn51EPgFiSQw8GQ/giphy.gif'
]
const App = () => {
  // State
  const [ walletAddress, setWalletAddress ] = useState(null);
 

  
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      
      if (solana) { 
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({onlyIfTrusted: true})
          console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
          }

      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻 here https://phantom.app/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with public key:', response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  };

  const renderNotConnectedContainer = () => (
    <button
    className="cta-button connect-wallet-button"
    onClick={connectWallet}
    >
    Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className='connected-container'>
      <div className='gif-grid'>
        {DUMMY_GIFS.map( gif =>(
          <div className='gif-item' key={gif}>
            <img src={gif} alt={gif}/>
          </div>  
        ))}
      </div>
    </div>
  )

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  },[])
  
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container':"container"}>
        <div className="header-container">
          <p className="header">🖼 The Great GIF Portal</p>
          <p className="sub-text">
            by Grant J.F. Ferowich ✨
          </p>
          { !walletAddress && renderNotConnectedContainer()}
          { walletAddress && renderConnectedContainer()}
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
