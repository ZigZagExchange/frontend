import Text from "components/atoms/Text/Text";
import styled from "styled-components";

const NewBridgeModal = styled.div`
    .modal-section {
        margin-bottom: 2rem;        
    }
`

const NewBridgeModalComponent = () => {
    return (
        <NewBridgeModal>
            <div className="modal-section">
                <Text font="primaryHeading4">New to Bridging?</Text>

                <Text font="primarySmall">Use this interface to easily bridge over funds between netoworks.</Text>
            </div>

            <div className="video-part modal-section">
                <Text font="primaryHeading6">Introduction Video</Text>
            </div>

            <div className="modal-section">
                <Text font="primaryHeading6">Have a question?</Text>
                <Text font="primarySmall">Visit our <span>FQA</span></Text>
            </div>

            <div className="modal-section">
                <Text font="primaryHeading6">Have a question?</Text>
                <Text font="primarySmall">Join our <span>discord</span> for live support.</Text>
            </div>

            <button>Dismiss and don't show again.</button>
        </NewBridgeModal>
    )
}

export default NewBridgeModalComponent;