import React, { useState } from "react";
import IconButton from "./buttons/IconButton";
import { RxCross2 } from "react-icons/rx";
import { CiImageOn } from "react-icons/ci";
import DefaultButton2 from "./buttons/DefaultButton2";
import { IoMdAdd } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import PrimaryButtonInvert from "./buttons/PrimaryButtonInvert";
import { BiCopy } from "react-icons/bi";

const CreateCoin = ({openCreateCoin, toggleOpenCreateCoin}) => {
  const [open, setOpen] = useState(false);
  

  const toggleOpenSocials = () => {
    setOpen(!open)
  }



  return (
    <div className={`flex flex-row fixed w-full md:w-[1600px] h-screen z-60 transition-transform duration-300 ease-in-out ${
        openCreateCoin ? 'translate-x-0' : 'translate-x-full'
      }`}>
      {/* <div className="hidden md:block w-[40%] backdrop-blur-md bg-[rgba(0,0,0,0.5)]" onClick={toggleOpenCreateCoin}></div> */}
      <div className={`md:w-full bg-black p-6 overflow-y-scroll transition-transform duration-300 ease-in-out ${
        openCreateCoin ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-row justify-between items-start mb-4">
          <div>
            <p className="text-lg ">Launch Your Own Memecoin in Minutes! 🚀</p>
            <p className="text-sm w-[80%]">
              Create, customize, and deploy your memecoin effortlessly on the
              Sui blockchain.
            </p>
          </div>
          <div>
            <DefaultButton2 handleOnclick={toggleOpenCreateCoin} className="bg-black p-1" icon={<RxCross2 />} />
          </div>
        </div>
        <hr className="border-none h-[1px] bg-gradient-to-r from-[#EC8AEF] to-[#8121E0]" />

        <div className="p-4 flex flex-col md:flex-row gap-5">
          {/* Upload picture */}
          <div className="w-[50%] md:w-[25%] h-50 rounded-xl p-3 bg-radial-[at_-300%_25%] md:bg-radial-[at_-300%_70%] from-[#FF860A] to-[#161616] to-65%">
            <div className="bg-[#B0B0B0] rounded-xl h-30 flex justify-center items-center text-2xl">
              <CiImageOn />
            </div>

            <input
              type="text"
              id="amount"
              class="bg-transparent border border-transparent text-[#FFFFFF] text-lg rounded-lg focus:ring-[#9033F4] focus:border-[#9033F4] block w-full pt-2 placeholder-[#FFFFFF]"
              placeholder="[Ticker]"
              required
              disabled
            />

            <div className="text-xs font-thin flex flex-row gap-2">
              <p>CA: 0x0 </p>
              <BiCopy />
            </div>
          </div>
          {/* Create Memecoin input */}
          <div className="w-full md:w-[75%] flex flex-col gap-3">
            {/* Section 1 */}
            <div className="w-full p-4 flex flex-col gap-3 rounded-xl bg-linear-300 from-[rgba(129,33,224,0.5)] to-[rgb(250,210,210,0.1)]">
              <label
                for="dropzone-file"
                class="flex flex-row items-center justify-between w-full p-2 px-3 border-[1px] border-[rgba(255,255,255,0.3)] rounded-xl cursor-pointer bg-transparent hover:bg-[rgba(0,0,0,0.5)] hover:border-gray-500"
              >
                <div className="flex flex-row gap-2 justify-center items-center text-xs">
                  <div className="text-3xl">
                    <CiImageOn />
                  </div>
                  <p className="font-thin">
                    Add Image <span className="hidden md:block">(SVG, PNG, JPG or GIF (MAX. 800x400px))</span>
                  </p>
                </div>
                <div class="flex flex-row items-center gap-2 justify-end text-white text-xs">
                  <div>
                    <p class="mb-2 font-thin">drag here, or</p>
                  </div>
                  <DefaultButton2 name="Select File" icon={<IoMdAdd />} />
                </div>
                <input id="dropzone-file" type="file" class="hidden" />
              </label>

              <div class="">
                <label
                  for="coin_name"
                  class="block mb text-sm font-thin text-white"
                >
                  Coin name
                </label>
                <input
                  type="text"
                  id="coin_name"
                  class="bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 rounded-lg block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                  placeholder="e.g SUICON"
                  required
                />
              </div>

              <div class="">
                <label
                  for="ticker"
                  class="block mb text-sm font-thin text-white"
                >
                  Ticker
                </label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                    $
                  </span>
                  <input
                    type="text"
                    id="ticker"
                    class="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                    placeholder="$SUIC"
                  />
                </div>
              </div>

              <div>
                <label for="desc" class="block mb text-sm font-thin text-white">
                  Description
                </label>
                <textarea
                  id="desc"
                  rows="4"
                  class="bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 rounded-lg block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                  placeholder="Write your thoughts here..."
                ></textarea>
              </div>

              <div class="">
                <label
                  for="total_coin"
                  class="block mb text-sm font-thin text-white"
                >
                  Total Coins (Fixed)
                </label>
                <input
                  type="text"
                  id="total_coin"
                  class="bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 rounded-lg block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                  placeholder="500k"
                  required
                  disabled
                />
              </div>
            </div>

            {/* Section 2 */}
            <div className="w-full p-4 flex flex-col gap-3 rounded-xl bg-linear-300 from-[rgba(129,33,224,0.5)] to-[rgb(250,210,210,0.1)]">
              <div className="w-full flex flex-row justify-between items-center">
                <p>Socials</p>
                <button className="cursor-pointer p-2" onClick={toggleOpenSocials}>
                    {
                        open ? <IoIosArrowDown /> : <IoIosArrowUp />
                    }
                </button>
              </div>
              {open && (
                <>
                  <div class="">
                    <label
                      for="ticker"
                      class="block mb text-sm font-thin text-white"
                    >
                      X/Twitter
                    </label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                        x.com/
                      </span>
                      <input
                        type="text"
                        id="ticker"
                        class="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                        placeholder="$SUIC"
                      />
                    </div>
                  </div>

                  <div class="">
                    <label
                      for="ticker"
                      class="block mb text-sm font-thin text-white"
                    >
                      Telegram
                    </label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                        t.me/
                      </span>
                      <input
                        type="text"
                        id="ticker"
                        class="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                        placeholder="$SUIC"
                      />
                    </div>
                  </div>

                  <div class="">
                    <label
                      for="ticker"
                      class="block mb text-sm font-thin text-white"
                    >
                      Discord
                    </label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                        discord.gg/
                      </span>
                      <input
                        type="text"
                        id="ticker"
                        class="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                        placeholder="$SUIC"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Section 3 */}
            <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl ">
              <div className="absolute inset-0 bg-gradient-to-b from-[#9033F4] to-[#EC8AEF] hover:bg-transparent rounded-2xl"></div>
              <div className="relative w-full flex flex-col gap-2 py-5 px-4 bg-[black] transition-all duration-900 text-white rounded-2xl">
                <div className="flex flex-row justify-between text-sm">
                  <p className="font-thin">Launch cost</p>
                  <p className="font-medium">0.0232 SUI</p>
                </div>

                <div className="flex flex-row justify-between text-sm">
                  <p className="font-thin">Available Balance</p>
                  <p className="font-medium">2 SUI</p>
                </div>

                <PrimaryButtonInvert name="Launch Coin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoin;
