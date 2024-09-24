import React from "react";
import { Navbar, Alignment, Button } from "@blueprintjs/core";

interface NavBarProps {
  darkTheme: boolean;
  handleThemeToggle: () => void;
}

const NavBar: React.FC<NavBarProps> = (_props: NavBarProps) => {
  return (
    <Navbar fixedToTop={true}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Dog Viewer</Navbar.Heading>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <Button
          minimal
          icon={_props.darkTheme ? "flash" : "moon"}
          onClick={_props.handleThemeToggle}
          text="Toggle Theme"
        />
      </Navbar.Group>
    </Navbar>
  );
};

export default NavBar;
