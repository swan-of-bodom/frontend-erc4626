import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';


function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  return library;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <ToastContainer 
        theme="dark"
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
);
