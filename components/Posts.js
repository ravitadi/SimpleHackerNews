const {Grid, Typography, Divider, TextField, Icon, Button, Dialog, DialogTitle, CircularProgress} = window['material-ui']

class Posts extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      error: false,
      loaded: false,
      comments: null,
      dialogOpen: false
    }
    this.filterPosts = this.filterPosts.bind(this);
    this.showMoreComments = this.showMoreComments.bind(this);
    this.closeDialog = this.closeDialog.bind(this);

  }

  async componentDidMount() {
    this.fetchPosts()
    .then(res => res.sort((prev,current) => current.score - prev.score ))
    .then(data => this.setState({loaded: true, posts: data, initalPosts: data}))
    .catch(err => this.setState({loaded: true}))
  }

  async fetchPosts() {
    let posts = []
    const {topPostsUrl, maxItemsToShow} = this.props
    try {
      posts = await (await fetch(topPostsUrl)).json()
      posts = posts && posts.length > 1 && posts.slice(0, maxItemsToShow) || posts
      return this.fetchPostsWithDetails(posts)
    } catch(err) {
      this.setState({error: true})
      throw err
    }
  }

  async fetchPostsWithDetails(posts) {
    const {singlePostUrl} = this.props
    return Promise.all(
       posts.map(postId => {
            return fetch(singlePostUrl.replace('$id', postId))
              .then(res => res.json())
              .catch(err => {
                console.error(err)
              })
        })
    ).catch(err => {
      console.error(err)
      throw err
    })
  }

  async getComments(ids) {
    return await Promise.all(ids.map((id) => {
      let comment = this.getSingleComment(id);
      return comment;
    }
    ))
  }

  async getSingleComment(id) {
    const {singlePostUrl} = this.props
    let jsonResponse = await (await fetch(singlePostUrl.replace('$id', id))).json();
    if (jsonResponse.kids) {
        return this.getComments(jsonResponse.kids)
        .then((response) =>{
          return <li key={jsonResponse.id}>
            <ol>{response}</ol></li>
        })
    } else {
      return this.getSingleCommentView(jsonResponse)
    }
  }

  getSingleCommentView(comment) {
    if (comment.deleted) {
      return null;
    }
    return <li key={comment.id}><p dangerouslySetInnerHTML={{__html: comment.text}}/></li>
  }

  showMoreComments(ids) {
    console.log(ids)

    this.getComments(ids).then(response => {
      this.setState({comments: response});
    });

    this.setState({ dialogOpen: true});
  }

  closeDialog() {

    this.setState({ dialogOpen: false, comments:null});
  }

  renderVenues(posts) {
    return posts.map(post =>
      <Grid item key={post.id} xs={12} sm={6} lg={4} xl={3}>
        <Post {...post} showComments={this.showMoreComments} />

      </Grid>
    )
  }

  filterPosts({target:{value}}) {
    const search = (posts) =>
      posts.filter((post) => post.title.toLowerCase().includes(value.toLowerCase()))

    this.setState((prevState) => {return {posts: search(prevState.initalPosts)}});
  }

  renderError() {
    return (
      <Typography variant="body1" gutterBottom>
              Oops, Currently we ran into a issue. Please, try again later.
      </Typography>
    )
  }

  render() {
    let {posts, error, loaded} = this.state;

    if (!loaded) {
      return null
    }

    if (error) {
      return this.renderError()
    }

    return (
      <section>
        <h1>Latest Hacker News</h1>
        <SearchFilter onSearchInputChange={this.filterPosts}/>
        <Comments comments={this.state.comments} open={this.state.dialogOpen} close={this.closeDialog}/>
        {posts.length > 0 ? (
            <Grid container spacing={32}>
              {this.renderVenues(posts)}
            </Grid>
        ):
        <Typography variant="display4" gutterBottom>
          Unable to find results. Reduce your search.
        </Typography>
      }
      </section>
    )
  }
}

const Post = (props) => {
    const {by, title, score, url, showComments, id, kids} = props;
    return (
      <div>
        <a href={url}>
          <h3>{title}</h3>
        </a>
        <p>By: {by}; score: {score}</p>
      <Button onClick={() => showComments(kids)}>See comments</Button>
      </div>
  )
}

const SearchFilter = (props) =>
  <TextField fullWidth
  type="search"
  autoFocus
  label="Search top rated posts..."
  margin="normal"
  onChange={props.onSearchInputChange} />

const Comments = (props) => {

  return <Dialog fullScreen={false} open={props.open} onClose={props.close}>
    <DialogTitle id="responsive-dialog-title">{"Comments"}</DialogTitle>
    {!props.comments ? <CircularProgress size={100} /> : <ol>{props.comments}</ol>}
  </Dialog>
}

Posts.defaultProps = {
  topPostsUrl: 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty',
  singlePostUrl: 'https://hacker-news.firebaseio.com/v0/item/$id.json?print=pretty',
  maxItemsToShow: 25
}

export default Posts
