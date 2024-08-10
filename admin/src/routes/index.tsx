import { lazy, Suspense } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen.tsx';
// import DashboardLayout from '../layouts/dashboard/index.tsx';
import { PATH_AFTER_LOGIN } from '../config.ts';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout.tsx';
import AuthGuard from '../guard/AuthGuard.tsx';

// import ProdcutPage from '../Page/ProdcutPage.tsx';
// components
// import LoadingScreen from '../components/LoadingScreen';
// // config
// import { PATH_AFTER_LOGIN } from '../config';
// // guards
// import GuestGuard from '../guards/GuestGuard';
// import RoledGuard from '../guards/RoleGuard';
// import DashboardLayout from '../layouts/dashboard';
// import DashboardLayout from '../layouts/dashboard/index.tsx';
// import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// layouts
// import MainLayout from '../layouts/main';

// const { addManyResources} = require('../helpers/backend_helper');

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (

    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {

  const allRoutes = [
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            // <GuestGuard>
            <Login />
            // </GuestGuard>
          ),
        },
        {
          path: 'dashboard',
          element: (
            // <GuestGuard>
            <Dashboard />
            // </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <Login /> },
        // { path: 'register-unprotected', element: <Register /> },
        // { path: 'reset-password', element: <ResetPassword /> },
        // { path: 'verify', element: <VerifyCode /> },
      ],
    },

    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        // { path: 'coming-soon', element: <ComingSoon /> },
        // { path: 'maintenance', element: <Maintenance /> },
        // { path: 'pricing', element: <Pricing /> },
        // { path: 'payment', element: <Payment /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },

    // // Dashboard Routes
    {
      path: 'dashboard',
      element: (
        // <RoledGuard>
          // <AuthGuard>
        <DashboardLayout />
          // </AuthGuard>
      // </RoledGuard> 
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'user-analysis', element: <Dashboard /> },
        { path: 'order-analysis', element: <OrderDashboard /> },

      ],
    },
    {
      path: 'pages',
      element: (
        // <RoledGuard>
          <AuthGuard>
        <DashboardLayout />
         </AuthGuard>
      // </RoledGuard> 
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'category', element: <Category /> },
        { path: 'foods', element: <ProdcutPage /> },
        { path: 'orders', element: <OrdersPage /> },
        { path: 'payments', element: <PaymentPage /> },
        { path: 'users', element: <UsersPage /> },
        { path: 'users/:path', element: <UsersPage /> },
        { path: 'feedback', element: <FeedBackPage /> },

      ],
    },

    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { element: <Dashboard />, index: true }, //todo uncomment when ready
        { element: <Navigate to='/auth/login' replace />, index: true },
        // { path: 'about-us', element: <About /> },
        // { path: 'contact-us', element: <Contact /> },
        // { path: 'faqs', element: <Faqs /> },
      ],
    },
    // { path: '*', element: <Navigate to="/404" replace /> },
  ]

  // genarate all router paths
  const resources = [];
  const push = (pathStr: any) => {
    const path = `/${pathStr.replace(/^\/+/g, '')}`
    resources.push({
      name: path,
      alias: path,// `${path.split("/")?.[1] ?? ""}-${path.split("/")?.[2] ?? ""}`,
      type: "ui",
    });
  }
  // eslint-disable-next-line array-callback-return
  allRoutes.map(routeA => {
    // eslint-disable-next-line no-unused-expressions,array-callback-return
    routeA?.children && routeA.children.map(routeB => {
      // eslint-disable-next-line no-unused-expressions,array-callback-return
      !routeB?.children ? routeB?.path && push((`${routeA?.path}/${routeB?.path}`).replace("*", "")) : routeB?.children.map(routeC => {
        const path = `${routeA?.path}/${routeB?.path}/${routeC.path}`;
        // eslint-disable-next-line no-unused-expressions
        routeC.path && push(path);
      })
    })
  })
  // post paths to resources api
  try {
    //  addManyResources(resources).then((result) => result);
  } catch (error) {
    console.error("addManyResources error---", error);
  }

  console.log("resources---", resources)
  return useRoutes(allRoutes);
}

