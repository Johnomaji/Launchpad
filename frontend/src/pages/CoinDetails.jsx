import { useParams } from "react-router-dom";
import CardWallet from "../components/CardWallet";
import { coinChartData, singleCoinDetails } from "../constants";
import { FaXTwitter } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import CoinChart from "../components/CoinChart";
import Swap from "../components/Swap";

const CoinDetails = () => {
  const { id } = useParams();

  const userWallet =
    "0x9783234ho2jn3no2ji34mkm23m23mn3m333n33i838hruwehr8923uhfjnwe";
  return (
    <div className="rounded-lg ">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center justify-center mb-4 rounded-sm p-3 md:p-8 bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        <div className="z-10 w-full flex flex-col md:flex-row gap-5 md:gap-10 justify-between items-left md:items-center p-2 md:p-8 py-4 md:py-12 mb-8 bg-[rgba(0,0,0,0.5)] rounded-2xl">
          <div className="flex flex-row gap-6">
            <div className="flex flex-row justify-center items-center gap-2 border-r border-[#9033F4] pr-6">
              <div className="flex justify-center items-center w-10 h-10 rounded-full overflow-hidden">
                <img
                  src="/assets/user.jpg"
                  alt=""
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <div>
                <p className="font-light">Owner</p>
                <p className="text-xl md:text-xl font-semibold bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">{`${userWallet?.slice(
                  0,
                  6
                )}....${userWallet?.slice(-4)}`}</p>
              </div>
            </div>
            <div className="border-r border-[#9033F4] pr-6">
              <p className="font-light">Fees Earned</p>
              <p className="font-semibold">$948.09k</p>
            </div>
            <div>
              <p className="font-light">Treasury</p>
              <p className="font-semibold">$500.01k</p>
            </div>
          </div>
        </div>

        {/* Card, Token Name and Description */}
        <div className="z-10 w-full flex flex-col md:flex-row gap-5 md:gap-10 items-left md:items-center p-2 md:p-8 py-4 md:py-2 mb-9 bg-[rgba(0,0,0,0.5)] rounded-2xl">
          <div className="flex-[49%]  md:border-r border-[#9033F4] pr-6">
            <CardWallet cardDetails={singleCoinDetails} />
          </div>
          <div className="flex-[49%] flex flex-col gap-2 py-4">
            <div className="bg-[rgba(0,0,0,0.5)] rounded-2xl p-8">
              <p className="text-sm">
                <span className="text-[#B0B0B0]">Token Name:</span>{" "}
                {singleCoinDetails.name}
              </p>
            </div>
            <div className="flex flex-row gap-3 bg-[rgba(0,0,0,0.5)] rounded-2xl p-8">
              <div>
                <p className="text-sm">
                  <span className="text-[#B0B0B0]">Token </span>
                </p>
                <p className="text-sm">
                  <span className="text-[#B0B0B0]">Description: </span>
                </p>
              </div>
              <div>
                <p className="text-sm">Description</p>
              </div>
            </div>
          </div>
          <div className="flex-[2%]">
            <div className="flex flex-row md:flex-col items-center justify-center text-2xl gap-4">
              <FaXTwitter />
              <FaDiscord />
              <FaTelegramPlane />
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 w-full p-4 justify-between mb-12">
          {/* 1 */}
          <div className="w-[48%] md:flex-1/4">
            <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
              <div className="absolute w-full inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] hover:bg-transparent rounded-2xl"></div>
              <div className="relative w-full flex flex-col px-8 py-4 gap bg-black transition-all duration-900 text-white rounded-2xl">
                <p className="text-[#B0B0B0]">Price</p>
                <p className="bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">
                  $1.88M
                </p>
              </div>
            </div>
          </div>

          {/* 2 */}
          <div className="w-[48%] md:flex-1/4">
            <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
              <div className="absolute w-full inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] hover:bg-transparent rounded-2xl"></div>
              <div className="relative w-full flex flex-col px-8 py-4 gap bg-black transition-all duration-900 text-white rounded-2xl">
                <p className="text-[#B0B0B0]">Value (24h)</p>
                <p className="bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">
                $948.09k
                </p>
              </div>
            </div>
          </div>

          {/* 3 */}
          <div className="w-[48%] md:flex-1/4">
            <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
              <div className="absolute w-full inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] hover:bg-transparent rounded-2xl"></div>
              <div className="relative w-full flex flex-col px-8 py-4 gap bg-black transition-all duration-900 text-white rounded-2xl">
                <p className="text-[#B0B0B0]">Market Cap</p>
                <p className="bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">
                $948.09k
                </p>
              </div>
            </div>
          </div>

          {/* 4 */}
          <div className="w-[48%] md:flex-1/4">
            <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
              <div className="absolute w-full inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] hover:bg-transparent rounded-2xl"></div>
              <div className="relative w-full flex flex-col px-8 py-4 gap bg-black transition-all duration-900 text-white rounded-2xl">
                <p className="text-[#B0B0B0]">Liquidity</p>
                <p className="bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">
                $600.02
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Buy and Sell */}
        <div className="flex flex-col md:flex-row w-full gap-5">
            {/* Chart */}
            <div className="flex-1/1 md:flex-2/3">
                <CoinChart coinChartData={coinChartData}/>
            </div>

            {/* trade */}
            <div className="flex-1/1 md:flex-1/3 px-4 md:px-0">
                <Swap coinDetails={singleCoinDetails}/>
            </div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-4 rounded-sm"></div>
    </div>
  );
};

export default CoinDetails;
