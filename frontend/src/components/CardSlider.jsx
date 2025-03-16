import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import BasicButton from "./buttons/BasicButton";
import { SlArrowRight } from "react-icons/sl";
import { SlArrowLeft } from "react-icons/sl";
import { BiCopy } from "react-icons/bi";
import { RiUserLine } from "react-icons/ri";
import { GoArrowRight } from "react-icons/go";
import PrimaryButton from "./buttons/PrimaryButton";
import SecondaryButton from "./buttons/SecondaryButton";

const CardSlider = ({ title, cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  const cardWidth = 200; // Width of each card
  const gap = 16; // Gap between cards
  const containerWidth = containerRef.current?.offsetWidth || 0; // Width of the container

  const handleNext = () => {
    if (containerRef.current) {
      const scrollAmount = containerWidth; // Scroll by one container width
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : prev));
    }
  };

  const handlePrev = () => {
    if (containerRef.current) {
      const scrollAmount = -containerWidth; // Scroll back by one container width
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  const handleDotClick = (index) => {
    if (containerRef.current) {
      const scrollAmount = (cardWidth + gap) * index; // Scroll to the specific card
      containerRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
      setCurrentIndex(index);
    }
  };

  // Framer Motion drag functionality
  const x = useMotionValue(0);
  const dragConstraints = {
    right: 0,
    left: -(cardWidth + gap) * (cards.length - 1),
  };

  return (
    <div className="flex flex-col items-center gap-5 p-4 w-[100%]">
      {/* Slider Content */}
      <div className="flex flex-row justify-between items-center w-[100%]">
        <p className="text-xl md:text-2xl font-medium bg-gradient-to-r from-[#FFA232] to-[#CC4E02] bg-clip-text text-transparent">
          {title}
        </p>
        <div>
          <button
            onClick={handlePrev}
            className="relative rounded-3xl inline-block bg-transparent cursor-pointer"
          >
            <div className="absolute inset-0 rounded-3xl"></div>

            <div className="relative flex flex-row gap-2 justify-center items-center p-3 rounded-3xl font-normal text-md transition-all duration-900 text-white">
              <SlArrowLeft />
            </div>
          </button>
          <button
            onClick={handleNext}
            className="relative rounded-3xl inline-block bg-transparent cursor-pointer"
          >
            <div className="absolute inset-0 rounded-3xl"></div>

            <div className="relative flex flex-row gap-2 justify-center items-center p-3 rounded-3xl font-normal text-md transition-all duration-900 text-white">
              <SlArrowRight />
            </div>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 w-[100%]">
        {/* Cards Container */}
        <div
          ref={containerRef}
          className={`flex gap-4 overflow-x-auto scroll-snap-x-mandatory scrollbar-hide overflow-x-hidden overflow-y-hidden ${cardWidth}`}
          style={{ scrollSnapType: "x mandatory" }}
        >
          <motion.div
            className="flex gap-4"
            style={{ x }}
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const offset = info.offset.x;
              const velocity = info.velocity.x;

              if (Math.abs(velocity) > 100) {
                const direction = velocity > 0 ? -1 : 1;
                const newIndex = currentIndex + direction;
                if (newIndex >= 0 && newIndex < cards.length) {
                  handleDotClick(newIndex);
                }
              } else if (Math.abs(offset) > cardWidth / 2) {
                const direction = offset > 0 ? -1 : 1;
                const newIndex = currentIndex + direction;
                if (newIndex >= 0 && newIndex < cards.length) {
                  handleDotClick(newIndex);
                }
              }
            }}
          >
            {cards.map((item, index) => (
              <motion.div
                key={item.id}
                className="flex-shrink-0 cursor-pointer p-4 bg-white shadow-md flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-left rounded-3xl scroll-snap-align-start bg-radial-[at_-300%_25%] md:bg-radial-[at_-300%_70%] from-[#FF860A] to-[#161616] to-65%"
              >
                {/* Image */}
                <div class="w-45 md:w-50 h-45 md:h-50 flex items-center justify-center overflow-hidden rounded-xl bg-gray-200">
                  <img
                    src={item.image}
                    alt="Your Image"
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
                    )}....${item.ca?.slice(-4)}`}</p>
                    <BiCopy style={{ color: "#E1D4FF" }} />
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-lg font-medium  bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] bg-clip-text text-transparent">${item.marketCap}K</p>
                    <p className="text-xs text-[#18CA48]">{item.marketPercent}</p>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <div className="rounded-full p-1 w-6 h-6 flex justify-center items-center bg-[#380C69]">
                        <RiUserLine style={{color:"#E1D4FF"}}/>
                    </div>
                  <p className="text-xs text-[#EAEBE7]">{item.buyersPercent}</p>
                  </div>
                  <div className="flex flex-row gap-2 items-center mt-2">
                    <PrimaryButton name="Trade" className2="bg-[#161616]"/>
                    <SecondaryButton className="text-xl p-3 px-5" icon={<GoArrowRight />}/>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Dot Navigation */}
      <div className="flex gap-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            className={`w-2 h-2 mx-1 rounded-full transition-colors cursor-pointer ${
              currentIndex === index ? "bg-purple-900" : "bg-gray-400"
            }`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CardSlider;
