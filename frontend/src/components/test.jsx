import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import dynamic from "next/dynamic";
import {
  getLCXWalletBalance,
  getWalletBalance,
  resetAccount,
} from "../../redux/user/Action";
import {
  swapPair,
  updateAllPairs,
  updateExchangeList,
  orderSwap,
  selectedLimitExchange,
  updateConfirmData,
  orderPlaceAction,
  getProtocols,
} from "../../redux/basic/Action"; // Ensure correct import path
import { useWindowSize } from "../../hooks/widthWindow";
//Lazy load Exchange to speed up initial render
const Exchange = dynamic(() => import("../../components/Exchange"), {
  // loading: () => <div>Loading...</div>,
  // ssr: false,
});
const Swap = ({ initialPairs, initialProtocols }) => {
  const dispatch = useDispatch();

  const { width } = useWindowSize();
  // Select necessary state slices from Redux
  const lcxWalletBalance = useSelector((state) => state.user.lcxWalletBalance);
  const swapPairState = useSelector((state) => state.basic.swapPair);
  const pairsHash = useSelector((state) => state.basic.pairsHash);
  const pairs = useSelector((state) => state.basic.pairs);
  const exchangeScreen = useSelector((state) => state.basic.exchangeScreen);
  const orderDetails = useSelector((state) => state.basic.orderDetails);
  const protocols = useSelector((state) => state.basic.protocols);
  const isOrderPlace = useSelector((state) => state.basic.isOrderPlace);

  useEffect(() => {
    dispatch(updateAllPairs(initialPairs));
    dispatch(getProtocols(initialProtocols));
  }, [dispatch, initialPairs, initialProtocols]);

  useEffect(() => {
    dispatch(getLCXWalletBalance());
  }, [dispatch]);

  return (
    <div className="main_basic_container">
      <div className="basic_exchange_continaer">
        {width > 520 ? (
          <Exchange
            lcxWalletBalance={lcxWalletBalance}
            swapPair={swapPairState}
            pairsHash={pairsHash}
            pairs={pairs}
            exchangeScreen={exchangeScreen}
            orderDetails={orderDetails}
            protocols={protocols}
            isOrderPlace={isOrderPlace}
            dispatch={dispatch}
          />
        ) : (
          <>
            {/* <h1 style={{ color: "white" }}>Hello Swap</h1> */}
            <Exchange
              lcxWalletBalance={lcxWalletBalance}
              swapPair={swapPairState}
              pairsHash={pairsHash}
              pairs={pairs}
              exchangeScreen={exchangeScreen}
              orderDetails={orderDetails}
              protocols={protocols}
              isOrderPlace={isOrderPlace}
              dispatch={dispatch}
            />
          </>
        )}
      </div>
    </div>
  );
};