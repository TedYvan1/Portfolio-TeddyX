import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Route, Switch, useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();
  return <AnimatePresence mode="wait" initial={false}><motion.div key={location} className="page-transition" initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }} transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}><Switch>
    <Route path="/" component={Home} />
    <Route path="/projects" component={Projects} />
    <Route path="/projects/:slug" component={ProjectDetail} />
    <Route path="/admin" component={Admin} />
    <Route path="/admin/login" component={Login} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></motion.div></AnimatePresence>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><TooltipProvider><Toaster position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
