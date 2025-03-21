import React, { useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { CiImageOn } from "react-icons/ci";
import DefaultButton2 from "../components/buttons/DefaultButton2";
import { IoMdAdd } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import PrimaryButtonInvert from "../components/buttons/PrimaryButtonInvert";
import { BiCopy } from "react-icons/bi";
import { useWallet } from "@suiet/wallet-kit";
import { useAccountBalance } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "react-toastify";
import useCreateMemecoin from "../hooks/useCreateMemecoin";

const CreateCoin = ({ openCreateCoin, toggleOpenCreateCoin }) => {
  const { wallet, connected, address, signAndExecuteTransaction } =
    useWallet();
  const { error, loading, balance } = useAccountBalance();
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const formRef = useRef({
    name: "",
    ticker: "",
    creator: "",
    image: "",
    desc: "",
    totalCoins: "",
    xSocial: "",
    telegramSocial: "",
    discordSocial: "",
  });

  const { mutateAsync: addMemecoin } = useCreateMemecoin();

  const toggleOpenSocials = () => {
    setOpen(!open);
  };

  const createMemecoin = async () => {
    if (!connected) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${"0xe508172f6637bea151f34d3a0914ddeef1faefbfe5f295bdc6ef2c8e39c5724b"}::${"token"}::${"create_token"}`,
        arguments: [
          tx.pure.string("Brown"), // name
          tx.pure.string("BRN"), // symbol
          tx.pure.string("Next big thing"), // desc
          tx.pure.string("https://images.unsplash.com/photo-1742041675087-dc3ceacd88cb?q=80&w=2035&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"), // imgUrl
          tx.pure.string("google.com"), // website
          tx.pure.string("google.com"), // x
          tx.pure.string("google.com"), // telegram
          tx.pure.u64(1), // payment_fee
          tx.pure.u64(1), // fee_configruation
          tx.pure.u64(30000000), // total_supply
          tx.pure.u64(8), // decimal
        ],
      });

      const result = await signAndExecuteTransaction({ transactionBlock: tx });
      console.log("Transaction result:", result);
    } catch (error) {
      console.log(error);
    }
  };

  // const handleFileChange = (event) => {
  //   const selectedFile = event.target.files[0];
  //   if (!selectedFile) return;

  //   // Validate file type
  //   const validFileTypes = ["image/png", "image/jpeg"];
  //   if (!validFileTypes.includes(selectedFile.type)) {
  //     toast.error("Please select a valid image file (PNG or JPEG).");
  //     return;
  //   }

  //   setFile(selectedFile);

  //   // Create a preview URL for the image
  //   const objectUrl = URL.createObjectURL(selectedFile);
  //   setPreviewUrl(objectUrl);
  // };
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile)

    console.log("File: ", selectedFile)
  
    // Validate file type
    const validFileTypes = ["image/png", "image/jpeg"];
    if (!validFileTypes.includes(selectedFile.type)) {
      toast.error("Please select a valid image file (PNG or JPEG).");
      return;
    }
  
    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  
    // try {
    //   // Convert file to base64
    //   const reader = new FileReader();
    //   const fileContent = await new Promise((resolve) => {
    //     reader.onload = () => resolve(reader.result.split(',')[1]);
    //     reader.readAsDataURL(selectedFile);
    //   });
  
    //   const payload = {
    //     files: [{
    //       name: selectedFile.name,
    //       size: selectedFile.size,
    //       type: selectedFile.type,
    //       content: fileContent, // Base64 encoded file
    //       customId: null
    //     }],
    //     acl: "public-read",
    //     metadata: null,
    //     contentDisposition: "inline"
    //   };
  
    //   const response = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-Uploadthing-Api-Key":"sk_live_1c6dad130e9c59ff666a8a88b97d055e95b46274901d97a1317b5b25f3e47c6a"
    //     },
    //     body: JSON.stringify(payload)
    //   });
  
    //   const data = await response.json();
    //   if (!response.ok) throw new Error(data.error || "Upload failed");
  
    //   console.log("Uploaded URL:", data.data[0].url);
    //   setFileUrl(data.data[0].fileUrl);
    //   return data.data[0].url;
      
    // } catch (error) {
    //   toast.error("Upload failed: " + error.message);
    // } finally {
    //   URL.revokeObjectURL(objectUrl);
    // }
  };

  const handleCreateMemecoin = async () => {
    if (!connected) {
      toast.error("Please connect a wallet to create a memecoin.");
    }

    if (
      !formRef.current.name ||
      !formRef.current.ticker ||
      !formRef.current.image ||
      !formRef.current.desc ||
      !formRef.current.totalCoins
    ) {
      toast.error("Please fill in all the required fields.");
    }

    try {
      const body = {
        name: formRef.current.name,
        ticker: formRef.current.ticker,
        creator: formRef.current.creator,
        image: formRef.current.image,
        desc: formRef.current.desc,
        totalCoins: formRef.current.totalCoins,
        xSocial: formRef.current.xSocial,
        telegramSocial: formRef.current.telegramSocial,
        discordSocial: formRef.current.discordSocial,
        creatorAddress: address,
      };
      

      const data = await addMemecoin(body);

      console.log(data);
    } catch (error) {
        console.error("Error during authentication:", error);
      
    }
  };

  return (
    <div className="p-3 mt-6 md:mt-0 md:p-10 md:px-15">
      <div className="flex flex-row justify-between items-start mb-2 p-4">
        <div>
          <p className="text-lg ">Launch Your Own Memecoin in Minutes! 🚀</p>
          <p className="text-sm w-[80%]">
            Create, customize, and deploy your memecoin effortlessly on the Sui
            blockchain.
          </p>
        </div>
        {/* <div>
          <DefaultButton2
            handleOnclick={toggleOpenCreateCoin}
            className="bg-black p-1"
            icon={<RxCross2 />}
          />
        </div> */}
      </div>
      {/* <hr className="border-none h-[1px] bg-gradient-to-r from-[#EC8AEF] to-[#8121E0]" /> */}

      <div className="p-4 flex flex-col md:flex-row gap-5 md:gap-5">
        {/* Upload picture */}
        <div className="w-[50%] md:w-[17%] h-60 rounded-xl p-3 bg-radial-[at_-300%_25%] md:bg-radial-[at_-300%_70%] from-[#FF860A] to-[#161616] to-65%">
          {previewUrl ? (
            <>
              <div className="h-40 w-full rounded-xl flex justify-center items-center overflow-hidden">
                <img
                  alt="Selected Image"
                  src={previewUrl}
                  variant="square"
                  className="w-full h-full object-cover object-center rounded-xl"
                />
              </div>
            </>
          ) : (
            <div className="bg-[#B0B0B0] rounded-xl h-40 w-full flex justify-center items-center text-2xl">
              <CiImageOn />
            </div>
          )}

          <input
            type="text"
            id="amount"
            className="bg-transparent border border-transparent text-[#FFFFFF] text-lg rounded-lg focus:ring-[#9033F4] focus:border-[#9033F4] block w-full pt-2 placeholder-[#FFFFFF]"
            placeholder={file?.name || "Name"}
            required
            disabled
          />

          <div className="text-xs font-thin flex flex-row gap-2">
            <p>CA: 0x0 </p>
            <BiCopy />
          </div>
        </div>
        {/* Create Memecoin input */}
        <div className="w-full md:w-[83%] flex flex-col gap-3">
          {/* Section 1 */}
          <div className="w-full p-4 flex flex-col gap-3 rounded-xl bg-linear-300 from-[rgba(129,33,224,0.5)] to-[rgb(250,210,210,0.1)]">
            <label
              for="dropzone-file"
              className="flex flex-row items-center justify-between w-full p-2 px-3 border-[1px] border-[rgba(255,255,255,0.3)] rounded-xl cursor-pointer bg-transparent hover:bg-[rgba(0,0,0,0.5)] hover:border-gray-500"
            >
              <div className="flex flex-row gap-2 justify-center items-center text-xs">
                <div className="text-3xl">
                  <CiImageOn />
                </div>
                <p className="font-thin">
                  Add Image{" "}
                  <span className="hidden md:block">
                    (SVG, PNG, JPG or GIF (MAX. 800x400px))
                  </span>
                </p>
              </div>
              <div className="flex flex-row items-center gap-2 justify-end text-white text-xs">
                <div>
                  <p className="mb-2 font-thin">drag here, or</p>
                </div>
                <DefaultButton2 name="Select File" icon={<IoMdAdd />} />
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <div className="">
              <label
                for="coin_name"
                className="block mb text-sm font-thin text-white"
              >
                Coin name *
              </label>
              <input
                type="text"
                id="coin_name"
                ref={formRef.name}
                className="bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 rounded-lg block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                placeholder="e.g SUICON"
                required
              />
            </div>

            <div className="">
              <label
                for="ticker"
                className="block mb text-sm font-thin text-white"
              >
                Ticker *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                  $
                </span>
                <input
                  type="text"
                  id="ticker"
                  ref={formRef.ticker}
                  required
                  className="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                  placeholder="$SUIC"
                />
              </div>
            </div>

            <div>
              <label
                for="desc"
                className="block mb text-sm font-thin text-white"
              >
                Description *
              </label>
              <textarea
                id="desc"
                rows="4"
                ref={formRef.desc}
                required
                className="bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 rounded-lg block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                placeholder="Write your thoughts here..."
              ></textarea>
            </div>

            <div className="">
              <label
                for="total_coin"
                className="block mb text-sm font-thin text-white"
              >
                Total Coins (Fixed) *
              </label>
              <input
                type="text"
                id="total_coin"
                ref={formRef.total_coin}
                className="bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 rounded-lg block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                placeholder="300k"
                value={300000}
                required
                disabled
              />
            </div>
          </div>

          {/* Section 2 */}
          <div className="w-full p-4 flex flex-col gap-3 rounded-xl bg-linear-300 from-[rgba(129,33,224,0.5)] to-[rgb(250,210,210,0.1)]">
            <div className="w-full flex flex-row justify-between items-center">
              <p>Socials</p>
              <button
                className="cursor-pointer p-2"
                onClick={toggleOpenSocials}
              >
                {open ? <IoIosArrowDown /> : <IoIosArrowUp />}
              </button>
            </div>
            {open && (
              <>
                <div className="">
                  <label
                    for="twitter"
                    className="block mb text-sm font-thin text-white"
                  >
                    X/Twitter
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                      x.com/
                    </span>
                    <input
                      type="text"
                      id="twitter"
                      ref={formRef.twitter}
                      className="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                      placeholder="$SUIC"
                    />
                  </div>
                </div>

                <div className="">
                  <label
                    for="telegram"
                    className="block mb text-sm font-thin text-white"
                  >
                    Telegram
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                      t.me/
                    </span>
                    <input
                      type="text"
                      id="telegram"
                      className="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                      placeholder="$SUIC"
                      ref={formRef.telegram}
                    />
                  </div>
                </div>

                <div className="">
                  <label
                    for="discord"
                    className="block mb text-sm font-thin text-white"
                  >
                    Discord
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-white border rounded-e-0 rounded-s-md border-white">
                      discord.gg/
                    </span>
                    <input
                      type="text"
                      id="discord"
                      ref={formRef.discord}
                      className="rounded-none rounded-e-lg bg-[rgba(255,255,255,0.3)] text-white text-sm px-4 block w-full p-2.5 placeholder-white font-thin focus:border focus:border-[white]"
                      placeholder="$SUIC"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section 3 */}
          <div className="relative w-full md:w-[50%] p-[1px] flex gap-3 bg-black rounded-2xl ">
            <div className="absolute inset-0 bg-gradient-to-b from-[#9033F4] to-[#EC8AEF] hover:bg-transparent rounded-2xl"></div>
            <div className="relative w-full flex flex-col gap-2 py-5 px-4 bg-[black] transition-all duration-900 text-white rounded-2xl">
              <div className="flex flex-row justify-between text-sm">
                <p className="font-thin">Launch cost</p>
                <p className="font-medium">0.1 SUI</p>
              </div>

              <div className="flex flex-row justify-between text-sm">
                <p className="font-thin">Available Balance</p>
                <p className="font-medium">
                  {(Number(BigInt(balance) / BigInt(10 ** 6)) / 1000).toFixed(
                    3
                  )}{" "}
                  SUI
                </p>
              </div>

              <PrimaryButtonInvert
                handleOnClick={handleCreateMemecoin}
                name="Launch Coin"
              />
              {/* <PrimaryButtonInvert
                handleOnClick={createMemecoin}
                name="Launch Coin"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoin;
