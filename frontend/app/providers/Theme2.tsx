"use client";

import { extendTheme, SystemStyleObject } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

interface StyleProps {
  colorMode: "dark" | "light";
  [key: string]: any;
}

const customTheme2 = extendTheme({
  colors: {
    custom: {
      button: {
        light: "#CBAFA2",
        dark: "#CE7365",
      },
      accent: {
        light: "#E8E5D1",
        dark: "#D3DAC2",
      },
      background: {
        light: "#BFC9AE",
        dark: "#2E3C44",
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
        // Add styles for the Tab here
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
    ModalOverlay: {
      baseStyle: (props: StyleProps): SystemStyleObject => ({
        backgroundColor: mode("rgba(0, 0, 0, 0.4)", "rgba(255, 255, 255, 0.4)")(
          props
        ),
      }),
    },
    Button: {
      defaultProps: {
        colorScheme: "custom",
      },
      baseStyle: (props: StyleProps): SystemStyleObject => ({
        backgroundColor: mode(
          "custom.button.light",
          "custom.button.dark"
        )(props),
        color: "white",
        _hover: {
          backgroundColor: mode(
            "custom.accent.light",
            "custom.accent.dark"
          )(props),
        },
      }),
      variants: {
        outline: (props: StyleProps) => ({
          borderColor: mode("custom.button.light", "custom.button.dark")(props),
          color: mode("custom.button.light", "custom.button.dark")(props),
        }),
        ghost: (props: StyleProps): SystemStyleObject => ({
          backgroundColor: "transparent", // No background
          color: mode("custom.button.light", "custom.button.dark")(props),
          _hover: {
            backgroundColor: mode(
              "custom.accent.light",
              "custom.accent.dark"
            )(props),
            color: mode("custom.button.light", "custom.button.dark")(props),
          },
          _active: {
            backgroundColor: mode(
              "custom.button.light",
              "custom.button.dark"
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
        color: mode("black", "white")(props),
      },
    }),
  },
});

export default customTheme2;
