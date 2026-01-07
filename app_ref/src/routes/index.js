import React, { Suspense, lazy } from "react";
import { Navigate, useLocation, useRoutes, useParams } from "react-router-dom";

// layouts
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import SSOLayout from "../layout/SSOLayout"; // New layout for SSO (Tenant selection flow)
import ViewExperimentLayout from "../layout/ViewExperimentLayout";
import ViewExperimentLayoutNew from "../layout/ViewExperimentLayoutNew";
import ViewDashboardLayout from "../layout/ViewDashboardLayout";
import ViewDashboardLayoutNew from "../layout/ViewDashboardLayoutNew";
import useAuth from "../hooks/useAuth";

// config
import LoadingScreen from "../components/LoadingScreen";
import ScenarioPlanningLayout from "../layout/ScenarioPlanningLayout";
import InvitationAcceptancePage from "../pages/auth/acceptOrDenyInvitation";
import UserGuide from "../pages/docs/UserGuide";
import ImpactAnalysisLayout from "../layout/ImpactAnalysisLayout";
import Solutions from "../pages/main/Solutions/Solutions";
import Workflows from "../pages/main/Workflows/Workflows";
import AgenticArenaLayout from "../layout/AgenticArenaLayout";
import { oldFlowModules } from "../utils/oldFlowModules";
import GuideEditor from "../pages/main/RichTextEditor/RichTextEditor";
import PromoPlanning from "../pages/main/ScenarioPlanningFlow/ViewDashboardPage/PromoPlanning";
import { useVibe } from "../hooks/useVibe";

import { whiteListedCompanies } from "../utils/whiteListedCompanies";
import MutualNDAPage from "../pages/main/MutualNDAPage";
import MeetingNotes from "../pages/main/MeetingNote/MeetingNotes";
import MeetingNoteDisplay from "../components/MeetingNoteDisplay";
const Loadable = (Component) => (props) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

// Pages
const HomePage = Loadable(lazy(() => import("../pages/main/HomePage")));
const ExperimentsPage = Loadable(
  lazy(() => import("../pages/main/ExperimentFlow/ExperimentsPage"))
);
const AdminPage = Loadable(
  lazy(() => import("../pages/main/AdminPanel/AdminPanel"))
);
const DataSetsPage = Loadable(
  lazy(() => import("../pages/main/DatasetFlow/ViewDataset"))
);
const DashboardPage = Loadable(
  lazy(() => import("../pages/main/DashboardFlow/DashboardPage"))
);
const Page404 = Loadable(lazy(() => import("../pages/Page404")));
const LoginPage = Loadable(lazy(() => import("../pages/auth/LoginPage")));
const RegisterPage = Loadable(lazy(() => import("../pages/auth/RegisterPage")));
const SignUpPage = Loadable(lazy(() => import("../pages/auth/SignUpPage")));
const TenantPage = Loadable(lazy(() => import("../pages/auth/listCompany")));
const ListCompanySecond = Loadable(
  lazy(() => import("../pages/auth/listCompany2"))
);
const GoogleCallback = Loadable(
  lazy(() => import("../pages/auth/callback/google"))
);
const IdentityGatewayCallback = Loadable(
  lazy(() => import("../pages/auth/callback/identity-gateway"))
);
const GoogleOAuthCallback = Loadable(
  lazy(() => import("../pages/auth/callback/google-oauth"))
);
const RootCallback = Loadable(
  lazy(() => import("../pages/auth/callback/root-callback"))
);
// Experiment Run Pages
const ExperimentRunDetails = Loadable(
  lazy(() =>
    import("../pages/main/ExperimentFlow/ViewExperimentPage/ExpRunDetails")
  )
);
const ExperimentRunDetailsNew = Loadable(
  lazy(() =>
    import("../pages/main/ExperimentFlow/ViewExperimentPageNew/ExpRunDetails")
  )
);
const ExperimentRunLogs = Loadable(
  lazy(() =>
    import("../pages/main/ExperimentFlow/ViewExperimentPage/ExpRunLogs")
  )
);
const ExperimentRunLogsNew = Loadable(
  lazy(() =>
    import("../pages/main/ExperimentFlow/ViewExperimentPageNew/ExpRunLogs")
  )
);
const ExperimentModelMetrics = Loadable(
  lazy(() =>
    import("../pages/main/ExperimentFlow/ViewExperimentPage/ModelMetric")
  )
);
const ExperimentUserModel = Loadable(
  lazy(() =>
    import("../pages/main/ExperimentFlow/ViewExperimentPage/UserModel")
  )
);
const CreateExperimentPage = Loadable(
  lazy(() => import("../pages/main/ExperimentFlow/CreateExperimentPage/index"))
);

