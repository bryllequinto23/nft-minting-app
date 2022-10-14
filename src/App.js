import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import AstroCharlie from './images/AstroCharlie.png'

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton3 = styled.button`
  all: unset;
  padding: 15px 30px;
  border-radius: 10px;
  border: none;
  background-color: var(--secondary);
  font-weight: bold;
  color: var(--accent-text);
  width: 245px;
  font-size: 30px;
  cursor: pointer;
  text-align: center;

  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }

  :disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  @media (max-width: 767px) {
    font-size: 35px;
  }
`;

export const StyledRoundButton2 = styled.button`
  border-radius: 100%;
  border: 1px solid;
  background-color: transparent;
  font-weight: bold;
  font-size: 25px;
  color: var(--secondary-text);
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const captchaRef = useRef(null);
  const inputRef = useRef(null);
  const mintRef = useRef(null);
  const wl = [];
  const og = [];
  const wa = [];
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [isErrorMsg, setErrorMsg] = useState(0);
  const [isConnected, setConnected] = useState(false);
  const [isEligible, setEligibile] = useState(false);
  const [walletDisplay, setWalletDisplay] = useState('');
  const [initErrMsg, setInitMessage] = useState('');
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    MAX_MINT_WL: 0,
    MAX_MINT_OG: 0,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false
  });

  const submitForm = () => {
    if (inputRef.current.value === '') {
      dispatch(connect());
      getData();
    } else {
      alert('An error has occurred. Please refresh the browser and try again.')
    }
  }

  const onChange = async(value) => {
    const token = value;

    if (token !== '' && mintRef.current.value === '') {
      await axios.post('./api/validateCaptcha.php', {token})
        .then(res => {
          if (res.data) {
            setCaptchaSuccess(true);
          }
        }).catch((error) => {
          alert(error)
        })
    } else {
      alert('An error has occurred. Please try again!');
      resetCaptcha();
    }
  }

  const mintSubmit = () => {
    if (mintRef.current.value === '') {
      claimNFTs();
      getData();
    } else {
      alert('An error has occurred. Please try again!');
      resetCaptcha();
    }
  }

  const claimNFTs = () => {
    // const l = blockchain.og.map(x => keccak256(x));
    // const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    // const buf2hex = x => '0x' + x.toString('hex')

    // console.log('OG')
    // console.log(buf2hex(tree.getRoot()))

    // const l2 = blockchain.wl.map(x => keccak256(x));
    // const tree2 = new MerkleTree(l2, keccak256, { sortPairs: true });
    // const buf2hex2 = x => '0x' + x.toString('hex')

    // console.log('WL')
    // console.log(buf2hex2(tree2.getRoot()))

    // const l4 = blockchain.wa.map(x => keccak256(x));
    // const tree4 = new MerkleTree(l4, keccak256, { sortPairs: true });
    // const buf2hex4 = x => '0x' + x.toString('hex')

    // console.log('WA')
    // console.log(buf2hex4(tree4.getRoot()))
    setErrorMsg(0);
    checkStatus();
  };

  const checkStatus = () => {
    blockchain.smartContract.methods
    .currState()
    .call()
    .then((state) => {
      if (+(state) === 0) {
        alert("Minting is paused");
        resetCaptcha();
      } else if (+(state) === 1 || +(state) === 2 || +(state) === 3) {
        verifyWLSale();
      } else if (+(state) === 4) {
        verifyPSale();
      }
    });
  }

  const verifyWLSale = () => {
    const totSupply = +(data.totalSupply);
    const ogTotal = +(data.ogTotal);
    const wlTotal = +(data.wlTotal);
    const waTotal = +(data.waTotal);
    const maxOG = CONFIG.MAX_MINT_OG;
    const maxWl = CONFIG.MAX_MINT_WL;
    const maxSupply = CONFIG.MAX_SUPPLY;

    const newSupply = totSupply + mintAmount;
    const newOGTotal = ogTotal + mintAmount;
    const newWlTotal = wlTotal + mintAmount;
    const newWaTotal = waTotal + mintAmount;

    if (newSupply > maxSupply) {
      alert("Beyond max supply.")
      resetCaptcha();
    } else if ((blockchain.saleState === 1 && (newOGTotal > maxOG)) || ((blockchain.saleState === 2) && (newWlTotal > maxWl))
      || (blockchain.saleState === 3 && (newWaTotal > maxWl)))  {
      alert("You have reached the maximum amount of mints.")
      resetCaptcha();
    } else {
      checkEligibility();
      
      if (!isEligible) {
        if (blockchain.saleState === 1) {
          alert("You are not a Charlie's Angel.")
        } else if (blockchain.saleState === 2) {
          alert("You are not Charlisted/Allowlisted.")
        } else if (blockchain.saleState === 3) {
          alert("You are not waitlisted.")
        }
        resetCaptcha();
      } else {
        setFeedback(`Minting your Charlie...`);
        setClaimingNft(true);

        if (blockchain.saleState === 1) {
          console.log('OG MINT')
          ogMint();
        } else if (blockchain.saleState === 2) {
          console.log('WL MINT')
          whitelistMint();
        } else if (blockchain.saleState === 3) {
          console.log('WA MINT')
          waitlistMint();
        }
      }
    }
  }

  const verifyPSale = () => {
    const totSupply = +(data.totalSupply);
    const pubTotal = +(data.pubTotal);
    const maxSupply = CONFIG.MAX_SUPPLY;

    const newSupply = totSupply + mintAmount;
    const newPubTotal = pubTotal + mintAmount;

    if (newSupply > maxSupply) {
      alert("Beyond max supply.")
      resetCaptcha();
    } else {
      setFeedback(`Minting your Charlie...`);
      setClaimingNft(true);
      publicMint();
    }
  }

  const ogMint = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    const l = og[0].map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    const leaf = keccak256(blockchain.account);
    const proof = tree.getProof(leaf).map(x => buf2hex(x.data));

    blockchain.smartContract.methods
      .ogMint(proof, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setErrorMsg(1);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      })
      .then((receipt) => {
        console.log(receipt);
        setErrorMsg(0);
        setFeedback(
          `Your Charlie has been minted. Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      });
  }

  const whitelistMint = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    const l = wl[0].map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    const leaf = keccak256(blockchain.account);
    const proof = tree.getProof(leaf).map(x => buf2hex(x.data));

    blockchain.smartContract.methods
      .whitelistMint(proof, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setErrorMsg(1);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      })
      .then((receipt) => {
        console.log(receipt);
        setErrorMsg(0);
        setFeedback(
          `Your Charlie has been minted. Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      });
  };

  const waitlistMint = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    const l = wa[0].map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    const leaf = keccak256(blockchain.account);
    const proof = tree.getProof(leaf).map(x => buf2hex(x.data));

    blockchain.smartContract.methods
      .waitlistMint(proof, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setErrorMsg(1);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      })
      .then((receipt) => {
        console.log(receipt);
        setErrorMsg(0);
        setFeedback(
          `Your Charlie has been minted. Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      });
  };

  const publicMint = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    blockchain.smartContract.methods
      .publicMint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setErrorMsg(1);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      })
      .then((receipt) => {
        console.log(receipt);
        setErrorMsg(0);
        setFeedback(
          `Your Charlie has been minted. Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        resetCaptcha();
        setTimeout(() => setFeedback(``), 4000);
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let totSupply = +(data.totalSupply);
    let tempTotal = mintAmount + totSupply;
    let newMintAmount;

    if (tempTotal === CONFIG.MAX_SUPPLY) {
      newMintAmount = mintAmount;
    } else if (blockchain.saleState === 1 && (mintAmount === CONFIG.MAX_MINT_OG)) {
      newMintAmount = mintAmount;
    } else if (blockchain.saleState === 2 && (mintAmount === CONFIG.MAX_MINT_WL)) {
      newMintAmount = mintAmount;
    } else if (blockchain.saleState === 3 && (mintAmount === CONFIG.MAX_MINT_WL)) {
      newMintAmount = mintAmount;
    } else {
      newMintAmount = mintAmount + 1;
    }
    
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      setConnected(true);
      wl.push(blockchain.wl)
      og.push(blockchain.og)
      wa.push(blockchain.wa)
      dispatch(fetchData(blockchain.account));

      if (blockchain.saleState === 1 || blockchain.saleState === 2 || blockchain.saleState === 3) {
        checkEligibility();
      }

      let tempAcc = blockchain.account;
      
      tempAcc = tempAcc.substr(0,6) + '...' + tempAcc.substr(tempAcc.length - 4, tempAcc.length);
      setWalletDisplay(tempAcc);
    } else {
      setConnected(false);
    }
  };

  const checkEligibility = () => {
    const isWl = wl[0].map(elem => elem.toLowerCase()).includes(blockchain.account.toLowerCase());
    const isOG = og[0].map(elem => elem.toLowerCase()).includes(blockchain.account.toLowerCase());
    const isWA = wa[0].map(elem => elem.toLowerCase()).includes(blockchain.account.toLowerCase());

    if ((blockchain.saleState === 1 && isOG) || (blockchain.saleState === 2 && isWl)
      || (blockchain.saleState === 3 && isWA)) {
      setEligibile(true);
    } else {
      if (blockchain.saleState === 1) {
        setInitMessage("You are not a Charlie's Angel!")
      } else if (blockchain.saleState === 2) {
        setInitMessage("You are not Charlisted/Allowlisted!")
      } else if (blockchain.saleState === 3) {
        setInitMessage("You are not Waitlisted.")
      }
      setEligibile(false);
    }
  }

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  const disconnect = () => {
    window.location.reload();
  }

  const resetCaptcha = () => {
    setCaptchaSuccess(false);
    captchaRef.current.reset();
  }

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  return (
    <s.Screen2>
      <div>
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <div className="mainbg">
          <div className='imgHandler'> 
            <img src={AstroCharlie} className='imgCharlie' alt="AstroCharlie"/>
          </div>

          <div className='mintHandler'>
            <div className='mintContainer'>
              <div className='mintContainerInner'>
                {
                  isConnected && (blockchain.saleState === 0 || ((blockchain.saleState === 1 || blockchain.saleState === 2 || blockchain.saleState === 3)
                    && !isEligible)) ? (
                    <>
                    <s.Container3 flex={2}>
                      <s.Container flex={2} jc={"center"} ai={"center"}>
                        <s.TextTitle style={{
                          textAlign: "center",
                          fontSize: 45,
                          fontWeight: "bold",
                          color: "#fff3e3",}}>
                          { blockchain.saleState === 0 ? "Minting is not allowed at the moment!" : initErrMsg }
                        </s.TextTitle>
                        <s.SpacerSmall />
                        <s.TextDescription2>
                          {walletDisplay}
                        </s.TextDescription2>
                        <s.TextDescription3 onClick={(e) => {
                          e.preventDefault();
                          disconnect();}}>
                          DISCONNECT
                        </s.TextDescription3>
                      </s.Container>
                    </s.Container3>
                    </>
                  ) : (
                    <s.Container3 flex={2}>
                      <s.Container flex={2} jc={"center"} ai={"center"}>
                        { !isConnected ? (
                          <s.Container ai={"center"} jc={"center"}>
                            <s.SpacerSmall/>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                submitForm();
                              }}>
                              <input type="hidden" name="hp" value="" ref={inputRef}/>
                              <button className="mntbutton" type="submit">
                                CONNECT WALLET
                              </button>
                            </form>
                            { blockchain.errorMsg !== "" ? (
                              <>
                                <s.SpacerSmall />
                                <s.TextDescription style={{
                                  textAlign: "center",
                                  color: "var(--err-text)",
                                  fontWeight: "bold"}}>
                                  {blockchain.errorMsg}
                                </s.TextDescription>
                              </>
                            ) : null }
                          </s.Container>
                        ) : (
                          <>
                            <h2>Minted:{data.totalSupply}/{CONFIG.MAX_SUPPLY}</h2>
                            { Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                              <>
                                <s.SpacerSmall />
                                <h2>SOLD OUT!</h2>
                              </>
                            ) : (
                              <>
                                <h3>
                                  1 Charlie = { CONFIG.DISPLAY_COST }{" "}ETH.
                                </h3>
                                <s.SpacerSmall />
                                { feedback !== "" ? (
                                  <>
                                    <s.TextDescription style={{
                                    textAlign: "center",
                                    color: isErrorMsg === 1 ? "var(--err-text)" : "#fff3e3",
                                    fontWeight: "bold"}}>
                                    {feedback}
                                    </s.TextDescription>
                                    <s.SpacerSmall />
                                  </>
                                ) : null }
                                <div className='mintConatinerInnermost'>
                                  <button className="mbtn"
                                    disabled={claimingNft ? 1 : 0}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      decrementMintAmount();
                                    }}>
                                    -
                                  </button>
                                  <p className="mintQuant">{mintAmount}</p>
                                  <button className="abtn"
                                    disabled={claimingNft ? 1 : 0}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      incrementMintAmount();
                                    }}> 
                                    + 
                                  </button>
                                </div>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  mintSubmit();
                                }}>
                                  <button className="mntbutton"
                                    disabled={(!captchaSuccess && !claimingNft) || (captchaSuccess && claimingNft) ? 1 : 0}
                                    type="submit">
                                    {claimingNft ? "MINTING..." : "MINT"}
                                  </button>
                                  <ReCAPTCHA className='g-recaptcha'
                                      sitekey={process.env.REACT_APP_SITE_KEY}
                                      ref={captchaRef}
                                      onChange={onChange}/>
                                  <input type="hidden" name="hp-2" value="" ref={mintRef}/>
                                </form>
                              </>
                            )}
                            <s.SpacerSmall />
                            <s.TextDescription2>
                              {walletDisplay}
                            </s.TextDescription2>
                            <s.TextDescription3 onClick={(e) => {
                              e.preventDefault();
                              disconnect();}}>
                              DISCONNECT
                            </s.TextDescription3>
                          </>
                        )}
                      </s.Container>
                    </s.Container3>
                  )
                }
              </div>
            </div> 
          </div>
        </div>
      </div>
    </s.Screen2>
  )
}

export default App;
