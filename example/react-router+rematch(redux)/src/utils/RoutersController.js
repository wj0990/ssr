import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { loadInitialProps } from './loadInitialProps';

class Controller extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      previousLocation: null,
    };
    this.prefetcherCache = {};
  }
  componentWillReceiveProps(nextProps) {
    const navigated = nextProps.location !== this.props.location;
    if (navigated) {
      window.scrollTo(0, 0);
      // save the location so we can render the old screen
      this.setState({
        previousLocation: this.props.location,
        data: undefined, // unless you want to keep it
      });
    }
    const { match, routes, history, location, staticContext, ...rest } = nextProps;
    loadInitialProps(this.props.routes, nextProps.location.pathname, {
      location: nextProps.location,
      history: nextProps.history,
      ...rest,
    }).then(({ data }) => {
      this.setState({ previousLocation: null, data });
    }).catch((e) => {
      console.log(e); // eslint-disable-line
    });
  }
  prefetch = (pathname) => {
    loadInitialProps(this.props.routes, pathname, {
      history: this.props.history,
    }).then(({ data }) => {
      this.prefetcherCache = {
        ...this.prefetcherCache,
        [pathname]: data,
      };
    }).catch(e => console.log(e)); // eslint-disable-line
  }
  render() {
    const { previousLocation, data } = this.state;
    const { routes, location } = this.props;
    const initialData = this.prefetcherCache[location.pathname] || data;
    return (
      <Switch>
        {Object.keys(routes).map((path, idx) => (
          <Route
            path={path}
            exact={routes[path].exact}
            key={idx}
            location={previousLocation || location}
            render={props => (
              React.createElement(routes[path].component, {
                ...initialData,
                history: props.history,
                location: previousLocation || location,
                match: props.match,
                prefetch: this.prefetch,
              })
            )}
          />
        ))}
      </Switch>
    );
  }
}

export default withRouter(Controller);
