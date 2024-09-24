import React from "react";
import { useRecoilState } from "recoil";
import { themeState } from "./recoil/atoms";

import NavBar from "./components/NavBar";
import Sidebar from "./components/sidebar/Sidebar";
import PhotoGallery from "./components/PhotoGallery";

import "./App.css";

const App: React.FC = () => {
  const [darkTheme, setDarkTheme] = useRecoilState<boolean>(themeState);

  const handleThemeToggle = () => {
    setDarkTheme(!darkTheme);
  };

  return (
    <div className={`App ${darkTheme ? "bp5-dark" : ""}`} style={{ display: "flex" }}>
      <NavBar darkTheme={darkTheme} handleThemeToggle={handleThemeToggle} />
      <Sidebar />
      <PhotoGallery />
    </div>
  );
};

export default App;
