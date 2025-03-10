import { useParams } from "react-router-dom";

const CoinDetails = () => {
  const { id } = useParams();
  return <div>Coin Details Page for ID: {id}</div>;
};

export default CoinDetails;