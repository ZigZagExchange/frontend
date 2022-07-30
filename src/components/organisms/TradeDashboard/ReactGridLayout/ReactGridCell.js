import MenuIcon from "@mui/icons-material/Menu";
import styled from "styled-components";

const GridCellWrapper = styled.div`
  position: relative;
  height: 100%;

  > * {
    height: 100%;
  }
`;

const GridDragHandler = styled(MenuIcon)`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px !important;
  height: 20px !important;

  &:hover {
    cursor: move;
  }
`;

export default function ReactGridCell({ children, editable }) {
  return (
    <GridCellWrapper>
      {children}

      {editable ? <GridDragHandler className="grid-item__title" /> : ""}
    </GridCellWrapper>
  );
}
