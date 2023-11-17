import { Button, Icon, useColorMode } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ColorSwitcher = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <Button
            variant="outline"
            aria-label="Toggle color mode"
            onClick={toggleColorMode}
        >
            <Icon as={colorMode === 'light' ? FaMoon : FaSun} />
        </Button>
    );
};

export default ColorSwitcher;