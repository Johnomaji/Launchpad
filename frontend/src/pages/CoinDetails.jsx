import { useParams } from "react-router-dom";
import CardWallet from "../components/CardWallet";
import { coinChartData, singleCoinDetails } from "../constants";
import { FaXTwitter } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import CoinChart from "../components/CoinChart";
import Swap from "../components/Swap";
import useGetMemecoin from "../hooks/useGetMemecoin";

const CoinDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetMemecoin(id);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    // Format options
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
  
    // Format the date
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  if (isError) return <div className="p-5">No Memecoin Found.</div>;

  return (
    <div className="rounded-lg">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center justify-center mb-4 rounded-sm p-3 md:p-8 bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        {/* Skeleton Loading for Hero Section */}
        {isLoading ? (
          <div className="z-10 w-full flex flex-col md:flex-row gap-5 md:gap-10 justify-between items-left md:items-center p-2 md:p-8 py-4 md:py-12 mb-8 mt-10 md:mt-0 bg-[rgba(0,0,0,0.5)] rounded-2xl animate-pulse">
            <div className="flex flex-row gap-3 md:gap-6">
              <div className="flex flex-row justify-center items-center gap-2 border-r border-[#9033F4] pr-3 md:pr-6">
                <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 w-32 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="border-r border-[#9033F4] pr-3 md:pr-6">
                <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-24 bg-gray-700 rounded"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-24 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="z-10 w-full flex flex-col md:flex-row gap-5 md:gap-10 justify-between items-left md:items-center p-2 md:p-8 py-4 md:py-12 mb-8 mt-10 md:mt-0 bg-[rgba(0,0,0,0.5)] rounded-2xl">
            <div className="flex flex-row gap-3 md:gap-6">
              <div className="flex flex-row justify-center items-center gap-2 border-r border-[#9033F4] pr-3 md:pr-6">
                <div className="flex justify-center items-center w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src="/assets/user.jpg"
                    alt=""
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div>
                  <p className="font-light text-sm md:text-md">{data?.creator}</p>
                  <p className="text-md md:text-xl font-medium md:font-semibold bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">{`${data?.coinAddress?.slice(
                    0,
                    6
                  )}....${data?.coinAddress?.slice(-4)}`}</p>
                </div>
              </div>
              <div className="border-r border-[#9033F4] pr-3 md:pr-6">
                <p className="font-light text-sm md:text-md">Fees Earned</p>
                <p className="font-medium md:font-semibold text-sm md:text-md">$948.09k</p>
              </div>
              <div>
                <p className="font-light text-sm md:text-md">Treasury</p>
                <p className="font-medium md:font-semibold text-sm md:text-md">$500.01k</p>
              </div>
            </div>
          </div>
        )}

        {/* Card, Token Name, and Description */}
        {isLoading ? (
          <div className="z-10 w-full flex flex-col md:flex-row gap-5 md:gap-10 items-left md:items-center p-2 px-8 md:p-8 py-4 md:py-2 mb-9 bg-[rgba(0,0,0,0.5)] rounded-2xl animate-pulse">
            <div className="flex-[49%] md:border-r border-[#9033F4] pr-6">
              <div className="w-full h-64 bg-gray-700 rounded-2xl"></div>
            </div>
            <div className="flex-[49%] flex flex-col gap-2 py-4">
              <div className="bg-[rgba(0,0,0,0.5)] rounded-2xl p-8">
                <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
              </div>
              <div className="flex flex-row gap-3 bg-[rgba(0,0,0,0.5)] rounded-2xl p-8">
                <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="flex-[2%]">
              <div className="flex flex-row md:flex-col items-center justify-center text-2xl gap-4">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="z-10 w-full flex flex-col md:flex-row gap-5 md:gap-10 items-left md:items-center p-2 px-8 md:p-8 py-4 md:py-2 mb-9 bg-[rgba(0,0,0,0.5)] rounded-2xl">
            <div className="flex-[49%] md:border-r border-[#9033F4] pr-6">
              <CardWallet cardDetails={data} />
            </div>
            <div className="flex-[49%] flex flex-col gap-2 py-4">
              <div className="bg-[rgba(0,0,0,0.5)] rounded-2xl p-8">
                <p className="text-sm">
                  <span className="text-[#B0B0B0]">Token Name:</span> {data?.name}
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
                  <p className="text-sm">{data?.desc}</p>
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
        )}

        {/* Metrics Section */}
        {isLoading ? (
          <div className="flex flex-row flex-wrap md:flex-nowrap gap-8 md:gap-4 w-full p-4 justify-between mb-12 animate-pulse">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-[45%] md:flex-1/4">
                <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
                  <div className="absolute w-full inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] hover:bg-transparent rounded-2xl"></div>
                  <div className="relative w-full flex flex-col px-8 py-4 gap bg-black transition-all duration-900 text-white rounded-2xl">
                    <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-row flex-wrap md:flex-nowrap gap-8 md:gap-4 w-full p-4 justify-between mb-12">
            {/* Metrics content here */}
          </div>
        )}

        {/* Chart and Swap Section */}
        {isLoading ? (
          <div className="flex flex-col md:flex-row w-full gap-5 animate-pulse">
            <div className="flex-1/1 md:flex-2/3 h-96 bg-gray-700 rounded-2xl"></div>
            <div className="flex-1/1 md:flex-1/3 h-96 bg-gray-700 rounded-2xl"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row w-full gap-5">
            <div className="flex-1/1 md:flex-2/3">
              <CoinChart coinChartData={coinChartData} />
            </div>
            <div className="flex-1/1 md:flex-1/3 px-4 md:px-0">
              <Swap coinDetails={data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinDetails;