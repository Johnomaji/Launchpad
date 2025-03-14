import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { BiCoinStack } from "react-icons/bi";
import { AiOutlineLineChart } from "react-icons/ai";
import { TfiBarChart } from "react-icons/tfi";
import { IoMdAdd } from "react-icons/io";
import { SlArrowRight } from "react-icons/sl";
import { SlArrowLeft } from "react-icons/sl";
import { PiPaperPlaneTilt } from "react-icons/pi";
import SecondaryLinkButton from "./buttons/SecondaryLinkButton";
import SecondaryButton from "./buttons/SecondaryButton";
import BasicButton from "./buttons/BasicButton";

const sideBarItems = [
  { id: 1, name: "Dashboard", href: "/", icon: <RxDashboard /> },
  { id: 2, name: "All Coins", href: "/coins", icon: <BiCoinStack /> },
  {
    id: 3,
    name: "Dex Screener",
    href: "/dexscreener",
    icon: <AiOutlineLineChart />,
  },
  { id: 4, name: "Leaderboard", href: "/leaderboard", icon: <TfiBarChart /> },
];

const Sidebar = () => {
   const [right, setRight] = useState(false)

  return (
    <>
      <aside
        id="logo-sidebar"
        className="absolute hidden md:block top-0 left-0 z-40 min-h-full pt-[10rem] transition-transform -translate-x-full bg-black border-r border-[#9033F4] sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="flex justify-center h-full px-3 pb-4 overflow-y-auto mr-5">
          <ul className="space-y-5 font-medium">
            <li>
              <BasicButton handleOnclick={()=>setRight(!right)} icon={right ? (<SlArrowRight />):(<SlArrowLeft />)} className="bg-transparent" />
            </li>
            {sideBarItems.map((item) => (
              <li key={item.id}>
                <SecondaryLinkButton
                   name={right && item.name}
                   className="w-full"
                  href={item.href}
                  icon={item.icon}
                />
              </li>
            ))}
            {!right ? (
            <li>
              <SecondaryButton icon={<IoMdAdd />} />
            </li>
            ) : (
            <li>
               <div className="flex flex-col gap-2 p-2 bg-white rounded-xl w-[200px]">
                  <img src="/assets/create-coin.png" alt="create-coin"/>
                  <SecondaryButton name="Launch a coin" icon={<PiPaperPlaneTilt />} href="/create" className="text-lg p-2 px-4"/>
               </div>
            </li>
            )}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
