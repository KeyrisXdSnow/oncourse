import * as React from "react";
import Loadable from "@react-loadable/revised";
import Loading from "../../common/components/layout/Loading";

const LoadableComponent = Loadable({
  loader: () => import(/* webpackChunkName: "login" */ "./LoginPage"),
  loading: Loading
});

export default class LoadableLogin extends React.Component {
  render() {
    return <LoadableComponent {...this.props} />;
  }
}
