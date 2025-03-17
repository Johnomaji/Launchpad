import React from "react";
import { BiCopy } from "react-icons/bi";
import { RiUserLine } from "react-icons/ri";
import { GoArrowRight } from "react-icons/go";
import PrimaryButton from "./buttons/PrimaryButton";
import SecondaryButton from "./buttons/SecondaryButton";

const Card = ({ cardDetails }) => {
  return (
    <div className="flex-shrink-0 cursor-pointer p-4 bg-white shadow-md flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-left rounded-3xl scroll-snap-align-start bg-radial-[at_-300%_25%] md:bg-radial-[at_-300%_70%] from-[#FF860A] to-[#161616] to-65%">
      {/* Image */}
      <div class="w-45 md:w-50 h-45 md:h-50 flex items-center justify-center overflow-hidden rounded-xl bg-gray-200">
        <img
          src={cardDetails.image}
          alt="Memecoin"
          class="w-full h-full object-cover object-center"
          draggable="false"
        />
      </div>
      {/* Content */}
      <div className="flex flex-col gap-1 mx-0 md:mx-5">
        <p className="text-lg font-medium">{item.name}</p>
        <div className="flex flex-row gap-1 mt-1">
          <p className="text-xs text-[#B0B0B0]">{`CA: ${item.ca?.slice(
            0,
            6
          )}....${cardDetails.ca?.slice(-4)}`}</p>
          <BiCopy style={{ color: "#E1D4FF" }} />
        </div>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-lg font-medium  bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] bg-clip-text text-transparent">
            ${cardDetails.marketCap}K
          </p>
          <p className="text-xs text-[#18CA48]">{cardDetails.marketPercent}</p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <div className="rounded-full p-1 w-6 h-6 flex justify-center items-center bg-[#380C69]">
            <RiUserLine style={{ color: "#E1D4FF" }} />
          </div>
          <p className="text-xs text-[#EAEBE7]">{cardDetails.buyersPercent}</p>
        </div>
        <div className="flex flex-row gap-2 items-center mt-2">
          <PrimaryButton name="Trade" className2="bg-[#161616]" />
          <SecondaryButton
            className="text-xl p-3 px-5"
            icon={<GoArrowRight />}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
