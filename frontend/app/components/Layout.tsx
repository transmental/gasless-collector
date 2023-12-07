import React, { ReactNode } from 'react';
import FullScreenMenu from './Menu';


interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <FullScreenMenu />
            <main>{children}</main>
        </>
    );
};

export default Layout;
