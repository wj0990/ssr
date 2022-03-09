import React from 'react';
import {
  Routes,
  Route,
  matchPath, useLocation,
  useParams, useNavigate,
  Location,
  NavigateFunction,
  RouteObject,
  Params,
  useRoutes,
  createRoutesFromChildren,
  Navigate
} from 'react-router-dom';
import { loadInitialProps } from './loadInitialProps';
import { RematchStore, Models } from "@rematch/core"
import { RouteNewObject } from './interface'
// import { history as newHistory } from "./utils"

export interface ControllerProps {
  data: unknown;
  routes: RouteNewObject[];
  params: Readonly<Params<string>>;
  navigate: NavigateFunction;
  location: Location;
  store?: RematchStore<Models<any>, any>
  history?: any
}

const ChildRoutes = (props: ControllerProps) => {
  const deepRoutes = (routes: RouteNewObject[]) => {
    return routes.map((route, ind) => {
      const routeItem = { ...route }
      if (Array.isArray(routeItem.children) && routeItem.children.length) {
        routeItem.children = deepRoutes(routeItem.children) as RouteNewObject[]
      }
      if (routeItem.element) {
        if (React.isValidElement(routeItem.element)) {
          routeItem.element = React.cloneElement(routeItem.element, { ...props })
        }
        // routeItem.element = <>{`${routeItem.path || "首页"}`}</>
      }
      if (routeItem.index) {
        routeItem.element = <Navigate to={routeItem.path} />
      }
      return <Route key={ind}  {...routeItem} />
    })
  }
  const dom2 = useRoutes(createRoutesFromChildren(deepRoutes(props.routes)))
  return <React.Fragment>{dom2}</React.Fragment>
}

class Controller extends React.PureComponent<ControllerProps, { data: any }> {
  constructor(props: ControllerProps) {
    super(props);
    this.state = {
      data: props.data,
    };
  }
  UNSAFE_componentWillReceiveProps(nextProps: Readonly<ControllerProps>, nextContext: any): void {
    // eslint-disable-next-line
    const navigated = nextProps.location !== this.props.location;
    if (navigated) {
      window.scrollTo(0, 0);
      // save the location so we can render the old screen
      this.setState({
        data: undefined, // unless you want to keep it
      });
      // @ts-ignore
      const { data, match, routes, history, location, staticContext, ...rest } = nextProps;
      // 改路由V6
      // eslint-disable-next-line
      loadInitialProps(this.props.routes, nextProps.location.pathname, {
        location: nextProps.location,
        // history: newHistory,
        ...rest,
      }).then(({ data: newData, match: currentMatch }) => {
        const ismatch = matchPath(currentMatch.path, window.location.pathname);
        // @ts-ignore
        if (currentMatch && ismatch) {
          this.setState({ data: newData });
        }
      });
    }
  }

  render() {
    const { data } = this.state;
    const { routes, location, store, ...rest } = this.props;
    const inits: any = {
      ...rest,
      ...(data || {}),
      store,
      // history: newHistory,
      location,
      routes
    }
    return (<ChildRoutes {...inits} />);
  }
}

const WithRouters = (props: any) => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  return <Controller location={location} navigate={navigate} params={params} {...props} />
}

export default WithRouters
