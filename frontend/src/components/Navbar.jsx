import React, { useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import IconButton from "./buttons/IconButton";
import Search from "./forms/Search";
import LinkButton from "./buttons/LinkButton";
import Logo from "./Logo";
import AuthButton from "./AuthButton";
import { useLocation } from "react-router-dom";
import Button from "./Button";
import MenuSvg from "../assets/MenuSvg";
import { navigation } from "../constants";
import SecondaryButton from "./buttons/SecondaryButton";
import PrimaryButtonInvert from "./buttons/PrimaryButtonInvert";

const Navbar = ({ toggleOpenCreateCoin }) => {
  const path = useLocation();
  const [openNavigation, setOpenNavigation] = useState(false);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };
  return (
    <>
      <nav className="fixed top-0 z-50 w-full sm:w-[1600px] dark:bg-black ">
        <div className="sm:px-4 sm:px-8 py-3 md:py-6 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between items-center">
            <div className="flex items-center justify-start rtl:justify-end">
              {/* Logo */}
              <Logo />

              {/* Nav and search */}
              <div className="hidden md:flex flex-row items-center gap-5">
                <LinkButton
                  name="About Us"
                  href="/about"
                  active={path.pathname === "/about"}
                />
                <LinkButton
                  name="All Coins"
                  href="/coins"
                  active={path.pathname === "/coins"}
                />
                <Search />
              </div>
            </div>
            <nav
              className={`${
                openNavigation ? "flex" : "hidden"
              } fixed top-[4.3rem] left-0 right-0 bottom-0 bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-60% lg:static lg:flex lg:mx-auto lg:bg-transparent`}
            >
              <div className="relative z-50 flex flex-col items-center justify-center m-auto lg:flex-row">
                {navigation.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    onClick={handleClick}
                    className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 lg:hidden px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
                      item.url === path.pathname
                        ? "z-2 lg:text-n-1"
                        : "lg:text-n-1/50"
                    } lg:leading-5 lg:hover:text-n-1 xl:px-12`}
                  >
                    {item.title}
                  </a>
                ))}
                <div className="lg:hidden mb-4">
                  <PrimaryButtonInvert
                    handleOnClick={() => {
                      toggleOpenCreateCoin();
                      toggleNavigation();
                    }}
                    name="Launch a Coin"
                  />
                </div>
                <div className="lg:hidden">
                  <AuthButton />
                </div>
              </div>
            </nav>
            <div className="flex items-center gap-6 justify-center">
              {/* Notification */}
              <div className="hidden md:block">
                <IconButton icon={<IoNotificationsOutline />} />
              </div>
              <div className="hidden md:block">
                <AuthButton />
              </div>
            </div>
            <Button className="ml-0 lg:hidden" onClick={toggleNavigation}>
              <MenuSvg openNavigation={openNavigation} />
            </Button>
          </div>
        </div>
        <hr className="border-none h-[2px] bg-gradient-to-r from-[#EC8AEF] to-[#8121E0]" />
      </nav>
    </>
  );
};

export default Navbar;
