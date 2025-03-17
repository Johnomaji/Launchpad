import React from "react";
import { BiCopy } from "react-icons/bi";
import { RiUserLine } from "react-icons/ri";
import { GoArrowRight } from "react-icons/go";
import PrimaryButton from "./buttons/PrimaryButton";
import SecondaryButton from "./buttons/SecondaryButton";

const CardWallet = ({ cardDetails }) => {
  return (
    <div className="flex-shrink-0 cursor-pointer shadow-md flex flex-row gap-4 px-2 md:px-0 md:gap-0 items-center justify-left rounded-3xl scroll-snap-align-start bg-transparent">
      {/* Image */}
      <div class="w-35 md:w-40 h-35 md:h-40 flex items-center justify-center overflow-hidden rounded-xl bg-gray-200">
        <img
          src={cardDetails.image}
          alt="Memecoin"
          class="w-full h-full object-cover object-center"
          draggable="false"
        />
      </div>
      {/* Content */}
      <div className="flex flex-col gap-1 mx-0 md:mx-5">
        <p className="text-3xl font-medium">{cardDetails.name}</p>
        <div className="flex flex-row gap-1 mt-1">
          <p className="text-sm text-[#B0B0B0]">{`CA: ${cardDetails.ca?.slice(
            0,
            6
          )}....${cardDetails.ca?.slice(-4)}`}</p>
          <BiCopy style={{ color: "#E1D4FF" }} />
        </div>
        <div>
          <p className="text-[#B0B0B0] text-sm">Created: {`[${cardDetails.timestamp}]`}</p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-2xl font-medium  bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] bg-clip-text text-transparent">
            ${cardDetails.marketCap}K
          </p>
          <p className="text-xs text-[#18CA48]">{cardDetails.marketPercent}</p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <div className="rounded-full p-1 w-6 h-6 flex justify-center items-center bg-[#B0B0B0]">
            <RiUserLine style={{ color: "#000" }} />
          </div>
          <p className="text-md text-[#E1D4FF]">
            <span className="text-[#B0B0B0]">Holders: </span>
            {cardDetails.buyersPercent}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardWallet;
