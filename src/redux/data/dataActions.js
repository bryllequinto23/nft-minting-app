// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      const acc = store.getState().blockchain.account;

      let totalSupply = await store
        .getState()
        .blockchain.smartContract.methods.totalSupply()
        .call();
      
      let totalWL = await store
        .getState()
        .blockchain.smartContract.methods.totalWhitelistMint(acc)
        .call();
      
      let totalOG = await store
        .getState()
        .blockchain.smartContract.methods.totalOGMint(acc)
        .call();

      let totalWA = await store
        .getState()
        .blockchain.smartContract.methods.totalWaitlistMint(acc)
        .call();

      // console.log(totalPublic)
      dispatch(
        fetchDataSuccess({
          totalSupply,
          totalWL,
          totalOG,
          totalWA
          // cost,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
