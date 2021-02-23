export default {
  root: {
    width: '100%',
    backgroundColor: '#f3f4f8',
    paddingTop: 40,
    paddingBottom: 96,
  },

  header: {
    outer: {
      paddingBottom: 16,
    },

    inner: {
      height: 60,
    },

    logo: {
      paddingTop: 5,
      height: 48,
    },

    button: {
      textAlign: 'right',
      border: '1px solid #050038',
      display: 'inline',
      padding: '12px 16px',
      borderRadius: 8,
      float: 'right',
      textDecoration: 'none',
      color: '#050038',
      lineHeight: '14px',
    },
  },

  footer: {
    outer: {
      opacity: 0.7,
      paddingTop: 40,
      width: 600,
      maxWidth: 600,
      minWidth: 600,
      margin: '0 auto',
      textAlign: 'center',
      color: '#050038',
      fontSize: 12,
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    },
  },

  container: {
    outer: {
      width: 560,
      maxWidth: 560,
      minWidth: 560,
      margin: '0 auto',
    },
  },

  content: {
    outer: {
      borderRadius: 8,
      padding: '40px 32px',
      width: 560 - 2 * 32,
      maxWidth: 560 - 2 * 32,
      minWidth: 560 - 2 * 32,
      margin: '0 auto',
      background: 'white',
      borderBottom: '1px solid #e1e0e7',
    },
  },

  title: {
    color: '#050038',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontSize: 36,
    fontWeight: 500,
    lineHeight: 1.24,
  },

  paragraph: {
    paddingTop: 16,
    color: '#050038',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.4,
    opacity: 0.6,
  },

  code: {
    outer: {
      paddingTop: 32,
      paddingBottom: 16,
    },

    inner: {
      backgroundColor: '#f3f4f8',
      borderRadius: 8,
      color: '#050038',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      fontSize: 36,
      fontWeight: 500,
      height: 128,
      lineHeight: '128px',
      textAlign: 'center',
    },
  },

  callToAction: {
    outer: {
      paddingTop: 32,
      paddingBottom: 16,
      margin: '0 auto',
      textAlign: 'center',
    },

    inner: {
      background: '#3082ce',
      border: 'none',
      borderRadius: 8,
      color: '#fff',
      display: 'inline-block',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      fontSize: 18,
      fontWeight: 500,
      lineHeight: 1.43,
      outline: 0,
      padding: '18px 24px',
      textAlign: 'center',
      textDecoration: 'none',
    },
  },
};
