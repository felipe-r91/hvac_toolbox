import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";
//import { registerSW } from "virtual:pwa-register";

/*registerSW({
  onNeedRefresh() {
    console.log("New content available, please refresh.");
    console.log("App ready to work offline");
  },
});*/

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);