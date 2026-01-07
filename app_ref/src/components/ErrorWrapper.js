import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "../pages/ErrorPage";
import { useLocation } from "react-router-dom";

const ErrorWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <ErrorBoundary FallbackComponent={ErrorPage} key={location.pathname}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorWrapper;
