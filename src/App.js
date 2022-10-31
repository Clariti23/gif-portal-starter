import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';




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
const { SystemProgram, Keypair } = web3;
let baseAccount = Keypair.generate();
const programId = new PublicKey("FACJtb84d9qiR8uLqsV51zoo3vYAYJzupanPC3pWDPkC");
const network = clusterApiUrl('devnet')
const opts = {
  preflightCommitment: "processed"
}

const App = () => {
  // State
  const [ walletAddress, setWalletAddress ] = useState(null);
  const [ inputValue, setInputValue ] = useState('');
  const [ gifList, setGifList ] = useState([]);
  
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

  const sendGif = async () => {
    if (inputValue.length === 0) {
        console.log('No gif link provided!')
        return
    }
    setInputValue('');
    console.log('Gif link: ', inputValue);
    try {
      const provider = getProvider()
      const program = await getProgram();
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey
        }
      });
      console.log("GIF successfully sent to program", inputValue)
      await getGifList();
    } catch (error) {
      console.log("Error sending gif: ", error)
    }


  }
  const onInputChange = (event) => {
    const { value } = event.target 
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment );
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      
      const provider = getProvider();
      const program = await getProgram();
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      console.log("Created a new BaseAccount w/ address: ", baseAccount.publicKey.toString() )
      await getGifList();

    } catch (error) {
      console.log("Error creating baseAccount: ", error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button
    className="cta-button connect-wallet-button"
    onClick={connectWallet}>
    Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {

    if (gifList == null ) {
      return (
        <div className="connected-container">
           <button
            className="cta-button connect-wallet-button"
            onClick={createGifAccount}>
           Initialize Gif Account!
          </button>
        </div>
      )


  } else {
    return (
    <div className='connected-container'>
    <form onSubmit={(event) => {
      event.preventDefault();
      sendGif();
    }}>
      <input type='text' placeholder='Enter gif link!' value={inputValue} onChange={onInputChange} /> 
      <button type='submit' className='cta-button submit-gif-button'>Submit</button>
    </form>
    <div className='gif-grid'>
      {gifList.map((item, index) =>(
        <div className='gif-item' key={index}>
          <img src={item.gifLink} alt={item.gifLink}/>
        </div>  
      ))}
    </div>
  </div>)
  }}


   


  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  },[])

  const getProgram = async () => {
    const idl = await Program.fetchIdl(programId, getProvider());
    return new Program(idl, programId, getProvider()) 
  }

  const getGifList = async() => {
    try {
      const program = await getProgram();
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log("Got the account", account)
      setGifList(account.gifList)

    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null)
    }
  }



  useEffect( () => {
    if (walletAddress) {
      console.log('Fetching the GIF list...');
      // call Solana program
      getGifList()
    }

  }, [walletAddress])
  
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
