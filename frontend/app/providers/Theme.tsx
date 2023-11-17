"use client";

import { extendTheme, SystemStyleObject } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

interface StyleProps {
  colorMode: "light" | "dark";
  [key: string]: any;
}

const customTheme = extendTheme({
  colors: {
    custom: {
      button: {
        light: "#1D1D20",
        dark: "#F0F4EF",
      },
      accent: {
        light: "#1D1D20",
        dark: "#F0F4EF",
      },
      background: {
        light: "#F0F4EF",
        dark: "#1D1D20",
      },
    },
  },
  components: {
    Modal: {
      baseStyle: (props: StyleProps): SystemStyleObject => ({
        dialog: {
          backgroundColor: mode(
            "custom.background.light",
            "custom.background.dark"
          )(props),
          color: mode("custom.button.light", "custom.button.dark")(props),
        },
      }),
    },
    Tabs: {
      defaultProps: {
        colorScheme: "custom",
      },
      baseStyle: (props: StyleProps): SystemStyleObject => ({
        color: mode("custom.background.light",
          "custom.background.dark")(props),
        borderColor: mode("custom.accent.light", "custom.accent.dark")(props),
        _selected: {
          backgroundColor: mode(
            "custom.button.light",
            "custom.button.dark"
          )(props),
          color: "white",
        },
        _hover: {
          backgroundColor: mode(
            "custom.accent.light",
            "custom.accent.dark"
          )(props),
        },
      }),
    },
    Button: {
      defaultProps: {
        colorScheme: "custom",
      },
      baseStyle: (props: StyleProps): SystemStyleObject => ({
        backgroundColor: mode(
          "custom.button.light",
          "custom.button.dark",
        )(props),
        color: "black",
        stroke: mode("custom.button.light", "custom.button.dark")(props),
        _hover: {
          backgroundColor: mode(
            "custom.accent.dark",
            "custom.accent.light",
          )(props),
          color: mode("custom.button.light", "custom.button.dark")(props),
        },
      }),
      variants: {
        outline: (props: StyleProps) => ({
          borderColor: mode("custom.button.light", "custom.button.dark")(props),
          color: mode("custom.button.light", "custom.button.dark")(props),
        }),
        ghost: (props: StyleProps): SystemStyleObject => ({
          backgroundColor: "transparent",
          color: mode("custom.button.light", "custom.button.dark")(props),
          _hover: {
            backgroundColor: mode(
              "custom.accent.dark",
              "custom.accent.light",
            )(props),
            color: mode("custom.button.dark", "custom.button.light")(props),
            stroke: mode("custom.button.light", "custom.button.dark")(props),
          },
          _active: {
            backgroundColor: mode(
              "custom.button.dark",
              "custom.button.light",
            )(props),
            color: mode("custom.button.light", "custom.button.dark")(props),
          },
        }),
      },
    },
  },
  styles: {
    global: (props: StyleProps): SystemStyleObject => ({
      body: {
        backgroundColor: mode(
          "custom.background.light",
          "custom.background.dark"
        )(props),
        color: mode(
          "custom.background.dark", "custom.background.light")(props),
      },
    })
  }
});

export default customTheme;