const CreateConfigurableExperimentPage = Loadable(
  lazy(() =>
    import(
      "../pages/main/ExperimentFlow/CreateConfigurableExperimentPage/index"
    )
  )
);

// Dashboard Pages
const DashFocusView = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/FocusView/ExecutiveView"
    )
  )
);
const DashForecastSummary = Loadable(
  lazy(() =>
    import("../pages/main/DashboardFlow/ViewDashboardPage/DemandForecasting")
  )
);
const DashSalesView = Loadable(
  lazy(() =>
    import("../pages/main/DashboardFlow/ViewDashboardPage/MetricDeepDive")
  )
);
const DashInventoryPlanning = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/InventoryOptimization"
    )
  )
);
const DashScenarioPlanning = Loadable(
  lazy(() =>
    import("../pages/main/DashboardFlow/ViewDashboardPage/ScenarioPlanning")
  )
);
const NewScenarioPlanning = Loadable(
  lazy(() =>
    import(
      "../pages/main/ScenarioPlanningFlow/ViewDashboardPage/ScenarioPlanning"
    )
  )
);
const ForecastEnrichmentAgent = Loadable(
  lazy(() =>
    import(
      "../pages/main/AgenticArenaFlow/ViewAgentsPage/ForecastEnrichmentAgent"
    )
  )
);
const DataCleaningAgent = Loadable(
  lazy(() =>
    import("../pages/main/AgenticArenaFlow/ViewAgentsPage/DataCleaningAgent")
  )
);
const DashPriceOptimization = Loadable(
  lazy(() =>
    import("../pages/main/DashboardFlow/ViewDashboardPage/PriceOptimization")
  )
);
const DashAssortmentOptimization = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/AssortmentOptimization"
    )
  )
);
const ReportsAndAnalysis = Loadable(
  lazy(() =>
    import("../pages/main/DashboardFlow/ViewDashboardPage/ReportsAndAnalysis")
  )
);

const PropensityScore = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/NextBestAction/PropensityScoreScreen"
    )
  )
);
const PropensityModelMetrics = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/NextBestAction/PropensityModelMetricsScreen"
    )
  )
);
const RecommendedActions = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/NextBestAction/RecommendedActionsScreen"
    )
  )
);
const CustomerProfile = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/NextBestAction/CustomerProfileScreen"
    )
  )
);

const PlanningWorkbench = Loadable(
  lazy(() =>
    import(
      "../pages/main/ScenarioPlanningFlow/ViewDashboardPage/DemandForecasting"
    )
  )
);
const SnOPPlanningScreen = Loadable(
  lazy(() =>
    import(
      "../pages/main/ScenarioPlanningFlow/ViewDashboardPage/SnOPPlanningScreen"
    )
  )
);
const ProductionPlanningScreen = Loadable(
  lazy(() =>
    import(
      "../pages/main/ScenarioPlanningFlow/ViewDashboardPage/ProductionPlanningScreen"
    )
  )
);

const VibeGradientScreen = Loadable(
  lazy(() => import("../features/vibeGradient/VibeGradientPage"))
);

const WorkflowsPage = Loadable(
  lazy(() => import("../pages/main/Workflows/Workflows"))
);
const ScenarioPlanning = Loadable(
  lazy(() => import("../pages/main/ScenarioPlanningFlow/ScenarioPlanningPage"))
);
const AgenticArenaPage = Loadable(
  lazy(() => import("../pages/main/AgenticArenaFlow/AgenticArenaPage"))
);

