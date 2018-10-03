import Posts from '/components/Posts'

const {
  Button,
  colors,
  createMuiTheme,
  CssBaseline,
  Divider,
  MuiThemeProvider,
  withStyles
} = window['material-ui'];

const theme = createMuiTheme({
  palette: {
    primary: {
      light: colors.purple[300],
      main: colors.purple[500],
      dark: colors.purple[700],
    },
    secondary: {
      light: colors.green[300],
      main: colors.green[500],
      dark: colors.green[700],
    },
  }
})

const styles = theme => ({
  root: {
    maxWidth: 900,
    margin: '0 auto'
  }
})

const Body = (props) => {
    const { classes } = props;
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Main className={classes.root} />
      </MuiThemeProvider>
    )
}

const Main = (props) =>
  <main {...props}>
    <Posts />
  </main>

const App = withStyles(styles)(Body);
export default App;
