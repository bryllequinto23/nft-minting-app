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

// export const StyledInput = styled.input`
//   type: hidden;
// `
export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledButton2 = styled.button`
  padding: 15px 30px;
  border-radius: 10px;
  border: none;
  background-color: var(--secondary);
  font-weight: bold;
  color: var(--accent-text);
  width: 40%;
  font-size: 30px;
  cursor: pointer;

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
    width: 60%;
    font-size: 35px;
  }
`;

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

export const StyledButton4 = styled.button`
  all: unset;
  padding: 15px 30px;
  border-radius: 10px;
  border: none;
  background-color: var(--secondary);
  font-weight: bold;
  color: var(--accent-text);
  width: 100%;
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
    width: 60%;
    font-size: 35px;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
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

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--accent-text);
  text-decoration: none;
`;

function App() {
 //asdnajsdjabsjdbsdjhb
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const captchaRef = useRef(null);
  const inputRef = useRef(null);
  const mintRef = useRef(null);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [isErrorMsg, setErrorMsg] = useState(0);
  const [isConnected, setConnected] = useState(false);
  const [isEligible, setEligibile] = useState(false);
  const [walletDisplay, setWalletDisplay] = useState('');
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
    MAX_MINT_PUB: 0,
    WEI_COST: 0,
    WEI_COST_WL: 0,
    WEI_COST_OG: 0,
    DISPLAY_COST: 0,
    DISPLAY_COST_WL: 0,
    DISPLAY_COST_OG: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
    WL: [],
    OG: []
  });

  const submitForm = () => {
    if (inputRef.current.value === '') {
      dispatch(connect());
      alert('SUBMIT FORM GET DATA')
      getData();
    } else {
      alert('An error has occurred. Please refresh the browser and try again.')
    }
  }

  const onChange = async(value) => {
    const buf2hex = x => '0x' + x.toString('hex')
    console.log(blockchain.account)
    console.log(keccak256(blockchain.account))
    console.log(keccak256(blockchain.account).toString('hex'))
    console.log(Buffer.from(keccak256(blockchain.account).toString('hex'), 'hex'))
    const token = value;

    if (token !== '' && mintRef.current.value === '') {
      await axios.post('/.netlify/functions/helloWorld', {token})
        .then(res => {
          if (res.data.successful) {
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
    const l = CONFIG.OG.map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    console.log('OG')
    console.log(buf2hex(tree.getRoot()))

    const l2 = CONFIG.WL.map(x => keccak256(x));
    const tree2 = new MerkleTree(l2, keccak256, { sortPairs: true });
    const buf2hex2 = x => '0x' + x.toString('hex')

    console.log('WL')
    console.log(buf2hex2(tree2.getRoot()))
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
      } else if (+(state) === 1 || +(state) === 2) {
        verifyWLSale();
      } else if (+(state) === 3) {
        verifyPSale();
      }
    });
  }

  const verifyWLSale = () => {
    const totSupply = +(data.totalSupply);
    const ogTotal = +(data.ogTotal);
    const wlTotal = +(data.wlTotal);
    const maxOG = CONFIG.MAX_MINT_OG;
    const maxWl = CONFIG.MAX_MINT_WL;
    const maxSupply = CONFIG.MAX_SUPPLY;

    const newSupply = totSupply + mintAmount;
    const newOGTotal = ogTotal + mintAmount;
    const newWlTotal = wlTotal + mintAmount;

    if (newSupply > maxSupply) {
      alert("Beyond max supply.")
      resetCaptcha();
    } else if ((blockchain.saleState === 1 && (newOGTotal > maxOG)) || (blockchain.saleState === 2 && (newWlTotal > maxWl)))  {
      alert("You have reached the maximum amount of mints.")
      resetCaptcha();
    } else {
      checkEligibility();
      
      if (!isEligible) {
        alert("You are not og/whitelisted.")
        resetCaptcha();
      } else {
        setFeedback(`Minting your Charlie...`);
        setClaimingNft(true);

        if (blockchain.saleState === 1 === 1) {
          console.log('OG MINT')
          ogMint();
        } else {
          console.log('WL MINT')
          whitelistMint();
        }
      }
    }
  }

  const verifyPSale = () => {
    const totSupply = +(data.totalSupply);
    const pubTotal = +(data.pubTotal);
    const maxPub = CONFIG.MAX_MINT_PUB;
    const maxSupply = CONFIG.MAX_SUPPLY;

    const newSupply = totSupply + mintAmount;
    const newPubTotal = pubTotal + mintAmount;

    if (newSupply > maxSupply) {
      alert("Beyond max supply.")
      resetCaptcha();
    } else if (newPubTotal > maxPub) {
      alert("You have reached the maximum amount of mints.")
      resetCaptcha();
    } else {
      setFeedback(`Minting your Charlie...`);
      setClaimingNft(true);
      publicMint();
    }
  }

  const ogMint = () => {
    let cost = CONFIG.WEI_COST_OG;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    const l = CONFIG.OG.map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    console.log(buf2hex(tree.getRoot()))

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
    let cost = CONFIG.WEI_COST_WL;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    //console.log()

    const l = CONFIG.WL.map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    console.log(buf2hex(tree.getRoot()))

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

  const publicMint = () => {
    let cost = CONFIG.WEI_COST; // 1 ETH OR MATIC = 1000000000000000000 WEI
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
    } else if (blockchain.saleState === 3 && (mintAmount === CONFIG.MAX_MINT_PUB)) {
      newMintAmount = mintAmount;
    } else {
      newMintAmount = mintAmount + 1;
    }
    
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    alert('GET DATA')
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      alert('connected')
      setConnected(true);
      dispatch(fetchData(blockchain.account));
      if (blockchain.saleState === 1 || blockchain.saleState === 2) {
        checkEligibility();
      }

      let tempAcc = blockchain.account;
      
      tempAcc = tempAcc.substr(0,6) + '...' + tempAcc.substr(tempAcc.length - 4, tempAcc.length);
      setWalletDisplay(tempAcc);
    } else {
      alert('not connected')
      setConnected(false);
    }
  };

  const checkEligibility = () => {
    console.log(blockchain.account)
    const isWl = CONFIG.WL.map(elem => elem.toLowerCase()).includes(blockchain.account.toLowerCase());
    const isOG = CONFIG.OG.map(elem => elem.toLowerCase()).includes(blockchain.account.toLowerCase());

    if ((blockchain.saleState === 1 && isOG) || (blockchain.saleState === 2 && isWl)) {
      setEligibile(true);
    } else {
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
    console.log('disconnect')
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
    alert('USE EFFECT BLOCKCHAIN ACCOUNT')
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
                  isConnected ? (
                    <>
                      <h2>Minted:5001/5001</h2>
                      <h3>1 Charlie = 0.001 ETH.</h3>
                      <div className='mintConatinerInnermost'>
                      <button  className="mbtn" > - </button>
                      <p>1</p>
                      <button  className="abtn" > + </button>
                      </div>
                      <ReCAPTCHA  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" className='g-recaptcha' />
                      <button   className="mntbutton" default>SOLD OUT!!!</button>   
                    </>
                  ) : (
                    <>
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
                    </>
                    
                  )
                }
                
              </div>
            </div> 
          </div>
        </div>
      </div>
    
      {/* <s.Container2 flex={2} image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg6.png" : null}>
      </s.Container2>
      {process.env.REACT_APP_API_KEY}
      { isConnected && (blockchain.saleState === 0 || ((blockchain.saleState === 1 || blockchain.saleState === 2) && !isEligible)) ? (
        <s.Container3 flex={2}>
          <s.Container flex={2} jc={"center"} ai={"center"}>
            <s.TextTitle style={{
              textAlign: "center",
              fontSize: 50,
              fontWeight: "bold",
              color: "var(--primary-text)",}}>
              { blockchain.saleState === 0 ? "Minting is not allowed at the moment" : "You are not OG/whitelisted." }
            </s.TextTitle>
            <s.SpacerSmall />
            <s.TextDescription2>
              {walletDisplay}
            </s.TextDescription2>
            <s.TextDescription2 onClick={(e) => {
              e.preventDefault();
              disconnect();}}>
              DISCONNECT
            </s.TextDescription2>
          </s.Container>
        </s.Container3>
      ) : (
        <s.Container3 flex={2}>
          <s.Container flex={2} jc={"center"} ai={"center"}>
            { !isConnected ? (
              <s.Container ai={"center"} jc={"center"}>
                <s.SpacerSmall />
                <form onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}>
                  <input type="hidden" name="hp" value="" ref={inputRef}/>
                  <StyledButton4 type="submit"> */}



                    {/* onClick={(e) => {
                    e.preventDefault();
                    dispatch(connect());
                    getData();}}> */}



                    {/* CONNECT
                  </StyledButton4>
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
              <> */}



                {/* <StyledButton2 onClick={(e) => {
                  e.preventDefault();
                  disconnect();}}>
                  DISCONNECT
                </StyledButton2> */}



                {/* <s.TextTitle style={{
                  textAlign: "center",
                  fontSize: 50,
                  fontWeight: "bold",
                  color: "var(--primary-text)",}}>
                  {data.totalSupply} / {CONFIG.MAX_SUPPLY}
                </s.TextTitle> */}



                {/* <s.TextDescription style={{
                  textAlign: "center",
                  color: "var(--accent-text)",}}>
                  <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                    {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
                  </StyledLink>
                </s.TextDescription> */}



                {/* <s.SpacerSmall />
                { Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                  <>
                    <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      The sale has ended.
                    </s.TextTitle>
                    <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      You can still find {CONFIG.NFT_NAME} on
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                      {CONFIG.MARKETPLACE}
                    </StyledLink>
                  </>
                ) : (
                  <>
                    <s.TextTitle style={{ textAlign: "center", color: "var(--primary-text)" }}>
                        1 Charlie = { blockchain.saleState === 3 ? CONFIG.DISPLAY_COST : (blockchain.saleState === 1 ? CONFIG.DISPLAY_COST_OG : CONFIG.DISPLAY_COST_WL)}{" "}
                        {CONFIG.NETWORK.SYMBOL}.
                    </s.TextTitle> */}



                    {/* <s.SpacerXSmall />
                    <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      Excluding gas fees.
                    </s.TextDescription> */}



                    {/* <s.SpacerSmall />
                    { feedback !== "" ? (
                      <>
                        <s.TextDescription style={{
                        textAlign: "center",
                        color: isErrorMsg === 1 ? "var(--err-text)" : "var(--primary-text)",
                        fontWeight: "bold"}}>
                        {feedback}
                        </s.TextDescription>
                        <s.SpacerSmall />
                      </>
                    ) : null }
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton2 style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}>
                        -
                      </StyledRoundButton2>
                      <s.SpacerMedium />
                      <s.TextDescription style={{
                        textAlign: "center",
                        color: "var(--primary-text)",
                        fontWeight: "bold",
                        fontSize: "35px"}}>
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton2 disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}>
                        +
                      </StyledRoundButton2>
                    </s.Container>
                    <s.SpacerSmall />
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      mintSubmit();
                    }}>
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <StyledButton3 disabled={(!captchaSuccess && !claimingNft) || (captchaSuccess && claimingNft) ? 1 : 0}
                          type="submit">
                          {claimingNft ? "MINTING..." : "MINT"}
                        </StyledButton3>
                      </s.Container>
                      <s.SpacerSmall/>
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <ReCAPTCHA sitekey={process.env.REACT_APP_SITE_KEY}
                          ref={captchaRef}
                          onChange={onChange}/>
                      </s.Container>
                      <input type="hidden" name="hp-2" value="" ref={mintRef}/>
                    </form>
                  </>
                )}
                <s.SpacerSmall />
                <s.TextDescription2>
                  {walletDisplay}
                </s.TextDescription2>
                <s.TextDescription2 onClick={(e) => {
                  e.preventDefault();
                  disconnect();}}>
                  DISCONNECT
                </s.TextDescription2>
              </>
            )}
          </s.Container>
        </s.Container3>
      )} */}
    </s.Screen2>
  )
}

export default App;