const ImpactAnalysisPage = Loadable(
  lazy(() => import("../pages/main/ImpactAnalysisFlow/ImpactAnalysisPage"))
);
const MetricsAnalysis = Loadable(
  lazy(() => import("../pages/main/ImpactAnalysisFlow/MetricsAnalysis"))
);
const AccuracyAnalysis = Loadable(
  lazy(() => import("../pages/main/ImpactAnalysisFlow/MetricsAnalysis"))
);

const RegressionPredictions = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/AutoMLDashboards/Regression/PredictionsScreen"
    )
  )
);
const RegressionModelMetrics = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/AutoMLDashboards/Regression/ModelMetricsScreen"
    )
  )
);
const BinaryClassificationPredictions = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/AutoMLDashboards/BinaryClassification/PredictionsScreen"
    )
  )
);
const BinaryClassificationModelMetrics = Loadable(
  lazy(() =>
    import(
      "../pages/main/DashboardFlow/ViewDashboardPage/AutoMLDashboards/BinaryClassification/ModelMetricsScreen"
    )
  )
);

// Utility function to conditionally render elements based on custom condition
const getConditionalElement = (defaultElement, finalElement, condition) => {
  function ConditionalWrapper() {
    const params = useParams();
    const { moduleName } = params;

    // Evaluate the condition function with current params
    const shouldUseFinalElement = condition({ moduleName, ...params });

    // Return the appropriate element directly
    return shouldUseFinalElement ? finalElement : defaultElement;
  }

  return <ConditionalWrapper />;
};
function DashboardDefaultRedirect() {
  const getDashboardDefaultElement = (moduleName) => {
    switch (moduleName) {
      case "next_best_action":
        return "propensity-score";
      case "next_best_offer":
        return "propensity-score";
      case "binary_classification":
        return "binary-classification-predictions";
      case "regression":
        return "regression-predictions";
      default:
        return "executive-view";
    }
  };
  const { moduleName } = useParams();
  console.log("moduleName " + moduleName);
  console.log(
    "getDashboardDefaultElement(moduleName) " +
      getDashboardDefaultElement(moduleName)
  );
  return <Navigate to={getDashboardDefaultElement(moduleName)} replace />;
}

