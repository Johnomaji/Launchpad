import SecondaryButton from "../components/buttons/SecondaryButton";
import { PiPaperPlaneTilt } from "react-icons/pi";
import Header from "../components/Header";
import CardSlider from "../components/CardSlider";
import { coin1, coin2 } from "../constants";

const Home = () => {
  return (
    <div className="rounded-lg ">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center justify-center mb-4 rounded-sm p-3 md:p-8 bg-black md:bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        <div className="z-10 flex flex-col md:flex-row gap-5 md:gap-10 justify-between items-left md:items-center p-2 md:p-8 py-4 md:py-12 bg-[rgba(0,0,0,0.5)] rounded-2xl">
          <div className="w-full md:w-[43%] flex flex-col gap-2">
            <p className="text-2xl font-semibold">
              Launch Your Own Memecoin in Minutes! 🚀
            </p>
            <p className="text-md font-normal">
              No coding? No problem! Create, customize and deploy your memecoin
              effortlessly on the Sui blockchain. 🎉
            </p>
            <div className="mt-4">
              <SecondaryButton
                name="Launch a coin"
                icon={<PiPaperPlaneTilt />}
                href="/create-coin"
                className="text-lg p-2 px-4"
              />
            </div>
          </div>
          <div className="w-full md:w-[43%]">
            <img src="/assets/hero-img.png" />
          </div>
        </div>
          <div className="flex justify-center items-center w-[100%]">
            <CardSlider title="Trending Token" cards={coin1}/>
          </div>
      </div>

      <div className="flex items-center justify-center mb-4 rounded-sm">
      <div className="flex justify-center items-center w-[95%]">
            <CardSlider title="Biggest Volumes" cards={coin2}/>
          </div>
      </div>
    </div>
  );
};

export default Home;
