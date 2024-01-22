// eslint-disable-next-line import/no-anonymous-default-export
export default {
    api: {
      root: process.env.REACT_APP_BACK_END_HOST ? process.env.REACT_APP_BACK_END_HOST : window.location.origin,
    },
    siteUrl: process.env.REACT_APP_PUBLIC_URL ? process.env.REACT_APP_PUBLIC_URL : '/',
    client: {
      basename: process.env.REACT_APP_BACK_END_SUBDIR ? process.env.REACT_APP_BACK_END_SUBDIR : "/"
    }
  };
  