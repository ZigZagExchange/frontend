import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import React from "react";
import styled from 'styled-components';
import { setUISettings } from "lib/store/features/api/apiSlice";
import { DiscordIcon } from "components/atoms/Svg";
import { CloseIcon } from "components/atoms/Svg";
import PlayBtn from "assets/images/play-btn.svg";

const ModalWrapper = styled.div`
background-color: ${({theme}) => theme.colors.foreground600} 
`

const GuidePopup = () => {
  const { videoRef } = useRef(null);
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();

  const playVideo = () => {
    videoRef && videoRef.current.play();
  };

  const onClose = () => {
    setOpen(false);
  };

  const onDismissPermanently = () => {
    dispatch(setUISettings({ key: "hideGuidePopup", value: true }));
  };

  return (
    open && (
      <ModalWrapper className="max-w-lg p-6 mx-1 border rounded-lg shadow-lg md:mx-0 xl:max-w-sm fixed bottom-5 left-5 dark:border-foreground-400 border-primary-400">
        <div className="relative">
          <CloseIcon
            className="absolute cursor-pointer right-1 hover:opacity-75"
            onClick={onClose}
          />
          <p className="text-2xl font-semibold font-work">New to Bridging?</p>
          <p className="mt-3 text-base ">
            Use this interface to easily bridge over funds between networks.
          </p>
          <p className="text-xl font-semibold mt-7 font-work">
            Introduction Video (soon!)
          </p>
          <div className="relative mt-2 rounded-lg">
            <video
              src="1.mp4"
              style={{ width: "100%" }}
              className="bg-gray-900"
              ref={videoRef}
            />
            <img
              src={PlayBtn}
              onClick={playVideo}
              alt="play video"
              className="absolute left-0 right-0 m-auto top-12"
            />
          </div>
          <p className="text-xl font-semibold mt-7 font-work">
            Have a question?
          </p>
          <p className="max-w-xs text-base">
            Visit our{" "}
            <a
              href="https://info.zigzag.exchange/#faq"
              target="_blank"
              className="text-primary-900 hover:underline"
            >
              FAQ
            </a>
            .
          </p>
          <p className="text-xl font-semibold mt-7 font-work">
            Need live support?
          </p>
          <p className="flex items-center max-w-xs gap-2 text-base">
            <DiscordIcon /> Join our{" "}
            <a
              href="https://discord.com/invite/zigzag"
              target="_blank"
              className="text-primary-900 hover:underline"
              rel="noreferrer"
            >
              Discord
            </a>{" "}
            for live support.
          </p>
          <button
            className="float-right mt-6 text-primary-900 hover:underline"
            onClick={onDismissPermanently}
          >
            Dismiss and don’t show again.
          </button>
        </div>
      </ModalWrapper>
    )
  );
};

export default GuidePopup;
