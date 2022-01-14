import { Header } from "components";

export const DefaultTemplate = ({ children }) => {
  return (
    <>
      <Header />
      <div className="template_wrapper">{children}</div>
    </>
  );
};
