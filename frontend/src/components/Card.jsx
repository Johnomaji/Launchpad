import React from "react";
import { BiCopy } from "react-icons/bi";
import { RiUserLine } from "react-icons/ri";
import { GoArrowRight } from "react-icons/go";
import PrimaryButton from "./buttons/PrimaryButton";
import SecondaryButton from "./buttons/SecondaryButton";
import PrimaryButtonInvert from "./buttons/PrimaryButtonInvert";

const Card = ({ image, name, ca, buyersPercent, marketCap, marketPercent }) => {
  return (
    <div className="flex-shrink-0 cursor-pointer p-3 md:p-4 bg-white shadow-md flex flex-row  gap-4 md:gap-0 items-center justify-left rounded-3xl scroll-snap-align-start bg-radial-[at_-300%_25%] md:bg-radial-[at_-300%_70%] from-[#FF860A] to-[#161616] to-65%">
      {/* Image */}
      <div class="w-40 md:w-50 h-40 md:h-50 flex items-center justify-center overflow-hidden rounded-xl bg-gray-200">
        <img
          src={image}
          alt="Memecoin"
          class="w-full h-full object-cover object-center"
          draggable="false"
        />
      </div>
      {/* Content */}
      <div className="flex flex-col md:gap-1 mx-0 md:mx-5">
        <p className="text-lg font-medium">{name}</p>
        <div className="flex flex-row gap-1 mt-1">
          <p className="text-xs text-[#B0B0B0]">{`CA: ${ca?.slice(
            0,
            6
          )}....${ca?.slice(-4)}`}</p>
          <BiCopy style={{ color: "#E1D4FF" }} />
        </div>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-lg font-medium  bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] bg-clip-text text-transparent">
            ${marketCap}K
          </p>
          <p className="text-xs text-[#18CA48]">{marketPercent}</p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <div className="rounded-full p-1 w-6 h-6 flex justify-center items-center bg-[#380C69]">
            <RiUserLine style={{ color: "#E1D4FF" }} />
          </div>
          <p className="text-xs text-[#EAEBE7]">{buyersPercent}</p>
        </div>
        <div className="flex flex-row gap-2 items-center mt-2">
          <PrimaryButton name="Trade" className2="bg-[#161616]" />
          <PrimaryButtonInvert
            icon={<GoArrowRight />}
            href={`/coins/${ca}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
