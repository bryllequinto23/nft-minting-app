import styled from "styled-components";

export const Screen2 = styled.div``;

// Used for providing space between components
export const SpacerSmall = styled.div`
  height: 10px;
  width: 16px;
`;

// Used for providing a wrapper around a component
export const Container = styled.div`
  display: flex;
  flex: ${({ flex }) => (flex ? flex : 0)};
  flex-direction: ${({ fd }) => (fd ? fd : "column")};
  justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
  align-items: ${({ ai }) => (ai ? ai : "flex-start")};
  background-color: ${({ test }) => (test ? "pink" : "none")};
  width: 100%;
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: center;
`;

export const Container3 = styled.div
  `
    display: flex;
    flex: ${({ flex }) => (flex ? flex : 0)};
    flex-direction: ${({ fd }) => (fd ? fd : "column")};
    justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
    align-items: ${({ ai }) => (ai ? ai : "flex-start")};
    background-color: ${({ test }) => (test ? "pink" : "none")};
    background-image: ${({ image }) => (image ? `url(${image})` : "none")};
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;

    @media (max-width: 767px) {
      height: 500px;
      width: 100%;
    }
  `

export const TextTitle = styled.p`
  font-size: 45px;
  font-weight: bold;
  line-height: 1.6;
  textAlign: center;
  color: "#fff3e3";
`;

export const TextDescription = styled.p`
  color: var(--primary-text);
  font-size: 18px;
  line-height: 1.6;
`;

export const TextDescription2 = styled.p`
  color: #fff3e3;
  font-size: 18px;
  line-height: 1.6;
  cursor: pointer;
`;

export const TextDescription3 = styled.p`
  color: #fff3e3;
  font-size: 18px;
  line-height: 1.6;
  cursor: pointer;

  :hover {
    opacity: 0.5;
  }
`;
