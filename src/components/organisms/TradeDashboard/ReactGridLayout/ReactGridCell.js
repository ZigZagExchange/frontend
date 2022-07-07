import MenuIcon from "@mui/icons-material/Menu";
import styled from "styled-components";

const GridCellWrapper = styled.div`
  position: relative;
  height: 100%;
`;

const GridDragHandler = styled(MenuIcon)`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 16px !important;
  height: 16px !important;
`;

export default function ReactGridCell({ children, editable }) {
  return (
    <GridCellWrapper>
      {children}

      {editable ? <GridDragHandler className="grid-item__title" /> : ""}
    </GridCellWrapper>
  );
}
