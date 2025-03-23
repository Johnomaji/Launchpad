import PrimaryButton from "../components/buttons/PrimaryButton";
import PrimaryButtonInvert from "../components/buttons/PrimaryButtonInvert";
import SecondaryButton from "../components/buttons/SecondaryButton";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { BsCopy } from "react-icons/bs";

const Portfolio = () => {
  return (
    <div className="rounded-lg">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col gap-4 mb-4 rounded-sm p-3 mt-6 md:mt-0 md:p-10 bg-black md:bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        <div className="flex w-full flex-col gap-1 md:gap-2 justify-start px-4 py-8 md:py-12 border border-[rgba(236,138,239,0.3)] bg-gradient-to-r from-[#1f0638] via-[#5A189A] to-black rounded-2xl">
          <p className="text-xl md:text-3xl font-semibold flex flex-row items-center gap-2 cursor-pointer">0x1c93...ce9583 <span className="text-sm"><BsCopy /></span></p>
          <div className="w-[70%] md:w-[30%]">
            <p className="text-lg md:text-2xl font-medium">$200</p>
            <p className="text-xs md:text-sm font-thin">Total Holdings</p>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center px-2 py-4">
          <p className="text-xl md:text-lg font-medium bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">
            Porfolio
          </p>

          <div className="flex flex-row gap-2">
            <PrimaryButton name="All Coins"  />
            <PrimaryButton name="Coins Created" icon={<PiPaperPlaneTilt />}/>
            <PrimaryButton name="Coins Owned" icon={<PiPaperPlaneTilt />}/>
          </div>
        </div>

        <div className="w-[100%]">
          <div class=" w-[100%]">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-200 uppercase bg-[#380C69] ">
                <tr>
                  <th scope="col" class="px-6 py-4">
                    Coins
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Market Cap
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Balance
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Value
                  </th>
                  <th scope="col" class="px-6 py-4">
                    24h Change
                  </th>
                  <th scope="col" class="px-6 py-4">
                    PnL
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-white border-b dark:bg-transparent dark:border-stone-700 border-gray-200">
                  <th
                    scope="row"
                    class="px-6 py-8 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    0x1c93..ce9563
                  </th>
                  <td class="px-6 py-8">$32k</td>
                  <td class="px-6 py-8">$5k</td>
                  <td class="px-6 py-8">$2999</td>
                  <td class="px-6 py-8">-</td>
                  <td class="px-6 py-8">View</td>
                </tr>
                <tr class="bg-white border-b dark:bg-transparent dark:border-stone-700 border-gray-200">
                  <th
                    scope="row"
                    class="px-6 py-8 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    0x1c93..ce9563
                  </th>
                  <td class="px-6 py-8">$32k</td>
                  <td class="px-6 py-8">$5k</td>
                  <td class="px-6 py-8">$2999</td>
                  <td class="px-6 py-8">-</td>
                  <td class="px-6 py-8">View</td>
                </tr>
                <tr class="bg-white dark:bg-transparent">
                  <th
                    scope="row"
                    class="px-6 py-8 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    0x1c93..ce9563
                  </th>
                  <td class="px-6 py-8">$32k</td>
                  <td class="px-6 py-8">$5k</td>
                  <td class="px-6 py-8">$2999</td>
                  <td class="px-6 py-8">-</td>
                  <td class="px-6 py-8">View</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
