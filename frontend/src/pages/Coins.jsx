import PrimaryButton from "../components/buttons/PrimaryButton";
import { MdStarBorder } from "react-icons/md";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { IoIosArrowRoundUp } from "react-icons/io";
import { allCoins, coin1 } from "../constants";
import CardWallet from "../components/CardWallet";
import Card from "../components/Card";

const Coins = () => {
  return (
    <div>
      <div className="rounded-lg">
        {/* Hero Section */}
        <div className="relative w-full flex flex-col items-left justify-left mb-4 rounded-sm p-3 mt-6 md:mt-0 md:p-10 bg-black md:bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
          <div className="flex w-full flex-col gap-1 md:gap-6 justify-left items-left py-4 px-6 md:py-12 bg-[rgba(0,0,0,0.5)] rounded-2xl">
            <p className="text-xl md:text-3xl font-semibold">All Coins</p>
            <div className="flex flex-row gap-4 justify-left items-center ">
              <PrimaryButton name="All" />
              <PrimaryButton name="New" icon={<MdStarBorder />} />
              <PrimaryButton
                name="Top Performers"
                icon={<PiPaperPlaneTilt />}
              />
              <PrimaryButton name="High Volume" icon={<IoIosArrowRoundUp />} />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mt-4">
            {allCoins.map((coin, key) => (
              <Card
                key={key}
                image={coin.image}
                name={coin.name}
                ca={coin.ca}
                buyersPercent={coin.buyersPercent}
                marketCap={coin.marketCap}
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
