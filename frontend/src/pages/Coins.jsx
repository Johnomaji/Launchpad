import PrimaryButton from "../components/buttons/PrimaryButton";
import { MdStarBorder } from "react-icons/md";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { IoIosArrowRoundUp } from "react-icons/io";
import { allCoins, coin1 } from "../constants";
import CardWallet from "../components/CardWallet";
import Card from "../components/Card";
import useGetMemecoins from "../hooks/useGetMemecoins";

const Coins = () => {
  const { data, isLoading, isError } = useGetMemecoins();


  return (
    <div>




      <div className="rounded-lg">
        {/* Hero Section */}
        <div className="relative w-full flex flex-col items-left justify-left mb-4 rounded-sm p-3 mt-6 md:mt-0 md:p-10 bg-black md:bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
          <div className="flex w-full flex-col gap-3 md:gap-6 justify-left items-left py-4 px-2 md:px-6 md:py-12 bg-[rgba(0,0,0,0.5)] rounded-2xl">
            <p className="text-xl md:text-3xl font-semibold">All Coins</p>
            <div className="flex flex-row flex-wrap  gap-4 justify-left items-center ">
              <PrimaryButton name="All" />
              <PrimaryButton name="New" icon={<MdStarBorder />} />
              <PrimaryButton
                name="Top Performers"
                icon={<PiPaperPlaneTilt />}
              />
              <PrimaryButton name="High Volume" icon={<IoIosArrowRoundUp />} />
            </div>
          </div>

          <div class="flex flex-col justify-center items-center md:grid md:grid-cols-3 gap-6 mt-4 p-2 md:p-6 w-[100%]">
          {isLoading
              ? // Skeleton Loading State
              Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 p-3 md:p-4 bg-gray-800 shadow-md flex flex-row gap-4 md:gap-0 items-center justify-left rounded-3xl animate-pulse"
                >
                  {/* Image Placeholder */}
                  <div className="w-40 md:w-50 h-40 md:h-50 flex items-center justify-center overflow-hidden rounded-xl bg-gray-700"></div>
                  {/* Content Placeholder */}
                  <div className="flex flex-col md:gap-1 mx-0 md:mx-5 w-full">
                    <div className="h-6 w-3/4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-1/3 bg-gray-700 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
              : // Actual Data
                data?.map((coin, key) => (
                  <Card
                    key={key}
                    image={coin.image}
                    name={coin.name}
                    ca={coin.coinAddress}
                    buyersPercent={coin.buyersPercent}
                    marketCap={coin.marketCap || 0}
                    marketPercent={coin.marketPercent}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coins;
