import React, { useState, createContext, useContext } from 'react';

interface MenuContextProps {
    menuOpen: boolean;
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


interface MenuProviderProps {
    children: React.ReactNode;
}

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export const MenuProvider: React.FunctionComponent<MenuProviderProps> = ({ children }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenuContext = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenuContext must be used within a MenuProvider');
    }
    return context;
};
