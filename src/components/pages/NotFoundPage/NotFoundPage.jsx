import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "components/molecules/Button";
const NotFoundPage = () => {
  const history = useHistory();
  const onButtonClick = () => {
    history.push(`/`);
  };
  return (
    <div className="flex items-center ml-10 mr-10 md:ml-24 lg:ml-36 xl:ml-72 min-h-[100vh]">
      <div>
        <p className="text-xl font-work">404</p>
        <p className="text-4xl font-semibold mt-9 font-work">
          Oops, that page doesn't exist
        </p>
        <p className="text-base font-normal mt-9 font-work">
          It‘s not you, it‘s us. It looks like the page doesn‘t exist. <br />
          Let‘s take you back.
        </p>
        <Button
          className="!py-5 mt-5 uppercase !font-semibold !font-work"
          onClick={onButtonClick}
        >
          Back to app
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
