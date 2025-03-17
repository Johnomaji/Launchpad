import React from "react";
import PrimaryButton from "./buttons/PrimaryButton";
import PrimaryButtonInvert from "./buttons/PrimaryButtonInvert";
import { IoIosSwap } from "react-icons/io";
import DefaultButton from "./buttons/DefaultButton";

const Swap = ({ coinDetails }) => {
  return (
    <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
      <div className="absolute w-full inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] hover:bg-transparent rounded-2xl"></div>
      <div className="relative w-full flex flex-col justify-center items-center px-5 py-6 gap-5 bg-black transition-all duration-900 text-white rounded-2xl">
        <div className="flex flex-row w-full gap-4 justify-center items-center">
          <PrimaryButtonInvert name="Buy" className="w-full" />
          <PrimaryButton name="Sell" className="w-full" />
        </div>
        <div className="flex flex-row p-4 px-6 bg-[#151515] rounded-2xl w-full">
          <div className="flex flex-col flex-1/2 justify-center items-start">
            <label
              for="amount"
              class="ml-3 text-xs font-medium text-[#B0B0B0]"
            >
              Enter Amount
            </label>
            <input
              type="text"
              id="amount"
              class="bg-transparent border border-transparent text-[#FFFFFF] text-sm rounded-lg focus:ring-[#9033F4] focus:border-[#9033F4] block w-full p-2.5 placeholder-[#FFFFFF]"
              placeholder="0 HonkToken"
              required
            />
          </div>
          <div className="flex flex-col flex-1/2 items-end gap-2">
            <div className="flex flex-row justify-start items-center rounded-4xl bg-[#000] p-2 gap-2 w-[75%]">
              <div class="w-8 h-8 flex items-center justify-center overflow-hidden rounded-full">
                <img
                  src={coinDetails.image}
                  alt="Memecoin"
                  class="w-full h-full object-cover object-center"
                  draggable="false"
                />
              </div>
              <p className="text-xs">{coinDetails.name}</p>
            </div>
            <p className="text-xs">$0.00</p>
          </div>
        </div>
        <div className="relative w-9 h-9 flex justify-center items-center gap-3 bg-black rounded-full">
          <div className="absolute w-9 h-9 inset-0 bg-gradient-to-r from-[#FFA232] to-[#CC4E02] hover:bg-transparent rounded-full"></div>
          <div className="relative w-[93%] h-[93%] flex flex-col justify-center items-center p-2 bg-black transition-all duration-900 text-[#FFA232] rounded-full">
            <IoIosSwap />
          </div>
        </div>
        <div className="flex flex-row p-4 px-6 bg-[#151515] rounded-2xl w-full">
          <div className="flex flex-col flex-1/2 justify-center items-start">
            <label
              for="payment"
              class="ml-3 text-xs font-medium text-[#B0B0B0]"
            >
              Your Pay
            </label>
            <input
              type="text"
              id="payment"
              class="bg-transparent border border-transparent text-[#FFFFFF] text-sm rounded-lg focus:ring-[#9033F4] focus:border-[#9033F4] block w-full p-2.5 placeholder-[#FFFFFF]"
              placeholder="0 SUI"
              disabled
            />
          </div>
          <div className="flex flex-col flex-1/2 items-end gap-2">
            <div className="flex flex-row justify-start items-center rounded-4xl bg-[#000] p-2 gap-2 w-[55%]">
              <div class="w-8 h-8 flex items-center justify-center overflow-hidden rounded-full">
                <img
                  src="/assets/sui-icon.png"
                  alt="Memecoin"
                  class="w-full h-full object-cover object-center"
                  draggable="false"
                />
              </div>
              <p className="text-xs">SUI</p>
            </div>
            <p className="text-xs"><span className="font-thin">Balance: </span>$0.00</p>
          </div>
        </div>
        <div className="w-full">
            <DefaultButton name="Buy" className="w-full"/>
        </div>
      </div>
    </div>
  );
};

export default Swap;