export default function Router() {
  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentLastParam = location.pathname.split("/")[paramsLength - 1];

  const currentPage = location.pathname.split("/").filter(Boolean)[1];
  const { userInfo, isAuthenticated, currentCompany, isSsoDone } = useAuth();

  console.log("isAuthenticated " + isAuthenticated);
  const currentCompanyId = currentCompany?.companyID;
  const hasCompanySelected = currentCompanyId && currentCompany?.companyName;

  const isWhiteListedCompany = currentCompanyId
    ? whiteListedCompanies.includes(currentCompanyId)
    : false;
  console.log("isWhiteListedCompany " + isWhiteListedCompany);
  console.log("hasCompanySelected " + hasCompanySelected);

  // Debug root route access
  if (location.pathname === "/") {
    console.log("🔵 Router: Root path accessed", {
      pathname: location.pathname,
      hash: window.location.hash,
      hasAccessToken: window.location.hash.includes("access_token="),
      isAuthenticated,
      hasCompanySelected,
    });
  }
  // Determine basePath based on authentication and company selection
  const basePath = hasCompanySelected ? `/${currentCompany.companyName}` : "";
  const getDashboardDefaultElement = (moduleName) => {
    switch (moduleName) {
      case "next_best_action":
        return "propensity-score";
      default:
        return "executive-view";
    }
  };
  return useRoutes([
    // Redirect root to the appropriate phase based on authentication and login state

    {
      path: "/mutual-nda",
      element: <MutualNDAPage />,
    },
    {
      path: "/auth/invitation/:token",
      element: <InvitationAcceptancePage />,
    },
    // Dedicated OAuth callback route - no authentication guards
    {
      path: "/auth/callback/oauth",
      element: <RootCallback />,
    },
    {
      path: "/",
      element:
        isAuthenticated && hasCompanySelected ? (
          <Navigate
            to={`${basePath}/${isWhiteListedCompany ? "scenario" : "agent/*"}`}
            replace
          />
        ) : (
          <Navigate to="/auth/login" replace />
        ),
    },

    // Main app routes when user is authenticated and has company selected
    {
      path: `${basePath}`,
      element:
        isAuthenticated && hasCompanySelected ? (
          <DashboardLayout currentPage={currentPage} />
        ) : (
          <Navigate to="/auth/login" replace />
        ),
      children: [
        {
          element: (
            <Navigate
              to={`${basePath}/${
                isWhiteListedCompany ? "scenario" : "agent/*"
              }`}
              replace
            />
          ),
          index: true,
        },

        { path: "experiments", element: <ExperimentsPage /> },
        { path: "dashboard", element: <DashboardPage /> },
        { path: "scenario", element: <ScenarioPlanning /> },
        { path: "impact-analysis", element: <ImpactAnalysisPage /> },
        { path: "solutions", element: <Solutions /> },
        { path: "workflows", element: <WorkflowsPage /> },
        { path: "optimizations", element: <AgenticArenaPage /> },
        { path: "agent/*", element: <VibeGradientScreen /> },

        { path: "admin", element: <AdminPage /> },
        { path: "user-guide", element: <UserGuide /> },
        { path: "user-guide/*", element: <UserGuide /> },
        { path: "guide-editor", element: <GuideEditor /> },
        {path:"meeting-notes", element: <MeetingNotes />},
        {path:"meeting-notes/meeting-note-display/:id/:title", element: <MeetingNoteDisplay />},
        {
          path: "experiments/create/:moduleName",
          element: <CreateExperimentPage />,
        },

        {
          path: "experiments/create-experiment/:moduleName",
          element: <CreateConfigurableExperimentPage />,
        },
        {
          path: "experiments/view/:moduleName/:experiment_id",
          element: getConditionalElement(
            <ViewExperimentLayout currentPage={currentLastParam} />,
            <ViewExperimentLayoutNew currentPage={currentLastParam} />,
            ({ moduleName }) => !oldFlowModules.includes(moduleName)
          ),
          children: [
            { element: <Navigate to="details" replace />, index: true },
            {
              path: "details",
              element: getConditionalElement(
                <ExperimentRunDetails />,
                <ExperimentRunDetailsNew />,
                ({ moduleName }) => !oldFlowModules.includes(moduleName)
              ),
            },
            {
              path: "logs",
              element: getConditionalElement(
                <ExperimentRunLogs />,
                <ExperimentRunLogsNew />,
                ({ moduleName }) => !oldFlowModules.includes(moduleName)
              ),
            },
            { path: "metrics", element: <ExperimentModelMetrics /> },
            { path: "use_model", element: <ExperimentUserModel /> },
          ],
        },
        {
          path: "dashboard/view/:moduleName/:experiment_id",
          element: getConditionalElement(
            <ViewDashboardLayout currentPage={currentLastParam} />,
            <ViewDashboardLayoutNew currentPage={currentLastParam} />,
            ({ moduleName }) => !oldFlowModules.includes(moduleName)
          ),
          children: [
            { element: <DashboardDefaultRedirect />, index: true },
            { path: "executive-view", element: <DashFocusView /> },
            { path: "demand-forecasting", element: <DashForecastSummary /> },
            { path: "metrics-deep-dive", element: <DashSalesView /> },
            {
              path: "inventory-optimization",
              element: <DashInventoryPlanning />,
            },
            { path: "price-optimization", element: <DashPriceOptimization /> },
            { path: "scenario-planning", element: <DashScenarioPlanning /> },
            {
              path: "assortment-optimization",
              element: <DashAssortmentOptimization />,
            },
            { path: "reports-and-analysis", element: <ReportsAndAnalysis /> },
            {
              path: "propensity-score",
              element: <PropensityScore />,
            },
            {
              path: "propensity-model-metrics",
              element: <PropensityModelMetrics />,
            },
            {
              path: "recommended-actions",
              element: <RecommendedActions />,
            },
            {
              path: "customer-profile",
              element: <CustomerProfile />,
            },
            {
              path: "regression-predictions",
              element: <RegressionPredictions />,
            },
            {
              path: "regression-model-metrics",
              element: <RegressionModelMetrics />,
            },
            {
              path: "binary-classification-predictions",
              element: <BinaryClassificationPredictions />,
            },
            {
              path: "binary-classification-model-metrics",
              element: <BinaryClassificationModelMetrics />,
            },
          ],
        },
        {
          path: "scenario/view/:moduleName/:experiment_id",
          element: <ScenarioPlanningLayout currentPage={currentLastParam} />,
          children: [
            {
              element: <Navigate to="SnOP-report" replace />,
              index: true,
            },
            { path: "planning-workbench", element: <PlanningWorkbench /> },
            { path: "SnOP-report", element: <SnOPPlanningScreen /> },
            {
              path: "production-planning",
              element: <ProductionPlanningScreen />,
            },
            {
              path: "promo-planning",
              element: <PromoPlanning />,
            },
            { path: "scenario-planning", element: <NewScenarioPlanning /> },
          ],
        },
        {
          path: "optimizations/view/:moduleName/:experiment_id",
          element: <AgenticArenaLayout currentPage={currentLastParam} />,
          children: [
            {
              element: <Navigate to="forecast-enrichment-agent" replace />,
              index: true,
            },
            {
              path: "forecast-enrichment-agent",
              element: <ForecastEnrichmentAgent />,
            },

            { path: "data-cleaning-agent", element: <DataCleaningAgent /> },
          ],
        },
        {
          path: "impact-analysis/view/:impactPipeline_id",
          element: <ImpactAnalysisLayout currentPage={currentLastParam} />,
          children: [
            {
              element: <Navigate to="metrics-analysis" replace />,
              index: true,
            },
            { path: "metrics-analysis", element: <MetricsAnalysis /> },
            { path: "accuracy-analysis", element: <AccuracyAnalysis /> },
          ],
        },

        {
          path: "datasets",
          element: <DataSetsPage currentPage={currentLastParam} />,
        },

        {
          path: "*",
          element:
            isAuthenticated && hasCompanySelected ? (
              <Navigate
                to={`${basePath}/${
                  isWhiteListedCompany ? "scenario" : "agent/*"
                }`}
                replace
              />
            ) : (
              <Navigate to="/auth/login" replace />
            ),
        },
      ],
    },

    // OTP Authentication and Login routes (Phase 1)
    {
      path: "/auth",
      element: !isAuthenticated ? (
        <AuthLayout />
      ) : (
        <Navigate
          to={
            hasCompanySelected
              ? `${basePath}/${isWhiteListedCompany ? "scenario" : "agent/*"}`
              : "/sso/listCompany"
          }
          replace
        />
      ),
      children: [
        { path: "login", element: <SignUpPage /> },
        { path: "signup", element: <SignUpPage /> },
        { path: "invitation/:token", element: <InvitationAcceptancePage /> },
        { path: "callback/google", element: <GoogleCallback /> },
        {
          path: "callback/identity-gateway",
          element: <IdentityGatewayCallback />,
        },
        { path: "callback/google-oauth", element: <GoogleOAuthCallback /> },
        { path: "*", element: <Navigate to="/auth/login" replace /> },
      ],
    },

    // SSO/Tenant Selection routes (Phase 2) - Only accessible when authenticated but no company selected
    {
      path: "/sso",
      element:
        isAuthenticated && !hasCompanySelected ? (
          <SSOLayout />
        ) : isAuthenticated && hasCompanySelected ? (
          // If authenticated with company, redirect to company path (user should use Switch Company button to access this)
          <Navigate
            to={`${basePath}/${isWhiteListedCompany ? "scenario" : "agent/*"}`}
            replace
          />
        ) : (
          <Navigate to="/auth/login" replace />
        ),
      children: [
        { path: "listCompany", element: <ListCompanySecond /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },

    // Catch-all route for 404 handling
    {
      path: "*",
      element:
        isAuthenticated && hasCompanySelected ? (
          <Navigate to={`${basePath}/404`} replace />
        ) : (
          <Navigate to="/auth/login" replace />
        ),
    },
  ]);
}
