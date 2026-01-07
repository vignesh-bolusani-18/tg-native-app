// import Router from "./routes";
// import { ThemeContext, ThemeProvider } from "./theme/config/ThemeContext";
// import { BrowserRouter } from "react-router-dom";
// import { useContext, useEffect } from "react";
// import NavigationSetup from "./routes/NavigationSetup";
// import { ErrorBoundary } from "react-error-boundary";
// import ErrorPage from "./pages/ErrorPage";
// import { useDispatch } from "react-redux";
// import { refreshSessionToken, signOutUser } from "./redux/actions/authActions";

// function App() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const handleStorageChange = (event) => {
//       // Handle logout event
//       if (event.key === "logout") {
//         if (!sessionStorage.getItem("logout-initiated")) {
//           sessionStorage.setItem("logout-initiated", "true"); // Prevent infinite loop
//           dispatch(signOutUser());
//         }
//         sessionStorage.removeItem("logout-initiated"); // Reset after logout
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, [dispatch]);

//   const { theme } = useContext(ThemeContext);

//   return (
//     <ThemeProvider theme={theme}>
//       <BrowserRouter>
//         <NavigationSetup /> {/* Set up navigation */}
//         <Router />
//       </BrowserRouter>
//       <style jsx global>{`
//         ::-webkit-scrollbar {
//           display: none;
//         }

//         /* Hide scrollbar for IE, Edge, and Firefox */
//         scrollbar-width: none;
//         -ms-overflow-style: none;

//         /* Cross-browser zoom */
//         body {
//           zoom: 0.8; /* Supported in Chrome, Edge, Safari */
//           -moz-transform: scale(0.8); /* Firefox-specific */
//           -moz-transform-origin: top left; /* Firefox-specific */
//           -o-transform: scale(0.8); /* Opera-specific */
//           -o-transform-origin: top left; /* Opera-specific */
//           -webkit-transform: scale(0.8); /* Chrome, Safari */
//           -webkit-transform-origin: top left; /* Chrome, Safari */
//           transform: scale(0.8); /* Standard support for other browsers */
//           transform-origin: top left;
//         }

//         /* Adjust the layout to prevent overflow issues after scaling */
//         html,
//         {/* body {
//           width: 125%;
//           height: 125%;
//         } */}
//       `}</style>
//     </ThemeProvider>
//   );
// }

// export default App;
import Router from "./routes";
import { ThemeContext, ThemeProvider } from "./theme/config/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import { useContext, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import NavigationSetup from "./routes/NavigationSetup";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "./pages/ErrorPage";
import { useDispatch } from "react-redux";
import { refreshSessionToken, signOutUser } from "./redux/actions/authActions";
import { resetStore } from "./redux/store"; // Import resetStore function

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    
    const handleStorageChange = (event) => {
      // Handle logout event
      if (event.key === "logout") {
        if (!sessionStorage.getItem("logout-initiated")) {
          sessionStorage.setItem("logout-initiated", "true");
          dispatch(signOutUser());
          resetStore();
        }
        sessionStorage.removeItem("logout-initiated");
      }
  
      // Handle registration event
      if (event.key === "registration") {
        if (!sessionStorage.getItem("registration-initiated")) {
          sessionStorage.setItem("registration-initiated", "true");
          dispatch(signOutUser("registration"));
          resetStore();
        }
        sessionStorage.removeItem("registration-initiated");
      }
    };
  
    window.addEventListener("storage", handleStorageChange);
  
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);
  

  const { theme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme}>
     <ToastContainer />
      <BrowserRouter>
        <NavigationSetup /> {/* Set up navigation */}
        <Router />
      </BrowserRouter>
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge, and Firefox */
        scrollbar-width: none;
        -ms-overflow-style: none;
      `}</style>
    </ThemeProvider>
  );
}

export default App;
