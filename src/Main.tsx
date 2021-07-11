import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import loadable from "@loadable/component";

const Home = loadable(() => import("./pages/Home"));

function MainLayout(props: { children?: React.ReactNode }) {
  const { children } = props;
  return <main>{children}</main>;
}

const Main = () => {
  return (
    <HashRouter>
      <MainLayout>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
        </Switch>
      </MainLayout>
    </HashRouter>
  );
};

export default Main;
