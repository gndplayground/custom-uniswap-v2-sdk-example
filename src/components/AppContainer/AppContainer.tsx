import React from "react";
import { Container, ContainerProps } from "@chakra-ui/layout";

export type AppContainerProps = ContainerProps;

const AppContainer = React.forwardRef<any, AppContainerProps>((props, ref) => {
  return (
    <Container
      maxW="1440px"
      pl={{ base: "16px", sm: "50px", md: "50px", lg: "60px" }}
      pr={{ base: "16px", sm: "50px", md: "50px", lg: "60px" }}
      {...props}
      ref={ref}
    />
  );
});

AppContainer.displayName = "AppContainer";

export default AppContainer;

export { AppContainer };
