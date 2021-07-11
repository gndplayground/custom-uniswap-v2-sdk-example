import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: "#f1f1f2",
        fontFamily: `Helvetica Neue, Arial, sans-serif`,
        bg: "#131a35",
        "& .chakra-alert__desc": {
          color: "#1A202C",
        },
      },
    },
  },
  colors: {
    primary: "#61D9FA",
    accent: "#0D285A",
    error: "#f04f00",
  },
  zIndices: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
});

export { theme };
