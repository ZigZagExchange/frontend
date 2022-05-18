import { useRef, useState } from "react";
import { Link } from "@material-ui/core";
import styled from "styled-components";

import Text from "components/atoms/Text/Text";
import GenericModal from "components/molecules/GenericModal/GenericModal";

import { DiscordIcon } from "components/atoms/Svg";
import { CloseIcon } from '../../../atoms/Svg';
import PlayBtn from "assets/images/play-btn.svg";

const NewBridgeModal = styled.div`
    display: flex;
    position: fixed;
    right: 2rem;
    bottom: 6rem;
    flex-direction: column;
    width: 300px;
    padding: 20px;
    background: ${(p) => p.theme.colors.backgroundLowEmphasis};
    border: 1px solid ${(p) => p.theme.colors.foreground400};
    border-radius: 8px;

    .modal-close {
        position: absolute;
        top: 13px;
        right: 13px;
        cursor: pointer;
    }

    .modal-section {
        margin-bottom: 2rem;        
    }

    .video {
        position: relative;

        video {
            background-color: ${(p) => p.theme.colors.backgroundHighEmphasis};
        }

        img {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
            cursor: pointer;
        }
    }

    a {
        display: inline-block;
        text-align: right;
        cursor: pointer;
    }
`

const NewBridgeModalComponent = () => {
    const { videoRef } = useRef(null);
    const [open, setOpen] = useState(true);

    const playVideo = () => {
        videoRef && videoRef.current.play();
    }

    const onClose = () => {
        setOpen(false);
    }

    return (
        open ?
            < NewBridgeModal >
                <CloseIcon className="modal-close" onClick={onClose} />

                <div className="modal-section">
                    <Text font="primaryHeading4" marginBottom="16px">New to Bridging?</Text>

                    <Text font="primarySmall" lineHeight="17.5px">Use this interface to easily bridge over funds between netoworks.</Text>
                </div>

                <div className="video-part modal-section">
                    <Text font="primaryHeading6" mb={1}>Introduction Video</Text>
                    <div className="video">
                        <video src="1.mp4" style={{ width: "100%" }} ref={videoRef} />
                        <img src={PlayBtn} onClick={playVideo} />
                    </div>
                </div>

                <div className="modal-section">
                    <Text font="primaryHeading6" mb={2}>Have a question?</Text>
                    <Text font="primarySmall" style={{ display: "block" }}>Visit our <a href="/faq">FAQ</a></Text>
                </div>

                <div className="modal-section">
                    <Text font="primaryHeading6" mb={2}>Have a question?</Text>
                    <Text font="primarySmall" style={{ display: "block" }}><DiscordIcon />&nbsp;&nbsp;Join our&nbsp;
                        <a target="_blank" rel="noreferrer" href="https://discord.gg/zigzag">discord</a> for live support.</Text>
                </div>

                <a className="ml-auto">Dismiss and don't show again.</a>
            </NewBridgeModal >
            : ""
    )
}

export default NewBridgeModalComponent;