// // IMPORT COMPONENTS

// // Authentication
const Login = Loadable(lazy(() => import('../components/Login.tsx')));
const Dashboard = Loadable(lazy(() => import('../Page/Dashboard.tsx')));
const OrderDashboard = Loadable(lazy(() => import('../Page/OrderDashboard.tsx')));
const Category = Loadable(lazy(() => import('../Page/NewCategory.tsx')));
const ProdcutPage = Loadable(lazy(() => import('../Page/ProdcutPage.tsx')));
const OrdersPage = Loadable(lazy(() => import('../Page/Orders.tsx')));
const PaymentPage = Loadable(lazy(() => import('../Page/PaymentPage.tsx')));
const UsersPage = Loadable(lazy(() => import('../Page/User.tsx')));
const FeedBackPage = Loadable(lazy(() => import('../Page/Feedback.tsx')));
const DashboardLayout = Loadable(lazy(() => import('../layouts/dashboard/index.tsx')));
const Page500 = Loadable(lazy(() => import('../Page/500')));
const NotFound = Loadable(lazy(() => import('../Page/404')));
// const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
// const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));
// // Dashboard
// const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));
// const GeneralEcommerce = Loadable(lazy(() => import('../pages/dashboard/GeneralEcommerce')));
// const GeneralAnalytics = Loadable(lazy(() => import('../pages/dashboard/GeneralAnalytics')));
// const GeneralBanking = Loadable(lazy(() => import('../pages/dashboard/GeneralBanking')));
// const GeneralBooking = Loadable(lazy(() => import('../pages/dashboard/GeneralBooking')));
// const EcommerceShop = Loadable(lazy(() => import('../pages/dashboard/EcommerceShop')));
// const EcommerceProductDetails = Loadable(lazy(() => import('../pages/dashboard/EcommerceProductDetails')));
// const EcommerceProductList = Loadable(lazy(() => import('../pages/dashboard/EcommerceProductList')));
// const EcommerceProductCreate = Loadable(lazy(() => import('../pages/dashboard/EcommerceProductCreate')));
// const EcommerceCheckout = Loadable(lazy(() => import('../pages/dashboard/EcommerceCheckout')));
// const EcommerceInvoice = Loadable(lazy(() => import('../pages/dashboard/EcommerceInvoice')));
// const BlogPosts = Loadable(lazy(() => import('../pages/dashboard/BlogPosts')));
// const BlogPost = Loadable(lazy(() => import('../pages/dashboard/BlogPost')));
// const BlogNewPost = Loadable(lazy(() => import('../pages/dashboard/BlogNewPost')));
// const UserProfile = Loadable(lazy(() => import('../pages/dashboard/UserProfile')));
// const UserCards = Loadable(lazy(() => import('../pages/dashboard/UserCards')));
// const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')));
// const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
// const UserCreate = Loadable(lazy(() => import('../pages/dashboard/UserCreate')));
// const Chat = Loadable(lazy(() => import('../pages/dashboard/Chat')));
// const Mail = Loadable(lazy(() => import('../pages/dashboard/Mail')));
// const Calendar = Loadable(lazy(() => import('../pages/dashboard/Calendar')));
// const Kanban = Loadable(lazy(() => import('../pages/dashboard/Kanban')));
// // Main
// const HomePage = Loadable(lazy(() => import('../pages/Home')));
// const About = Loadable(lazy(() => import('../pages/About')));
// const Contact = Loadable(lazy(() => import('../pages/Contact')));
// const Faqs = Loadable(lazy(() => import('../pages/Faqs')));
// const ComingSoon = Loadable(lazy(() => import('../pages/ComingSoon')));
// const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
// const Pricing = Loadable(lazy(() => import('../pages/Pricing')));
// const Payment = Loadable(lazy(() => import('../pages/Payment')));
// const Page500 = Loadable(lazy(() => import('../pages/Page500')));
// const NotFound = Loadable(lazy(() => import('../pages/Page404')));
